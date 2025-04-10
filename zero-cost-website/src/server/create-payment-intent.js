import Stripe from 'stripe';

// Função para configurar a rota de create-payment-intent
export function setupCreatePaymentIntent(app) {
  // Verificar se a chave do Stripe está disponível
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY não está configurada no ambiente');
    return;
  }

  // Inicializar o Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Configurar rota para criar PaymentIntent
  app.post('/api/create-payment-intent', async (req, res) => {
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

        // Retornar a URL de redirecionamento para o frontend
        res.json({ 
          redirectUrl: session.url,
          sessionId: session.id
        });
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