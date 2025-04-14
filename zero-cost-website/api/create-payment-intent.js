const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Implementação local de UUID para testes no Replit (será substituída pelo pacote uuid na Vercel)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// No deploy da Vercel, descomente a linha abaixo e comente a implementação acima:
// const { v4: uuidv4 } = require('uuid');

// Validar Variáveis de Ambiente Essenciais
const stripeKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.SUPABASE_URL;

// Para ambientes locais como Replit, usa SUPABASE_KEY; para Vercel, usa SUPABASE_SERVICE_KEY
// IMPORTANTE: Garanta que SUPABASE_SERVICE_KEY contém sua chave SERVICE ROLE secreta do Supabase nas variáveis de ambiente da Vercel
let supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseServiceKey && process.env.SUPABASE_KEY) {
  console.log('[CONFIG] Usando SUPABASE_KEY no ambiente de desenvolvimento. Para produção, configure SUPABASE_SERVICE_KEY');
  supabaseServiceKey = process.env.SUPABASE_KEY; // Fallback para desenvolvimento
}

// Verificações necessárias
if (!stripeKey) {
  console.error('[FATAL] STRIPE_SECRET_KEY não configurada');
}
if (!supabaseUrl) {
  console.error('[FATAL] SUPABASE_URL não configurada');
}
if (!supabaseServiceKey) {
  console.error('[FATAL] Nem SUPABASE_SERVICE_KEY nem SUPABASE_KEY estão configuradas');
}

// Em ambientes de desenvolvimento (como Replit), podemos continuar mesmo sem todas as variáveis
// Mas em produção (Vercel), garantimos a configuração completa
if (process.env.NODE_ENV === 'production' && (!stripeKey || !supabaseUrl || !supabaseServiceKey)) {
  console.error('[FATAL] Variáveis de ambiente essenciais não configuradas no ambiente de produção');
  module.exports = (req, res) => {
     res.status(500).json({ error: 'Internal Server Configuration Error' });
  };
  throw new Error('Variáveis de ambiente essenciais não configuradas para produção.');
}

// Inicializar Clientes FORA do handler para reutilização (melhor performance)
const stripe = new Stripe(stripeKey);
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey); // Usar Service Role Key

console.log('[CONFIG] Clientes Stripe e Supabase inicializados.');

// Função Handler para Vercel
module.exports = async (req, res) => {
  // Habilitar CORS - Simplificado (Vercel pode lidar com OPTIONS automaticamente)
  // Permitir apenas a origem do seu site em produção é mais seguro
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? 'https://www.orygensites.com' // <-- SUBSTITUA pelo seu domínio de produção real
    : '*'; // Permite localhost e outros em desenvolvimento/preview
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
    // Usar return aqui para parar a execução
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { plan, formData } = req.body;

    if (!plan || !formData) {
      console.error('[PAYMENT INTENT] Dados insuficientes:', { plan: !!plan, formData: !!formData });
      // Usar return aqui
      return res.status(400).json({ error: 'plan e formData são obrigatórios' });
    }

    console.log('[PAYMENT INTENT] Dados recebidos:', { plan, formDataKeys: Object.keys(formData) });

    // Validação Mínima (Pode ser mais robusta)
    if (!formData.name || !formData.email || !formData.phone || !formData.business || !formData.businessDetails) {
      console.error('[PAYMENT INTENT] Dados de formulário incompletos:', formData);
       // Usar return aqui
      return res.status(400).json({ error: 'Dados de formulário incompletos' });
    }

    // 1. Calcular valor e descrição
    let amount;
    let description;
    let currency = 'brl'; // Padrão BRL

    // Lógica de preço (igual à anterior, mas mais limpa)
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
        amount = 89900; // R$ 899,00
        description = 'Plano Anual - Website Profissional';
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
         // Usar return aqui
        return res.status(400).json({ error: 'Plano desconhecido' });
    }

    console.log(`[PAYMENT INTENT] Calculado: ${amount} ${currency.toUpperCase()} para plano ${plan}`);

    // 2. Salvar no Supabase
    const formId = uuidv4(); // Usar pacote uuid
    console.log('[PAYMENT INTENT] ID gerado:', formId);

    const supabaseData = {
      id: formId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      business: formData.business,
      business_details: formData.businessDetails, // Usar o nome corrigido
      // original_form_id: formData.original_form_id || formId, // Remover se não for usado
      selected_plan: plan,
      payment_status: 'pending_payment',
      payment_id: null, // Será atualizado pelo webhook
      payment_date: null, // Será atualizado pelo webhook
      created_at: new Date().toISOString(),
      // Adicionar quaisquer outros campos relevantes do formData
      // Ex: industry: formData.industry, goals: formData.goals, etc.
    };

    console.log('[PAYMENT INTENT] Salvando no Supabase:', { id: formId, plan });

    const { data: insertedData, error: supabaseError } = await supabaseClient
      .from('form_submissions') // Confirme se o nome da tabela está correto
      .insert(supabaseData)
      .select(); // select() pode não ser necessário ou retornar o inserido dependendo da config

    if (supabaseError) {
      console.error('[PAYMENT INTENT] Erro Supabase:', supabaseError);
       // Usar return aqui
      return res.status(500).json({ error: 'Erro ao salvar dados', details: supabaseError.message });
    }

    console.log('[PAYMENT INTENT] Dados salvos no Supabase:', insertedData ? 'Sucesso' : 'Falha (verificar RLS/políticas)');

    // 3. Criar PaymentIntent no Stripe
    console.log('[PAYMENT INTENT] Criando Payment Intent no Stripe...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ['card'], // Ou adicione outros métodos se habilitados
      metadata: {
        formId: formId, // Vincular ao ID do formulário no Supabase
        // Adicionar outros metadados úteis, se necessário
        plan: plan,
        business_name: formData.business,
      },
      description: description, // Descrição para o cliente no extrato
    });

    console.log('[PAYMENT INTENT] Payment Intent criado:', { id: paymentIntent.id });

    // 4. Responder ao Frontend
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      formId: formId, // Enviar o ID do formulário para o frontend usar (ex: na página de sucesso)
      amount: amount // Pode ser útil para confirmação no frontend
    });

  } catch (error) {
    console.error('[PAYMENT INTENT] Erro inesperado:', error);
    // Usar return aqui
    return res.status(500).json({
      error: 'Erro interno do servidor',
      // Não exponha stack trace em produção
      message: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
};