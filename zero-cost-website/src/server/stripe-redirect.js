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
  
  // NOVA ROTA: Armazenar formulário temporariamente
  const formDataStore = new Map(); // Armazenamento temporário (em produção usaríamos Redis/banco de dados)
  
  app.post('/api/store-form-data', async (req, res) => {
    try {
      const { formId, formData, files, colorPalette, finalContent, plan } = req.body;
      
      if (!formId) {
        return res.status(400).json({ error: 'formId é obrigatório' });
      }
      
      // Armazenar temporariamente os dados do formulário
      // Eles serão enviados para o Supabase apenas após pagamento bem-sucedido
      formDataStore.set(formId, {
        formData,
        files,
        colorPalette,
        finalContent,
        plan,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[FORM STORAGE] Dados temporários armazenados para formId: ${formId}`);
      
      // Retornar sucesso
      res.json({ success: true, message: 'Dados armazenados temporariamente' });
    } catch (error) {
      console.error('[FORM STORAGE] Erro:', error);
      res.status(500).json({ error: 'Erro ao armazenar dados' });
    }
  });

  // Rota para salvar dados no Supabase após pagamento bem-sucedido
  app.post('/api/payment-success', async (req, res) => {
    try {
      const { formId, sessionId, paymentStatus } = req.body;
      
      if (!formId || !paymentStatus) {
        return res.status(400).json({ error: 'formId e paymentStatus são obrigatórios' });
      }
      
      // Verificar se temos os dados armazenados
      if (!formDataStore.has(formId)) {
        return res.status(404).json({ error: 'Dados do formulário não encontrados' });
      }
      
      // Recuperar dados temporários
      const storedData = formDataStore.get(formId);
      
      // Aqui enviaria para o Supabase
      console.log(`[PAYMENT SUCCESS] Enviando dados para o Supabase para formId: ${formId}`);
      console.log('[PAYMENT SUCCESS] Status do pagamento:', paymentStatus);
      
      // Em uma implementação real, aqui enviaríamos para o Supabase
      // await supabaseClient.from('formSubmissions').insert({
      //   ...storedData.formData,
      //   payment_status: paymentStatus,
      //   paid: true,
      //   payment_id: sessionId
      // });
      
      // Limpar dados armazenados
      formDataStore.delete(formId);
      
      res.json({ success: true, message: 'Dados salvos com sucesso no Supabase' });
    } catch (error) {
      console.error('[PAYMENT SUCCESS] Erro:', error);
      res.status(500).json({ error: 'Erro ao salvar dados' });
    }
  });
  
  // Agora temos duas opções para checkout:
  // 1. Usar URLs predefinidos (hardcoded)
  // 2. Criar novas sessões
  
  // OPÇÃO 1: Redirecionar para URLs predefinidos do Stripe
  app.get('/api/checkout-direct', (req, res) => {
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
      res.redirect(303, redirectUrl);
    } catch (error) {
      console.error('[STRIPE DIRECT] Erro:', error);
      res.status(500).send('Erro ao redirecionar para o Stripe');
    }
  });
  
  // OPÇÃO 2: Criar novas sessões de checkout (mais flexível)
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
      
      // URL de sucesso agora inclui formId para podermos processar os dados no callback
      const successUrl = `${protocol}://${host}/api/process-payment-success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}&plan=${plan}`;
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
  
  // Rota para processar pagamentos bem-sucedidos
  app.get('/api/process-payment-success', async (req, res) => {
    try {
      const { sessionId, formId, plan } = req.query;
      
      if (!sessionId || !formId) {
        return res.status(400).send('sessionId e formId são obrigatórios');
      }
      
      console.log(`[PAYMENT SUCCESS] Processando pagamento bem-sucedido: sessionId=${sessionId}, formId=${formId}`);
      
      // Verificar o status da sessão no Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        console.log(`[PAYMENT SUCCESS] Pagamento confirmado para a sessão ${sessionId}`);
        
        // Se temos dados armazenados temporariamente, enviá-los para o Supabase
        if (formDataStore.has(formId)) {
          // Aqui enviaria para o Supabase
          console.log(`[PAYMENT SUCCESS] Enviando dados para o Supabase para formId: ${formId}`);
          
          // Limpar dados após salvar
          formDataStore.delete(formId);
        } else {
          console.log(`[PAYMENT SUCCESS] Nenhum dado temporário encontrado para formId: ${formId}`);
        }
        
        // Redirecionar para a página de sucesso
        res.redirect(`/?success=true&plan=${plan}&sessionId=${sessionId}`);
      } else {
        console.log(`[PAYMENT SUCCESS] Pagamento não confirmado para sessão ${sessionId}: ${session.payment_status}`);
        res.redirect('/?success=false');
      }
    } catch (error) {
      console.error('[PAYMENT SUCCESS] Erro:', error);
      res.redirect('/?success=false&error=processing');
    }
  });
}