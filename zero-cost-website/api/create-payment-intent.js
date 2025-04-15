const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid'); // Importar v4 do pacote uuid

// Validar Variáveis de Ambiente Essenciais
const stripeKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
// IMPORTANTE: Garanta que SUPABASE_SERVICE_KEY contém sua chave SERVICE ROLE secreta do Supabase nas variáveis de ambiente da Vercel
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('[FATAL] Variáveis de ambiente essenciais (Stripe ou Supabase) não configuradas.');
  // Para Vercel, retornar erro 500 é apropriado
  module.exports = (req, res) => {
     res.status(500).json({ error: 'Internal Server Configuration Error' });
  };
  throw new Error('Variáveis de ambiente essenciais não configuradas.');
}

// Inicializar Clientes FORA do handler para reutilização (melhor performance)
const stripe = new Stripe(stripeKey);
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey); // Usar Service Role Key

console.log('[CONFIG] Clientes Stripe e Supabase inicializados.');

// Função Handler para Vercel
module.exports = async (req, res) => {
  // Habilitar CORS - Simplificado
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? 'https://www.orygensites.com' // <-- SUBSTITUA pelo seu domínio de produção real se for diferente
    : '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratar preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { plan, formData } = req.body;

    if (!plan || !formData) {
      console.error('[PAYMENT INTENT] Dados insuficientes:', { plan: !!plan, formData: !!formData });
      return res.status(400).json({ error: 'plan e formData são obrigatórios' });
    }

    console.log('[PAYMENT INTENT] Dados recebidos:', { plan, formDataKeys: Object.keys(formData) });

    // Validação Mínima - Apenas dados da primeira etapa
    if (!formData.name || !formData.email || !formData.phone) {
      console.error('[PAYMENT INTENT] Dados de formulário iniciais incompletos:', formData);
      return res.status(400).json({ error: 'Dados de formulário incompletos (nome, email, telefone)' });
    }

    // 1. Calcular valor e descrição
    let amount;
    let description;
    let currency = 'brl'; // Padrão BRL

    switch (plan) {
      case 'test':
        amount = 100; // R$ 1,00
        description = 'Pagamento de teste - R$ 1,00';
        break;
      case 'monthly':
        amount = 9900; // R$ 99,00
        description = 'Plano Mensal - Website Profissional';
        break;
      case 'annual':
        amount = 100; // R$ 1,00 (ALTERADO PARA TESTE)
        description = 'Plano Anual - Website Profissional (TESTE)';
        break;
      case 'promotion':
        amount = 49900; // R$ 499,00
        description = 'Promoção Especial - Website Profissional';
        break;
      case 'promotion_usd':
        amount = 9900; // $99 USD
        currency = 'usd';
        description = 'Special Promotion - Professional Website';
        break;
      default:
        console.error('[PAYMENT INTENT] Plano desconhecido:', plan);
        return res.status(400).json({ error: 'Plano desconhecido' });
    }

    console.log(`[PAYMENT INTENT] Calculado: ${amount} ${currency.toUpperCase()} para plano ${plan}`);

    // Gere o formId ANTES de criar o PaymentIntent
    const formId = uuidv4();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        formId: formId, // Adicione o formId nos metadados
        plan: plan,
        business_name: formData.business || 'N/A',
      },
      description: description,
    });

    console.log('[PAYMENT INTENT] Payment Intent criado:', { id: paymentIntent.id });

    // Só salvar no Supabase se o pagamento for aprovado
    if (paymentIntent.status === 'succeeded') {
      const supabaseData = {
        id: formId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        business: formData.business,
        business_details: formData.businessDetails, // Usar o nome corrigido
        selected_plan: plan,
        payment_status: 'paid',
        payment_id: paymentIntent.id,
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        // Adicionar outros campos se necessário
      };

      console.log('[PAYMENT INTENT] Salvando no Supabase:', { id: formId, plan });

      const { data: insertedData, error: supabaseError } = await supabaseClient
        .from('form_submissions') // Confirme o nome da tabela
        .insert(supabaseData)
        .select();

      if (supabaseError) {
        console.error('[PAYMENT INTENT] Erro Supabase:', supabaseError);
        return res.status(500).json({ error: 'Erro ao salvar dados', details: supabaseError.message });
      }

      console.log('[PAYMENT INTENT] Dados salvos no Supabase:', insertedData ? 'Sucesso' : 'Falha (verificar RLS/políticas)');
    }

    // 4. Responder ao Frontend
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      formId: formId, // Retorne o mesmo formId gerado
      amount: amount
    });

  } catch (error) {
    console.error('[PAYMENT INTENT] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
};