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

module.exports = async (req, res) => {
  // Apenas aceitar POST para webhooks
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let event;
  
  try {
    // Verificar assinatura se temos uma chave secreta
    if (endpointSecret) {
      // Dado que req.body já está processado como JSON no Express,
      // precisamos obter os dados brutos para verificar assinatura
      // Este trecho assume que rawBody foi capturado antes da análise JSON
      const signature = req.headers['stripe-signature'];
      
      try {
        if (!req.rawBody) {
          // Se não temos rawBody, podemos estar usando o middleware normal do Express
          // e precisamos obter os dados brutos de outra forma
          // Nota: Isso precisa ser configurado no Express antes de análise de JSON
          return res.status(400).json({ error: 'Webhook requires raw body. Please use the appropriate middleware.' });
        }
        
        event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
      } catch (err) {
        console.error(`[WEBHOOK] Erro na assinatura: ${err.message}`);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }
    } else {
      // Para ambiente de desenvolvimento sem assinatura verificada
      event = req.body;
    }
    
    console.log(`[WEBHOOK] Evento recebido: ${event.type}`);
    
    // Tratar eventos específicos
    switch (event.type) {
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
        console.log(`[WEBHOOK] Evento não tratado: ${event.type}`);
    }
    
    // Retornar uma resposta para confirmar recebimento
    return res.status(200).json({ received: true });
    
  } catch (err) {
    console.error(`[WEBHOOK] Erro: ${err.message}`);
    return res.status(500).json({ error: `Webhook Error: ${err.message}` });
  }
};