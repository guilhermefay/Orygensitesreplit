import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import { setupCreatePaymentIntent } from './src/server/create-payment-intent.js';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cria uma aplicação Express
const app = express();

// Configurar CORS para permitir solicitações do frontend
app.use(cors());

// Configurar middlewares
app.use(express.json());

// Configurar o endpoint de pagamento do Stripe
setupCreatePaymentIntent(app);

// Configurar porta para o servidor da API diferente do servidor de desenvolvimento
const API_PORT = process.env.API_PORT || 5001;

// Apenas configurar as rotas necessárias para a API
// Não precisamos servir arquivos estáticos no servidor de API

// Criar o servidor HTTP
const server = createServer(app);

// Usar a porta da API que definimos acima
// Iniciar o servidor
server.listen(API_PORT, () => {
  console.log(`Servidor Express rodando na porta ${API_PORT}`);
  console.log(`API disponível em http://localhost:${API_PORT}/api`);
});