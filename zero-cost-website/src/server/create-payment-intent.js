const Stripe = require('stripe');

// Função para configurar a rota de create-payment-intent
function setupCreatePaymentIntent(app) {
  // Verificar se a chave do Stripe está disponível
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY não está configurada no ambiente');
    return;
  }

  // Inicializar o Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Função para log de depuração
  const debugLog = (message, data) => {
    console.log(`[Stripe API] ${message}`, data || '');
  };

  // Rota de teste para verificar se o Stripe está funcionando
  app.get('/api/stripe-test', (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        status: 'error',
        message: 'STRIPE_SECRET_KEY não está configurada no ambiente'
      });
    }
    
    res.json({ 
      status: 'ok', 
      message: 'Conexão com Stripe configurada', 
      stripeKeyConfigured: !!process.env.STRIPE_SECRET_KEY
    });
  });
  
  // Rota simples de redirecionamento para checkout que usa query parameters
  // Isso evita problemas com fetch API ou erros de JavaScript
  app.get('/api/checkout-redirect', async (req, res) => {
    try {
      // Extrair parâmetros da URL
      const { amount, currency = 'brl', plan, formId } = req.query;
      
      // Validar os parâmetros
      if (!amount || !plan) {
        return res.status(400).send('Parâmetros amount e plan são obrigatórios');
      }
      
      // Criar descrição do produto com base no plano
      const description = plan === 'annual' 
        ? 'Plano Anual - Zero Cost Website' 
        : 'Plano Mensal - Zero Cost Website';
      
      // Construir a URL de retorno após pagamento
      const host = req.headers.host || 'localhost:5000';
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const successUrl = `${protocol}://${host}?success=true&plan=${plan}`;
      const cancelUrl = `${protocol}://${host}?success=false`;
      
      console.log('Criando Checkout Session para redirecionamento direto');
      
      // Criar uma sessão de checkout do Stripe
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
          source: 'checkout-redirect'
        },
      });
      
      console.log('Sessão criada com sucesso, redirecionando para:', session.url);
      
      // Redirecionar o usuário para a página de checkout do Stripe
      res.redirect(303, session.url);
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      res.status(500).send(`Erro ao processar pagamento: ${error.message}`);
    }
  });

  // Configurar rota para criar PaymentIntent
  app.post('/api/create-payment-intent', async (req, res) => {
    // Verificar se o Stripe está configurado
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        message: 'STRIPE_SECRET_KEY não está configurada no ambiente',
        code: 'stripe_key_missing'
      });
    }
    
    try {
      const { amount, currency = 'brl', plan, formId, redirect = false } = req.body;

      // Validar os parâmetros
      if (!amount || !plan) {
        return res.status(400).json({ 
          message: 'Parâmetros inválidos. amount e plan são obrigatórios.' 
        });
      }

      // Criar descrição do produto com base no plano
      const description = plan === 'annual' 
        ? 'Plano Anual - Zero Cost Website' 
        : 'Plano Mensal - Zero Cost Website';

      // Determinar o modo de pagamento
      const paymentMode = redirect ? 'payment' : 'payment';

      // Criar objeto de configuração base para o Stripe
      const paymentConfig = {
        amount: Number(amount),
        currency: currency.toLowerCase(),
        description,
        metadata: {
          plan,
          formId: formId || 'unknown'
        }
      };

      // Criar a URL de retorno se necessário
      let successUrl = null;
      if (redirect) {
        // Adiciona a URL de sucesso baseada na URL atual
        // O parâmetro "success=true" é para indicar ao aplicativo que o pagamento foi bem sucedido
        const host = req.headers.host || 'localhost:5000';
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        successUrl = `${protocol}://${host}?success=true&plan=${plan}`;
      }

      // Se o cliente solicitou redirecionamento, criamos uma Checkout Session
      if (redirect && successUrl) {
        debugLog('Criando Checkout Session com redirect', { 
          successUrl, 
          amount: Number(amount), 
          description 
        });

        try {
          // Criar uma sessão de checkout em vez de PaymentIntent direta
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: currency.toLowerCase(),
                  product_data: {
                    name: description,
                  },
                  unit_amount: Number(amount),
                },
                quantity: 1,
              },
            ],
            mode: paymentMode,
            success_url: successUrl,
            cancel_url: successUrl.replace('success=true', 'success=false'),
            metadata: paymentConfig.metadata,
          });

          debugLog('Checkout Session criada com sucesso', { 
            sessionId: session.id,
            url: session.url 
          });

          // Retornar a URL de redirecionamento para o frontend
          res.json({ 
            redirectUrl: session.url,
            sessionId: session.id
          });
        } catch (sessionError) {
          debugLog('Erro ao criar Checkout Session', sessionError);
          
          // Tentar criar um PaymentIntent normal como fallback
          debugLog('Tentando criar PaymentIntent como fallback');
          const paymentIntent = await stripe.paymentIntents.create(paymentConfig);
          
          // Retornar o clientSecret e uma flag indicando para usar checkout.stripe.com
          res.json({ 
            clientSecret: paymentIntent.client_secret,
            useCheckoutPage: true
          });
        }
      } else {
        // Comportamento padrão: criar PaymentIntent para uso com Elements
        const paymentIntent = await stripe.paymentIntents.create(paymentConfig);

        // Retornar o clientSecret para o frontend
        res.json({ clientSecret: paymentIntent.client_secret });
      }
    } catch (error) {
      console.error('Erro ao criar PaymentIntent:', error);
      
      // Registrar detalhes adicionais para ajudar na depuração
      console.error('Detalhes da requisição:', {
        amount: req.body.amount,
        currency: req.body.currency,
        plan: req.body.plan,
        formId: req.body.formId
      });
      
      // Verificar se é um erro do Stripe ou outro tipo de erro
      const errorMessage = error.type 
        ? `Erro do Stripe (${error.type}): ${error.message}` 
        : `Erro ao processar o pagamento: ${error.message}`;
        
      res.status(500).json({ 
        message: errorMessage,
        type: error.type || 'unknown_error',
        code: error.code || 'internal_error'
      });
    }
  });

  console.log('✅ Rota /api/create-payment-intent configurada');
}

module.exports = {
  setupCreatePaymentIntent
};