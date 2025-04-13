const express = require('express');
const { createServer } = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { setupCreatePaymentIntent } = require('./src/server/create-payment-intent.js');
const { setupStripeRedirect } = require('./src/server/stripe-redirect.js');

// Configurar variáveis de ambiente para Stripe
const REQUIRED_ENV_VARS = ['STRIPE_SECRET_KEY'];

// Verificar variáveis de ambiente necessárias
REQUIRED_ENV_VARS.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Variável de ambiente ${envVar} não configurada. Algumas funcionalidades podem não funcionar corretamente.`);
  } else {
    console.log(`✓ Variável de ambiente ${envVar} configurada`);
  }
});

// Em CommonJS, __dirname já está disponível
// Não precisamos definir __filename e __dirname manualmente

// Cria uma aplicação Express
const app = express();

// Middleware para capturar o corpo bruto da requisição para webhooks do Stripe
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    // Para webhook do Stripe, precisamos do corpo bruto para verificar assinatura
    let rawBody = '';
    req.setEncoding('utf8');
    
    req.on('data', chunk => {
      rawBody += chunk;
    });
    
    req.on('end', () => {
      req.rawBody = rawBody;
      
      // Parsear manualmente como JSON se o content-type for application/json
      if (req.headers['content-type'] === 'application/json') {
        try {
          req.body = JSON.parse(rawBody);
        } catch (e) {
          console.error('Erro ao parsear corpo JSON:', e);
        }
      }
      
      next();
    });
  } else {
    next();
  }
});

// Configuração CORS completamente permissiva para ambiente de desenvolvimento
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, stripe-signature');
  
  // Permitir preflight requests OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Configurar middlewares - Não usar para webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    // Para o webhook do Stripe, já tratamos o corpo no middleware anterior
    next();
  } else {
    // Para outras rotas, usar o middleware padrão
    express.json()(req, res, next);
  }
});

// Adicionar logging para todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configurar a rota principal de redirecionamento do Stripe
// Esta é a solução recomendada para evitar erros de JavaScript
setupStripeRedirect(app);

// Manter a rota API antiga para compatibilidade
setupCreatePaymentIntent(app);

// Registrar todas as rotas de API principais
app.use('/api/checkout-direct', require('./api/checkout-direct'));
app.use('/api/process-payment-success', require('./api/process-payment-success'));
app.use('/api/store-form-data', require('./api/store-form-data'));
app.use('/api/supabase-check', require('./api/supabase-check'));
app.use('/api/create-payment-intent', require('./api/create-payment-intent'));
app.use('/api/update-payment-status', require('./api/update-payment-status'));
app.use('/api/webhook', require('./api/webhook'));
console.log('✅ Todas as rotas de API registradas corretamente');

// Adicionar mais logging para depuração
app.get('/api/debug-session', (req, res) => {
  const { sessionId } = req.query;
  console.log('[DEBUG] Verificando sessão:', sessionId);
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId é obrigatório' });
  }
  
  // Retornar o status da sessão para diagnóstico
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    stripe.checkout.sessions.retrieve(sessionId)
      .then(session => {
        console.log('[DEBUG] Sessão encontrada:', {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status
        });
        res.json({ success: true, session: {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status
        }});
      })
      .catch(err => {
        console.error('[DEBUG] Erro ao buscar sessão:', err);
        res.status(500).json({ error: 'Erro ao buscar sessão', message: err.message });
      });
  } else {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY não configurada' });
  }
});

// Rota de diagnóstico para verificar configuração
app.get('/api/diagnostics', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    publicKeyConfigured: !!process.env.VITE_STRIPE_PUBLIC_KEY,
    supabaseUrlConfigured: !!process.env.SUPABASE_URL,
    supabaseKeyConfigured: !!process.env.SUPABASE_KEY,
    timestamp: new Date().toISOString()
  });
});

// Rota de teste para Supabase
app.get('/api/supabase-test', require('./api/supabase-test'));

// Definir a porta para o servidor
const PORT = process.env.PORT || 5000;

// Configurar o servidor para servir os arquivos estáticos da aplicação Vite
// O diretório dist contém a build da aplicação gerada pelo Vite
const distPath = path.join(__dirname, 'dist');

// Configurar para servir arquivos da pasta public (arquivos estáticos sem depender de build)
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  console.log('Configurando servidor para servir arquivos estáticos da pasta public em:', publicPath);
  app.use(express.static(publicPath));
}

// Verificar se o diretório dist existe, se não, vamos servir via proxy
if (fs.existsSync(distPath)) {
  console.log('Configurando servidor para servir arquivos estáticos em:', distPath);
  // Configurar middleware para servir arquivos estáticos
  app.use(express.static(distPath));
  
  // Rota para servir o arquivo index.html para todas as rotas não-API
  // Esta abordagem é mais simples e evita problemas com o path-to-regexp
  app.use((req, res, next) => {
    console.log(`[SERVER] Handling request for: ${req.url}`);
    
    // Verificar se a URL começa com /api
    if (req.url.startsWith('/api')) {
      // Passar para o próximo middleware se for uma rota de API
      console.log(`[SERVER] API route detected: ${req.url}`);
      return next();
    }
    
    // Verificar se a URL corresponde a um arquivo estático
    const potentialFilePath = path.join(distPath, req.url);
    if (fs.existsSync(potentialFilePath) && fs.statSync(potentialFilePath).isFile()) {
      console.log(`[SERVER] Static file found: ${req.url}`);
      return next();
    }
    
    console.log(`[SERVER] SPA route, serving index.html for: ${req.url}`);
    // Para qualquer outra URL, servir o index.html (para SPA - Single Page Application)
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Criar o servidor HTTP
const server = createServer(app);

// Usar a porta que definimos acima
// Iniciar o servidor em 0.0.0.0 para permitir acesso de qualquer IP
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
  if (fs.existsSync(distPath)) {
    console.log(`Aplicação web disponível em http://localhost:${PORT}`);
  }
  console.log(`Servidor acessível remotamente em http://0.0.0.0:${PORT}`);
});