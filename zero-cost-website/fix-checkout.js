const express = require('express');
const cors = require('cors');
const app = express();

// Configuração básica
app.use(cors());
app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Criar uma rota de teste para verificar se o /api/checkout/store-form-data está funcionando
app.post('/api/checkout/store-form-data', (req, res) => {
  console.log('[FIX-SERVER] Recebida solicitação para /api/checkout/store-form-data');
  console.log('Corpo da requisição:', req.body);
  
  // Responder com sucesso para testar
  res.status(200).json({
    success: true,
    message: 'Dados recebidos com sucesso',
    data: {
      id: 'test-form-id-' + Date.now(),
      timestamp: new Date().toISOString()
    }
  });
});

// Criar rota alternativa sem o prefixo checkout
app.post('/api/store-form-data', (req, res) => {
  console.log('[FIX-SERVER] Recebida solicitação para /api/store-form-data');
  console.log('Corpo da requisição:', req.body);
  
  // Responder com sucesso para testar
  res.status(200).json({
    success: true,
    message: 'Dados recebidos com sucesso (rota alternativa)',
    data: {
      id: 'alt-form-id-' + Date.now(),
      timestamp: new Date().toISOString()
    }
  });
});

// Rota de diagnóstico
app.get('/api/test', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Iniciar o servidor
const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de teste rodando em http://localhost:${PORT}`);
  console.log('Endpoints disponíveis:');
  console.log('- POST /api/checkout/store-form-data');
  console.log('- POST /api/store-form-data');
  console.log('- GET /api/test');
});