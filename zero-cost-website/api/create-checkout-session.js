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

  if (req.method === 'POST') {
    try {
      // Receber plan, formId e o novo campo 'context'
      const { plan = 'monthly', formId: providedFormId, context = 'default' } = req.body; 
      const formId = providedFormId || uuidv4(); // Garantir formId

      console.log(`[Checkout Session] Request received: plan=${plan}, context=${context}, formId=${formId}`);

      let currency = 'brl';
      let unitAmount = 0;
      let description = '';
      let successUrl = '';
      const baseUrl = getBaseUrl(req);
      const cancelUrl = `${baseUrl}/#contact`; // Mantém o mesmo cancel url por enquanto

      // --- Definir Preço, Moeda, Descrição e Success URL baseado no Contexto --- 
      if (context === 'lp') {
        // Contexto LP (Médicos) - Preço de Teste
        currency = 'brl';
        unitAmount = 100; // R$ 1,00 para teste (confirmado)
        description = `TESTE - Orygen Médicos - ${plan === 'annual' ? 'Plano Anual' : 'Plano Mensal'}`;
        successUrl = `${baseUrl}/payment-success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}&source=lp`;
        console.log(`[Checkout Session] Context 'lp' detected. Using test price (1 BRL) and success URL with source=lp.`);
        
      } else if (context === 'variant2') {
        // Contexto Variant2 (Dólar)
        currency = 'usd';
        // Valores USD confirmados
        const usdMonthlyPriceCents = 5000; // $50.00
        const usdAnnualPriceCents = 23880; // $238.80
        
        if (plan === 'annual') {
          description = 'Orygen Sites - Annual Plan';
          unitAmount = usdAnnualPriceCents; 
        } else {
          description = 'Orygen Sites - Monthly Plan';
          unitAmount = usdMonthlyPriceCents; 
        }
        successUrl = `${baseUrl}/payment-success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}`; // URL Padrão
        console.log(`[Checkout Session] Context 'variant2' detected. Using USD prices.`);

      } else {
        // Contexto Default (Real)
        currency = 'brl';
        const brlMonthlyPriceCents = 4990; // R$ 49,90
        const brlAnnualPriceCents = 59880; // R$ 598,80 

        if (plan === 'annual') {
          description = 'Orygen Sites - Plano Anual';
          unitAmount = brlAnnualPriceCents;
        } else {
          description = 'Orygen Sites - Plano Mensal';
          unitAmount = brlMonthlyPriceCents;
        }
        successUrl = `${baseUrl}/payment-success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}`; // URL Padrão
        console.log(`[Checkout Session] Context 'default' detected. Using BRL prices.`);
      }
      // --- Fim da Lógica de Contexto ---

      // Criar sessão de Checkout com os valores definidos
      const sessionParams = {
        payment_method_types: ['card'], // Simplificado para card por agora, adicionar boleto/pix se necessário
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
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          plan: plan,
          formId: formId,
          context: context // Adicionar contexto aos metadados pode ser útil
        },
        locale: currency.toLowerCase() === 'brl' ? 'pt-BR' : 'en-US', // Ajustar locale
        billing_address_collection: 'required',
        allow_promotion_codes: true,
      };
      
      // Adicionar opções de boleto apenas se for BRL
      if (currency.toLowerCase() === 'brl') {
          sessionParams.payment_method_types.push('boleto');
          sessionParams.payment_method_options = {
              boleto: {
                  expires_after_days: 3,
              },
          };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      console.log(`[Checkout Session] Created session ${session.id} for formId ${formId} with context ${context}`);
      res.status(200).json({ sessionId: session.id });

    } catch (error) {
       console.error('[Create Checkout Session] Error:', error);
       // Evitar expor detalhes do erro ao cliente, usar mensagem genérica
       res.status(500).json({ error: { message: 'An internal error occurred while creating the checkout session.' } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}; 