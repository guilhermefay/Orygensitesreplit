const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Validar Variáveis de Ambiente Essenciais
const stripeKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Precisa da Service Role Key

if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('[FINALIZE SUBMISSION][FATAL] Variáveis de ambiente essenciais não configuradas.');
  module.exports = (req, res) => {
     res.status(500).json({ error: 'Internal Server Configuration Error' });
  };
  throw new Error('Variáveis de ambiente essenciais não configuradas.');
}

// Inicializar Clientes
const stripe = new Stripe(stripeKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey); 

console.log('[FINALIZE SUBMISSION][CONFIG] Clientes Stripe e Supabase inicializados.');

// Função Handler para Vercel
module.exports = async (req, res) => {
  // CORS Headers
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? 'https://www.orygensites.com' // Ajuste se necessário
    : '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { formId, paymentIntentId } = req.body;

    if (!formId || !paymentIntentId) {
      console.error('[FINALIZE SUBMISSION] Dados insuficientes:', { formId: !!formId, paymentIntentId: !!paymentIntentId });
      return res.status(400).json({ error: 'formId e paymentIntentId são obrigatórios' });
    }

    console.log('[FINALIZE SUBMISSION] Recebido:', { formId, paymentIntentId });

    // 1. Verificar o status do Payment Intent no Stripe (usando a chave secreta)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      console.log('[FINALIZE SUBMISSION] Payment Intent verificado como sucedido. Atualizando Supabase...');
      
      // 2. Atualizar o registro no Supabase
      const { data, error } = await supabase
        .from('form_submissions') 
        .update({ 
            payment_status: 'paid', 
            payment_id: paymentIntentId,
            // Poderíamos também atualizar outros campos se necessário, 
            // mas nome/email/telefone já deveriam estar lá da criação inicial?
            // Se não, precisaríamos passá-los do frontend também.
            // Assumindo que já existem, vamos apenas atualizar o status.
        })
        .eq('id', formId)
        .select(); // Opcional: retornar o dado atualizado

      if (error) {
        console.error('[FINALIZE SUBMISSION] Erro ao atualizar Supabase:', error);
        // Não retornar erro 500 necessariamente, pois o pagamento JÁ ocorreu.
        // Logar o erro é importante, mas podemos retornar sucesso para o frontend 
        // para ele mostrar a tela de sucesso, e investigar o erro do Supabase depois.
        // Ou podemos tentar novamente/colocar em fila.
        // Por simplicidade agora, vamos logar e continuar.
      } else {
        console.log('[FINALIZE SUBMISSION] Supabase atualizado com sucesso:', data);
      }
      
      // Retornar sucesso mesmo se Supabase der erro (pagamento OK é o mais importante pro fluxo)
      return res.status(200).json({ success: true, message: 'Pagamento verificado e tentativa de salvar dados realizada.' });

    } else {
      // Se o status não for 'succeeded' (o que não deveria acontecer se o frontend chamou corretamente)
      console.warn('[FINALIZE SUBMISSION] Alerta: Status do Payment Intent NÃO é sucedido:', paymentIntent.status);
      return res.status(400).json({ error: 'Status do pagamento não confirmado como sucedido.', status: paymentIntent.status });
    }

  } catch (error) {
    console.error('[FINALIZE SUBMISSION] Erro inesperado:', error);
    // Verificar se o erro é do Stripe ou outro
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    const statusCode = error.statusCode || 500; // Usar statusCode do erro Stripe se disponível
    return res.status(statusCode).json({ error: errorMessage });
  }
}; 