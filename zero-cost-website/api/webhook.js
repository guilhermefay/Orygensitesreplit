const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { buffer } = require('micro');

// Configurar cliente Supabase
const SUPABASE_URL_FALLBACK = "https://gltluwhobeprwfzzcmzw.supabase.co";
const SUPABASE_KEY_FALLBACK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdGx1d2hvYmVwcndmenpjbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjQ3MDUsImV4cCI6MjA1NjgwMDcwNX0.gzJXXUnB5THokP6yEAIHM65IOCNWGcKGAN7iKbWegws";

let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_KEY; // Usar a chave ANON pública aqui
let usingFallback = false;

if (!supabaseUrl) {
  console.warn('[SUPABASE FALLBACK] Variável SUPABASE_URL não encontrada, usando fallback.');
  supabaseUrl = SUPABASE_URL_FALLBACK;
  usingFallback = true;
}

if (!supabaseKey) {
  console.warn('[SUPABASE FALLBACK] Variável SUPABASE_KEY não encontrada, usando fallback (chave ANON).');
  supabaseKey = SUPABASE_KEY_FALLBACK;
  usingFallback = true;
}

// Verificar se temos valores válidos após tentar ler do env e do fallback
if (!supabaseUrl || !supabaseKey) {
  console.error('[SUPABASE FATAL] URL ou Chave Supabase inválidas mesmo após fallback. Impossível continuar.');
  throw new Error('Configuração inválida do Supabase.'); 
}

if (usingFallback) {
    console.warn('[SUPABASE FALLBACK] Usando URL/Key Supabase fallback hardcoded!');
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);
console.log('[SUPABASE CONFIG] Cliente Supabase criado com sucesso.');

// Inicializar o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Chave secreta para webhook
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Exportar uma função async para poder usar await buffer(req)
module.exports = async (req, res) => {
  // Apenas aceitar POST para webhooks
  if (req.method !== 'POST') {
    // Retornar Allow header para OPTIONS ou outros métodos
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Obter o corpo bruto da requisição
  const buf = await buffer(req);
  const signature = req.headers['stripe-signature'];
  let event;
  
  try {
    // Verificar assinatura se temos uma chave secreta
    if (endpointSecret) {
      try {
        // Usar o buffer obtido com a biblioteca micro
        event = stripe.webhooks.constructEvent(buf, signature, endpointSecret);
      } catch (err) {
        console.error(`[WEBHOOK] Erro na assinatura: ${err.message}`);
        // Retornar 400 se a assinatura for inválida
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }
    } else {
      // Para ambiente de desenvolvimento sem assinatura verificada
      // Parsear o buffer como JSON
      console.warn('[WEBHOOK] Verificação de assinatura desabilitada (sem endpointSecret).');
      event = JSON.parse(buf.toString('utf8'));
    }
    
    console.log(`[WEBHOOK] Evento recebido e verificado: ${event.type}`);
    
    // Tratar eventos específicos
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log(`[WEBHOOK] Checkout Session Completed: ${session.id}`);

        if (session.payment_status === 'paid') {
            console.log(`[WEBHOOK] Pagamento confirmado para sessão: ${session.id}`);
            if (session.metadata && session.metadata.formId) {
                const formId = session.metadata.formId;
                const paymentIntentId = session.payment_intent;

                console.log(`[WEBHOOK] Associado ao formId: ${formId}, PaymentIntent: ${paymentIntentId}`);

                const { data, error } = await supabaseClient
                    .from('form_submissions')
                    .update({
                        payment_status: 'paid',
                        payment_id: paymentIntentId || session.id,
                        payment_date: new Date().toISOString()
                    })
                    .eq('id', formId)
                    .select();

                if (error) {
                    console.error(`[WEBHOOK] Erro ao atualizar Supabase para formId ${formId}: ${error.message}`);
                } else {
                    console.log(`[WEBHOOK] Atualizado com sucesso no Supabase para formId: ${formId}`);
                }
            } else {
                console.warn(`[WEBHOOK] Checkout Session ${session.id} completada sem formId nos metadados.`);
            }
        } else {
             console.log(`[WEBHOOK] Checkout Session ${session.id} completada com status: ${session.payment_status}`);
        }
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`[WEBHOOK] PaymentIntent bem-sucedido: ${paymentIntent.id}`);
        
        // Verificar se temos o formId nos metadados
        if (paymentIntent.metadata && paymentIntent.metadata.formId) {
          const formId = paymentIntent.metadata.formId;
          
          // Atualizar o status no Supabase
          const { data, error } = await supabaseClient
            .from('form_submissions')
            .update({
              payment_status: 'paid',
              payment_id: paymentIntent.id,
              payment_date: new Date().toISOString()
            })
            .eq('id', formId)
            .select();
            
          if (error) {
            console.error(`[WEBHOOK] Erro ao atualizar Supabase: ${error.message}`);
          } else {
            console.log(`[WEBHOOK] Atualizado com sucesso no Supabase: ${formId}`);
          }
        } else {
          console.log('[WEBHOOK] Sem formId nos metadados.');
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        console.log(`[WEBHOOK] Falha no pagamento: ${failedPaymentIntent.id}`);
        
        // Verificar se temos o formId nos metadados
        if (failedPaymentIntent.metadata && failedPaymentIntent.metadata.formId) {
          const formId = failedPaymentIntent.metadata.formId;
          
          // Atualizar o status no Supabase
          const { data, error } = await supabaseClient
            .from('form_submissions')
            .update({
              payment_status: 'failed',
              payment_id: failedPaymentIntent.id,
              payment_date: new Date().toISOString()
            })
            .eq('id', formId)
            .select();
            
          if (error) {
            console.error(`[WEBHOOK] Erro ao atualizar Supabase: ${error.message}`);
          } else {
            console.log(`[WEBHOOK] Status de falha atualizado: ${formId}`);
          }
        } else {
          console.log('[WEBHOOK] Sem formId nos metadados.');
        }
        break;
        
      // Adicionar mais casos conforme necessário
      default:
        // Apenas logar o evento não tratado
        console.log(`[WEBHOOK] Evento não tratado: ${event.type}`);
    } // Fim do switch
    
    // Retornar uma resposta 200 para Stripe confirmar recebimento
    res.status(200).json({ received: true });
    
  } catch (err) {
    // Captura erros gerais (ex: falha ao parsear JSON se a assinatura for pulada)
    console.error(`[WEBHOOK] Erro inesperado no processamento: ${err.message}`);
    res.status(500).json({ error: `Webhook Processing Error: ${err.message}` });
  }
}; // Fim da função exportada