const express = require('express');
const { createServer } = require('http');
const { setupCreatePaymentIntent } = require('./src/server/create-payment-intent');
const path = require('path');
const cors = require('cors');

// Cria uma aplicação Express
const app = express();

// Configurar CORS para permitir solicitações do frontend
app.use(cors());

// Configurar middlewares
app.use(express.json());

// Configurar o endpoint de pagamento do Stripe
setupCreatePaymentIntent(app);

// Configurar rota para servir os arquivos estáticos se estiver em produção
app.use(express.static(path.join(__dirname, 'dist')));

// Rota de fallback para o React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Criar o servidor HTTP
const server = createServer(app);

// Definir a porta
const PORT = process.env.PORT || 5000;

// Iniciar o servidor
server.listen(PORT, () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
});