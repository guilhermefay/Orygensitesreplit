import Stripe from 'stripe';

/**
 * Configurar a rota de redirecionamento para o Stripe Checkout
 * Esta é uma abordagem simplificada que evita qualquer problema com JavaScript no cliente
 * @param {Express} app - Express app instance
 */
export function setupStripeRedirect(app) {
  // Verificar se a chave do Stripe está disponível
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY não está configurada no ambiente');
    return;
  }

  // Inicializar o Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  console.log('✅ Rota /api/checkout-redirect configurada');

  // Rota simples de redirecionamento para checkout que usa query parameters
  // Isso evita problemas com fetch API ou erros de JavaScript
  app.get('/api/checkout-redirect', async (req, res) => {
    try {
      // Extrair parâmetros da URL
      const { amount, currency = 'brl', plan, formId } = req.query;
      
      // Log detalhado para depuração
      console.log('[STRIPE REDIRECT] Requisição de checkout recebida:', {
        amount, currency, plan, formId,
        query: req.query,
        headers: {
          host: req.headers.host,
          origin: req.headers.origin,
          referer: req.headers.referer
        }
      });
      
      // Validar os parâmetros
      if (!amount || !plan) {
        const errorMsg = 'Parâmetros amount e plan são obrigatórios';
        console.error('[STRIPE REDIRECT] Erro:', errorMsg);
        return res.status(400).send(errorMsg);
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
      
      console.log('[STRIPE REDIRECT] Criando Checkout Session para redirecionamento direto');
      
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
      
      console.log('[STRIPE REDIRECT] Sessão criada com sucesso, redirecionando para:', session.url);
      
      // Redirecionar o usuário para a página de checkout do Stripe
      res.redirect(303, session.url);
    } catch (error) {
      console.error('[STRIPE REDIRECT] Erro ao criar sessão de checkout:', error);
      
      // Mostrar página de erro amigável
      res.status(500).send(`
        <html>
          <head>
            <title>Erro no Processamento de Pagamento</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error-container { max-width: 600px; margin: 0 auto; }
              .button { background: #0070f3; color: white; border: none; padding: 10px 20px; 
                       border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="error-container">
              <h1>Ops! Houve um problema ao processar seu pagamento</h1>
              <p>Ocorreu um erro ao tentar criar a sessão de pagamento. Por favor, tente novamente ou entre em contato com o suporte.</p>
              <p>Erro: ${error.message}</p>
              <a href="/" class="button">Voltar para a página inicial</a>
            </div>
          </body>
        </html>
      `);
    }
  });
}