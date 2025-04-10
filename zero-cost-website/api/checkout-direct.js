import Stripe from 'stripe';

// Inicializar o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
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
    const redirectUrl = isVariant2 
      ? (plan === 'monthly' ? stripeLinks.monthlyVariant2 : stripeLinks.annualVariant2)
      : (plan === 'monthly' ? stripeLinks.monthly : stripeLinks.annual);
    
    console.log(`[STRIPE DIRECT] Redirecionando para: ${redirectUrl} (${plan}, variant2: ${isVariant2})`);
    
    // Redirecionar para a URL do Stripe
    return res.redirect(303, redirectUrl);
  } catch (error) {
    console.error('[STRIPE DIRECT] Erro:', error);
    return res.status(500).json({ error: 'Erro ao redirecionar para o Stripe' });
  }
};