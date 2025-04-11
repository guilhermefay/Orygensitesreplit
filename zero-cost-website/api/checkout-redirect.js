const Stripe = require('stripe');
const { formDataStorage, saveStorage } = require('./shared-storage');

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
    const { amount, currency = 'brl', plan, formId, test } = req.query;
    
    if (!amount || !plan) {
      return res.status(400).json({ error: 'amount e plan são obrigatórios' });
    }
    
    // Criar descrição
    let description;
    if (test === 'true') {
      description = 'TESTE - R$ 1,00 - Zero Cost Website';
    } else {
      description = plan === 'annual' 
        ? 'Plano Anual - Zero Cost Website' 
        : 'Plano Mensal - Zero Cost Website';
    }
    
    // Construir URLs de retorno
    const host = req.headers.host || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    // Atualizado para usar a rota /api/process-payment-success
    const successUrl = `${protocol}://${host}/api/process-payment-success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}&plan=${plan}${test ? '&test=true' : ''}`;
    // Mantém a página de cancelamento original
    const cancelUrl = `${protocol}://${host}?success=false`;
    
    // Criar sessão
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: description,
          },
          unit_amount: Number(amount),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan,
        formId: formId || 'unknown',
        source: 'checkout-redirect',
        test: test ? 'true' : 'false'
      },
    });
    
    console.log('[STRIPE REDIRECT] Sessão criada com sucesso, redirecionando para:', session.url);
    
    // Redirecionar para Stripe
    return res.redirect(303, session.url);
  } catch (error) {
    console.error('[STRIPE REDIRECT] Erro ao criar sessão:', error);
    return res.status(500).json({ error: error.message });
  }
};