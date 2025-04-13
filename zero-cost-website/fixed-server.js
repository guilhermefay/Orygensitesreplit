const express = require('express');
const { createServer } = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Cria uma aplicação Express
const app = express();

// Middleware para permitir CORS
app.use(cors());

// Middleware para processar solicitações JSON
app.use(express.json());

// Logging básico para todas requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ROTAS CRUCIAIS - DEFINIR PRIMEIRO
app.post('/api/checkout/store-form-data', (req, res) => {
  console.log('[ROUTE] Interceptando chamada para /api/checkout/store-form-data');
  
  // Simplesmente carregar o handler diretamente
  try {
    const storeFormHandler = require('./api/store-form-data');
    return storeFormHandler(req, res);
  } catch (error) {
    console.error('Erro ao processar store-form-data:', error);
    return res.status(500).json({ 
      error: 'Erro interno no servidor',
      message: error.message
    });
  }
});

// Definir outras rotas da API
app.use('/api/store-form-data', require('./api/store-form-data'));
app.use('/api/create-payment-intent', require('./api/create-payment-intent'));

// Rota de diagnóstico simples
app.get('/api/diagnostics', (req, res) => {
  res.json({
    status: 'OK',
    time: new Date().toISOString(),
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
  });
});

// Servir arquivos estáticos da pasta dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Servir arquivos estáticos da pasta public
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Rota fallback para SPA
app.get('*', (req, res) => {
  // Se a URL começa com /api, retornar 404
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Caso contrário, servir o index.html para o SPA
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    return res.sendFile(path.join(distPath, 'index.html'));
  } else {
    return res.status(404).send('Página não encontrada');
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acessível em http://localhost:${PORT}`);
});