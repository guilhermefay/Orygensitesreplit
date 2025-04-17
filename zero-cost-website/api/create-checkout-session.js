const Stripe = require('stripe');
const { v4: uuidv4 } = require('uuid'); // Para gerar formId se necessário

// Inicializar o Stripe com a chave secreta do ambiente
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Função auxiliar para obter a URL base da aplicação
function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

module.exports = async (req, res) => {
  // Habilitar CORS para desenvolvimento e produção (ajuste conforme necessário)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ou especifique a origem do seu frontend
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { plan = 'monthly', formId: providedFormId, context = 'default' } = req.body;
    const formId = providedFormId || uuidv4(); 

    let unitAmount;
    let currency;
    let description;
    let finalSuccessUrl;
    const baseUrl = getBaseUrl(req);
    let baseSuccessUrl = `${baseUrl}/payment-success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}`;
    const cancelUrl = `${baseUrl}/#contact`; 

    console.log(`[Checkout Session] Received context: ${context}, plan: ${plan}, formId: ${formId}`);

    // Determinar Preço, Moeda e Descrição com base no contexto e plano
    switch (context) {
      case 'lp':
        currency = 'brl';
        unitAmount = 100; // R$ 1,00 TESTE
        description = `TESTE LP - ${plan === 'annual' ? 'Plano Anual' : 'Plano Mensal'} (R$ 1,00)`;
        finalSuccessUrl = `${baseSuccessUrl}&source=lp`; // Adiciona source=lp
        break;
      case 'variant2':
        currency = 'usd';
        if (plan === 'monthly') {
          unitAmount = 5000; // $50.00 USD
          description = 'Orygen Sites - Monthly Plan (USD)';
        } else if (plan === 'annual') {
          unitAmount = 23880; // $238.80 USD
          description = 'Orygen Sites - Annual Plan (USD)';
        } else {
          throw new Error(`Plano inválido '${plan}' para o contexto '${context}'.`);
        }
        finalSuccessUrl = baseSuccessUrl; // URL padrão
        break;
      case 'default':
      default: // Trata 'default' e qualquer outro caso como BRL padrão
        currency = 'brl';
        if (plan === 'monthly') {
          unitAmount = 4990; // R$ 49,90
          description = 'Orygen Sites - Plano Mensal';
        } else if (plan === 'annual') {
          unitAmount = 59880; // R$ 598,80
          description = 'Orygen Sites - Plano Anual';
        } else {
           throw new Error(`Plano inválido '${plan}' para o contexto '${context}'.`);
        }
        finalSuccessUrl = baseSuccessUrl; // URL padrão
        break;
    }
    
    console.log(`[Checkout Session] Calculated Price: ${unitAmount} ${currency.toUpperCase()}, Success URL: ${finalSuccessUrl}`);

    // Criar sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'], // Adicionar 'pix' se houver
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: finalSuccessUrl, // <<< Usar a URL final determinada
      cancel_url: cancelUrl,
      metadata: {
        plan: plan,
        formId: formId,
        context: context // <<< Adicionar contexto aos metadados também pode ser útil
      },
      locale: 'pt-BR',
      billing_address_collection: 'required',
      payment_method_options: {
        boleto: {
          expires_after_days: 3,
        },
      },
      allow_promotion_codes: true,
      // customer_email: req.body.email || undefined,
    });

    console.log(`[Checkout Session] Criada sessão ${session.id} para formId ${formId} com contexto ${context}`);
    res.status(200).json({ sessionId: session.id });

  } catch (error) {
    console.error('[Create Checkout Session] Erro:', error);
    res.status(500).json({ error: { message: error.message } });
  }
}; 