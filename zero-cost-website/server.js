import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { setupCreatePaymentIntent } from './src/server/create-payment-intent.js';

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

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cria uma aplicação Express
const app = express();

// Configuração CORS completamente permissiva para ambiente de desenvolvimento
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Permitir preflight requests OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Configurar middlewares
app.use(express.json());

// Configurar o endpoint de pagamento do Stripe
setupCreatePaymentIntent(app);

// Definir a porta para o servidor
const PORT = process.env.PORT || 5000;

// Configurar o servidor para servir os arquivos estáticos da aplicação Vite
// O diretório dist contém a build da aplicação gerada pelo Vite
const distPath = path.join(__dirname, 'dist');

// Verificar se o diretório dist existe, se não, vamos servir via proxy
if (fs.existsSync(distPath)) {
  console.log('Configurando servidor para servir arquivos estáticos em:', distPath);
  // Configurar middleware para servir arquivos estáticos
  app.use(express.static(distPath));
  
  // Rota para servir o arquivo index.html para todas as rotas não-API
  // Esta abordagem é mais simples e evita problemas com o path-to-regexp
  app.use((req, res, next) => {
    // Verificar se a URL começa com /api
    if (req.url.startsWith('/api')) {
      // Passar para o próximo middleware se for uma rota de API
      return next();
    }
    
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