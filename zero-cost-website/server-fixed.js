const express = require('express');
const { createServer } = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Cria uma aplicação Express
const app = express();

// Configuração CORS completamente permissiva para ambiente de desenvolvimento
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: '*'
}));

// Tratamento especial para webhooks do Stripe se necessário
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

// Configurar middlewares para outras rotas
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

// ------------------------------------------------------------
// MANIPULADORES DE ROTA ESPECÍFICOS PARA O PROBLEMA /api/checkout
// ------------------------------------------------------------

// Importante: Definir este manipulador ANTES de qualquer outra rota
// Esta é a rota específica que estava causando problemas
app.all('/api/checkout/store-form-data', (req, res) => {
  console.log('[STORE FORM DATA] Recebida chamada para /api/checkout/store-form-data');
  
  // Importar o manipulador diretamente
  const handler = require('./api/store-form-data');
  
  // Chamar o manipulador com req e res
  handler(req, res);
});

// Essa rota captura qualquer outra chamada para /api/checkout/*
app.all('/api/checkout/*', (req, res) => {
  const originalPath = req.path;
  console.log(`[CHECKOUT REDIRECT] Capturada solicitação para: ${originalPath}`);
  
  // Extrair o caminho após /api/checkout/
  const subPath = originalPath.substring('/api/checkout/'.length);
  
  // Redirecionar para o endpoint correspondente sem o prefixo checkout/
  const newPath = `/api/${subPath}`;
  console.log(`[CHECKOUT REDIRECT] Redirecionando para: ${newPath}`);
  
  // Redirecionar (método HTTP 307 preserva o método e corpo da requisição)
  res.redirect(307, newPath);
});

// ------------------------------------------------------------
// OUTRAS ROTAS DA API
// ------------------------------------------------------------

// Registrar todas as rotas de API principais
app.use('/api/checkout-direct', require('./api/checkout-direct'));
app.use('/api/process-payment-success', require('./api/process-payment-success'));
app.use('/api/store-form-data', require('./api/store-form-data'));
app.use('/api/supabase-check', require('./api/supabase-check'));
app.use('/api/create-payment-intent', require('./api/create-payment-intent'));
app.use('/api/webhook', require('./api/webhook'));

console.log('✅ Todas as rotas de API registradas corretamente');

// Adicionar mais logging para depuração
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

// ------------------------------------------------------------
// SERVIR ARQUIVOS ESTÁTICOS
// ------------------------------------------------------------

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