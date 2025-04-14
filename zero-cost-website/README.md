# Zero Cost Website

Plataforma completa para criação de sites com integração de pagamentos Stripe.

## Sobre o Projeto

Este projeto oferece uma solução completa para criar sites com processamento de pagamentos integrado. Possui:

- Frontend em React/Vite
- Backend em Express.js
- Integração com Stripe para pagamentos
- Armazenamento de dados com Supabase

## Configuração para Deploy na Vercel

### Pré-requisitos

1. Uma conta na [Vercel](https://vercel.com)
2. Uma conta no [Stripe](https://stripe.com)
3. Uma conta no [Supabase](https://supabase.com)

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no seu projeto Vercel:

```
STRIPE_SECRET_KEY=sk_xxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Passos para Deploy

1. Faça login na Vercel e importe o repositório
2. Configure as variáveis de ambiente listadas acima
3. Utilize as seguintes configurações:

   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Clique em "Deploy"

### Verificando o Deploy

Após o deploy, acesse a URL fornecida pela Vercel. A aplicação deve estar funcionando corretamente, incluindo:

- Frontend React/Vite
- Funções Serverless na API
- Integração com Stripe
- Armazenamento no Supabase

## Estrutura das Funções API

O projeto usa a arquitetura de funções serverless da Vercel:

- `/api/checkout.js` - Endpoint principal para integração com Stripe
- `/api/checkout-direct.js` - Redireciona para links diretos do Stripe
- `/api/store-form-data.js` - Armazena temporariamente os dados do formulário
- `/api/process-payment-success.js` - Processa pagamentos bem-sucedidos

## Testando Pagamentos

Para testar a integração com pagamentos:

1. Use a página `/teste` para fazer um pagamento de R$ 1,00
2. Verifique se os dados são salvos corretamente no Supabase
3. Confirme o fluxo completo de checkout e redirecionamento

## Recursos Adicionais

- [Documentação da API Stripe](https://stripe.com/docs/api)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação da Vercel para Funções Serverless](https://vercel.com/docs/serverless-functions/introduction)

