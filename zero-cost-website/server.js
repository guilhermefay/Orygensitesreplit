import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { setupCreatePaymentIntent } from './src/server/create-payment-intent.js';
import { setupStripeRedirect } from './src/server/stripe-redirect.js';

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

// Rota de diagnóstico para verificar configuração
app.get('/api/diagnostics', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    publicKeyConfigured: !!process.env.VITE_STRIPE_PUBLIC_KEY,
    timestamp: new Date().toISOString()
  });
});

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