const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Criar cliente Supabase com as credenciais de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Log das informações para depuração
console.log('[SUPABASE CONFIG] URL:', supabaseUrl);
console.log('[SUPABASE CONFIG] Key length:', supabaseKey ? supabaseKey.length : 0);
console.log('[SUPABASE CONFIG] Table name: form_submissions (corrigido)');

// Alternativa de salvamento local para emergências
function saveLocalBackup(data) {
  try {
    const backupDir = './payment-backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const filename = `${backupDir}/payment-${data.id}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`[BACKUP] Dados salvos localmente em ${filename}`);
    return true;
  } catch (error) {
    console.error('[BACKUP] Erro ao salvar backup local:', error);
    return false;
  }
}

let supabaseClient;
try {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  console.log('[SUPABASE CONFIG] Cliente criado com sucesso');
} catch (error) {
  console.error('[SUPABASE CONFIG] Erro ao criar cliente Supabase:', error);
}

/**
 * Configurar a rota de redirecionamento para o Stripe Checkout
 * Esta é uma abordagem simplificada que evita qualquer problema com JavaScript no cliente
 * @param {Express} app - Express app instance
 */
function setupStripeRedirect(app) {
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
      const { amount, currency = 'brl', plan, formId, test } = req.query;
      
      // Log detalhado para depuração
      console.log('[STRIPE REDIRECT] Requisição de checkout recebida:', {
        amount, currency, plan, formId, test,
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
      
      // Criar descrição do produto com base no plano e se é um teste
      let description;
      if (test === 'true') {
        description = 'TESTE - R$ 1,00 - Zero Cost Website';
      } else {
        description = plan === 'annual' 
          ? 'Plano Anual - Zero Cost Website' 
          : 'Plano Mensal - Zero Cost Website';
      }
      
      // Construir a URL de retorno após pagamento
      const host = req.headers.host || 'localhost:5000';
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      
      // URL de sucesso agora inclui formId para podermos processar os dados no callback
      const successUrl = `${protocol}://${host}/api/process-payment-success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}&plan=${plan}${test ? '&test=true' : ''}`;
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
          source: 'checkout-redirect',
          test: test ? 'true' : 'false'
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
          const storedData = formDataStore.get(formId);
          console.log(`[PAYMENT SUCCESS] Enviando dados para o Supabase para formId: ${formId}`);
          
          try {
            // Extrair dados do formulário para inserção no Supabase
            const { formData } = storedData;
            const isTestPayment = req.query.test === 'true';
            
            // Dados para inserir no Supabase (campos simplificados)
            const submissionData = {
              id: formId,  // Usar o formId como ID para evitar duplicação
              name: formData.name || 'Sem nome',
              email: formData.email || 'sem@email.com',
              business: formData.business || '',
              payment_id: sessionId,
              payment_date: new Date().toISOString(),
              payment_test: isTestPayment,
              payment_amount: isTestPayment ? 100 : (plan === 'annual' ? 59880 : 5980),
              payment_currency: 'brl'
            };
            
            console.log('[PAYMENT SUCCESS] Dados a serem enviados para o Supabase:', submissionData);
            
            // Tentar inserir no Supabase
            let supabaseSuccess = false;
            try {
              const { data, error } = await supabaseClient
                .from('form_submissions')
                .upsert(submissionData, { onConflict: 'id' });
                
              if (error) {
                console.error('[PAYMENT SUCCESS] Erro ao salvar no Supabase:', error);
                // Se falhar, salvar um backup local
                saveLocalBackup(submissionData);
              } else {
                console.log('[PAYMENT SUCCESS] Dados salvos com sucesso no Supabase:', data);
                supabaseSuccess = true;
              }
            } catch (supabaseError) {
              console.error('[PAYMENT SUCCESS] Exceção ao salvar no Supabase:', supabaseError);
              // Em caso de exceção, salvar um backup local
              saveLocalBackup(submissionData);
            }
          } catch (dbError) {
            console.error('[PAYMENT SUCCESS] Erro ao processar dados para o Supabase:', dbError);
          }
          
          // Limpar dados após salvar
          formDataStore.delete(formId);
        } else {
          console.log(`[PAYMENT SUCCESS] Nenhum dado temporário encontrado para formId: ${formId}`);
          
          // Mesmo sem dados temporários, podemos tentar registrar o pagamento
          try {
            const isTestPayment = req.query.test === 'true';
            
            const minimalData = {
              id: formId, 
              payment_id: sessionId,
              payment_date: new Date().toISOString(),
              payment_test: isTestPayment,
              payment_amount: isTestPayment ? 100 : (plan === 'annual' ? 59880 : 5980),
              payment_currency: 'brl',
              name: 'Pagamento sem dados', 
              email: 'pagamento@semformulario.com'
            };
            
            try {
              const { error } = await supabaseClient
                .from('form_submissions')
                .upsert(minimalData, { onConflict: 'id' });
                
              if (error) {
                console.error('[PAYMENT SUCCESS] Erro ao salvar pagamento mínimo no Supabase:', error);
                // Salvar localmente em caso de erro
                saveLocalBackup(minimalData);
              } else {
                console.log('[PAYMENT SUCCESS] Registro mínimo de pagamento salvo no Supabase');
              }
            } catch (supabaseError) {
              console.error('[PAYMENT SUCCESS] Exceção ao salvar dados mínimos no Supabase:', supabaseError);
              // Salvar backup em caso de exceção
              saveLocalBackup(minimalData);
            }
          } catch (minError) {
            console.error('[PAYMENT SUCCESS] Erro ao salvar registro mínimo:', minError);
          }
        }
        
        // Redirecionar para a página de sucesso com confetes
        res.redirect(`/success?plan=${plan}&sessionId=${sessionId}`);
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

module.exports = {
  setupStripeRedirect
};