const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Inicializar o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Tratar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { paymentIntentId, formId } = req.body;

    if (!paymentIntentId || !formId) {
      console.error('[UPDATE PAYMENT STATUS] Dados insuficientes:', { 
        paymentIntentId: !!paymentIntentId, 
        formId: !!formId 
      });
      return res.status(400).json({ error: 'paymentIntentId e formId são obrigatórios' });
    }

    console.log('[UPDATE PAYMENT STATUS] Verificando pagamento:', { paymentIntentId, formId });

    // 1. Verificar o status do pagamento no Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('[UPDATE PAYMENT STATUS] Status do pagamento:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount
    });

    if (paymentIntent.status !== 'succeeded') {
      console.error('[UPDATE PAYMENT STATUS] Pagamento não foi concluído:', paymentIntent.status);
      return res.status(400).json({ 
        error: 'Pagamento não foi concluído', 
        status: paymentIntent.status 
      });
    }

    // 2. Atualizar o status do pagamento no Supabase
    console.log('[UPDATE PAYMENT STATUS] Atualizando registro no Supabase:', formId);

    const { data, error } = await supabaseClient
      .from('form_submissions')
      .update({ 
        payment_status: 'paid',
        payment_id: paymentIntentId,
        payment_date: new Date().toISOString()
      })
      .eq('id', formId)
      .select();

    if (error) {
      console.error('[UPDATE PAYMENT STATUS] Erro ao atualizar Supabase:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar status do pagamento', 
        details: error.message 
      });
    }

    console.log('[UPDATE PAYMENT STATUS] Atualização bem-sucedida:', data);

    // 3. Retornar sucesso
    return res.status(200).json({
      success: true,
      status: 'paid',
      formId: formId,
      paymentIntentId: paymentIntentId,
      amount: paymentIntent.amount,
      business: data && data.length > 0 ? data[0].business : null
    });

  } catch (error) {
    console.error('[UPDATE PAYMENT STATUS] Erro:', error);
    return res.status(500).json({
      error: 'Erro ao processar atualização de pagamento',
      message: error.message
    });
  }
};