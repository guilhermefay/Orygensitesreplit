const Stripe = require('stripe');

// Inicializar o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Tratar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { plan, formId, variant } = req.query;
    
    // Links diretos do Stripe
    const stripeLinks = {
      // Links para a versão principal
      monthly: "https://buy.stripe.com/4gw4iJ7lf55d4HmfYZ",
      annual: "https://buy.stripe.com/5kA6qR8pj55dgq46oo",
      
      // Links para variant2
      monthlyVariant2: "https://buy.stripe.com/00geXn6hb0OX6PudQT",
      annualVariant2: "https://buy.stripe.com/cN24iJ6hbeFNc9OdQS"
    };
    
    // Determinar qual link usar
    const isVariant2 = variant === 'variant2';
    let redirectUrl = isVariant2 
      ? (plan === 'monthly' ? stripeLinks.monthlyVariant2 : stripeLinks.annualVariant2)
      : (plan === 'monthly' ? stripeLinks.monthly : stripeLinks.annual);
    
    // Adicionar parâmetros de customização para o Stripe
    if (formId) {
      // Adicionar o formId como parâmetro de cliente
      redirectUrl += `?client_reference_id=${formId}`;
      
      // Adicionar o domínio atual como success_url e cancel_url
      const baseUrl = req.headers.host.includes('localhost') 
        ? 'http://localhost:5000' 
        : `https://${req.headers.host}`;
        
      console.log('[CHECKOUT DIRECT] Host detectado:', req.headers.host);
      console.log('[CHECKOUT DIRECT] URL base:', baseUrl);
      
      // Verificar se está sendo usado um domínio personalizado
      const isCustomDomain = !req.headers.host.includes('replit') && !req.headers.host.includes('localhost');
      
      // Para domínios personalizados, usar uma abordagem diferente para os callbacks
      if (isCustomDomain) {
        console.log('[CHECKOUT DIRECT] Domínio personalizado detectado:', req.headers.host);
        console.log('[CHECKOUT DIRECT] Usando URLs de callback especiais para domínio personalizado');
        
        // Ajustar o formato da URL de sucesso para o domínio personalizado
        redirectUrl += `&success_url=${encodeURIComponent(`${baseUrl}/success?formId=${formId}&sessionId={CHECKOUT_SESSION_ID}&plan=${plan || 'monthly'}`)}`;
        redirectUrl += `&cancel_url=${encodeURIComponent(`${baseUrl}/?canceled=true`)}`;
        
        // Salvar no localStorage para persistência temporária (tentativa de manter referência)
        console.log('[CHECKOUT DIRECT] Usando estratégia de domínio personalizado');
      } else {
        // Para domínios padrão, usar o callback de processamento
        console.log('[CHECKOUT DIRECT] Usando abordagem padrão para callbacks');
        redirectUrl += `&success_url=${encodeURIComponent(`${baseUrl}/api/process-payment-success?formId=${formId}&plan=${plan || 'monthly'}`)}`;
        redirectUrl += `&cancel_url=${encodeURIComponent(`${baseUrl}/?canceled=true`)}`;
      }
    }
    
    console.log(`[STRIPE DIRECT] Redirecionando para: ${redirectUrl} (${plan}, variant2: ${isVariant2})`);
    console.log(`[STRIPE DIRECT] FormId incluído: ${formId}`);
    
    // Redirecionar para a URL do Stripe
    return res.redirect(303, redirectUrl);
  } catch (error) {
    console.error('[STRIPE DIRECT] Erro:', error);
    return res.status(500).json({ error: 'Erro ao redirecionar para o Stripe' });
  }
};