const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Inicializar o Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
console.log(`[STRIPE] Chave configurada? ${!!stripeKey}`);
const stripe = new Stripe(stripeKey);

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Logar informações de diagnóstico sobre as variáveis
console.log('[SUPABASE CONFIG] URL configurada:', !!supabaseUrl ? 'Sim' : 'Não');
console.log('[SUPABASE CONFIG] Key configurada:', !!supabaseKey ? 'Sim' : 'Não');

// Usar valores padrão caso as variáveis de ambiente não estejam disponíveis
const finalSupabaseUrl = supabaseUrl || 'https://gltluwhobeprwfzzcmzw.supabase.co';
const finalSupabaseKey = supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdGx1d2hvYmVwcndmenpjbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjQ3MDUsImV4cCI6MjA1NjgwMDcwNX0.gzJXXUnB5THokP6yEAIHM65IOCNWGcKGAN7iKbWegws';

// Criar o cliente com os valores finais
const supabaseClient = createClient(finalSupabaseUrl, finalSupabaseKey);
console.log('[SUPABASE CONFIG] Cliente criado com sucesso');

// Função para gerar UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
    // Extrair dados do corpo da requisição
    const { plan, formData } = req.body;
    
    if (!plan || !formData) {
      console.error('[CREATE PAYMENT INTENT] Dados insuficientes:', { 
        planRecebido: !!plan, 
        formDataRecebido: !!formData 
      });
      return res.status(400).json({ error: 'plan e formData são obrigatórios' });
    }

    console.log('[CREATE PAYMENT INTENT] Dados recebidos:', { 
      plan, 
      formDataKeys: Object.keys(formData) 
    });

    // Verificar dados mínimos do formulário
    if (!formData.name || !formData.email || !formData.phone || !formData.business) {
      console.error('[CREATE PAYMENT INTENT] Dados de formulário incompletos:', formData);
      return res.status(400).json({ error: 'Dados de formulário incompletos' });
    }

    // 1. Calcular o valor com base no plano
    let amount;
    let description;
    let currency = 'brl';

    // Definir valores com base no plano
    if (plan === 'test') {
      // Plano de teste - valor mínimo para Stripe (R$ 1,00)
      amount = 100; // 100 centavos = R$ 1,00
      description = 'Pagamento de teste - R$ 1,00';
    } else if (plan === 'monthly') {
      amount = 9900; // 9900 centavos = R$ 99,00
      description = 'Plano Mensal - Website Profissional';
    } else if (plan === 'annual') {
      amount = 89900; // 89900 centavos = R$ 899,00
      description = 'Plano Anual - Website Profissional';
    } else if (plan === 'promotion') {
      amount = 49900; // 49900 centavos = R$ 499,00
      description = 'Promoção Especial - Website Profissional';
    } else if (plan === 'promotion_usd') {
      amount = 9900; // 9900 centavos = $99 USD
      currency = 'usd';
      description = 'Special Promotion - Professional Website';
    } else {
      console.error('[CREATE PAYMENT INTENT] Plano desconhecido:', plan);
      return res.status(400).json({ error: 'Plano desconhecido' });
    }

    console.log(`[CREATE PAYMENT INTENT] Calculado valor ${amount} centavos para plano ${plan}`);

    // 2. Salvar dados no Supabase com status 'pending_payment'
    const formId = uuidv4();
    console.log('[CREATE PAYMENT INTENT] ID gerado para o formulário:', formId);

    const supabaseData = {
      id: formId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      business: formData.business,
      business_details: formData.business_details || '',
      original_form_id: formData.original_form_id || formId,
      selected_plan: plan,
      payment_status: 'pending_payment',
      payment_id: null,
      payment_date: null,
      created_at: new Date().toISOString()
    };

    console.log('[CREATE PAYMENT INTENT] Salvando dados no Supabase:', {
      id: supabaseData.id,
      business: supabaseData.business,
      plan: supabaseData.selected_plan
    });

    const { data: insertedData, error: supabaseError } = await supabaseClient
      .from('form_submissions')
      .insert(supabaseData)
      .select();

    if (supabaseError) {
      console.error('[CREATE PAYMENT INTENT] Erro ao salvar no Supabase:', supabaseError);
      return res.status(500).json({ error: 'Erro ao salvar dados do formulário', details: supabaseError.message });
    }

    console.log('[CREATE PAYMENT INTENT] Dados salvos no Supabase com sucesso:', insertedData);

    // 3. Criar PaymentIntent no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ['card'],
      metadata: {
        formId: formId,
        plan: plan,
        business: formData.business
      },
      description: description
    });

    console.log('[CREATE PAYMENT INTENT] PaymentIntent criado com sucesso:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      clientSecret: paymentIntent.client_secret ? 'Gerado' : 'Não gerado'
    });

    // 4. Responder com o clientSecret e o formId
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      formId: formId,
      amount: amount
    });

  } catch (error) {
    console.error('[CREATE PAYMENT INTENT] Erro:', error);
    return res.status(500).json({
      error: 'Erro ao processar solicitação',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};