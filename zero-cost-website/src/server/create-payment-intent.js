const express = require('express');
const Stripe = require('stripe');

// Função para configurar a rota de create-payment-intent
function setupCreatePaymentIntent(app) {
  // Verificar se a chave do Stripe está disponível
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY não está configurada no ambiente');
    return;
  }

  // Inicializar o Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Configurar rota para criar PaymentIntent
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'brl', plan, formId } = req.body;

      // Validar os parâmetros
      if (!amount || !plan) {
        return res.status(400).json({ 
          message: 'Parâmetros inválidos. amount e plan são obrigatórios.' 
        });
      }

      // Criar descrição do produto com base no plano
      const description = plan === 'annual' 
        ? 'Plano Anual - Zero Cost Website' 
        : 'Plano Mensal - Zero Cost Website';

      // Criar a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount),
        currency: currency.toLowerCase(),
        description,
        metadata: {
          plan,
          formId: formId || 'unknown'
        }
      });

      // Retornar o clientSecret para o frontend
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('Erro ao criar PaymentIntent:', error);
      res.status(500).json({ 
        message: `Erro ao processar o pagamento: ${error.message}` 
      });
    }
  });

  console.log('✅ Rota /api/create-payment-intent configurada');
}

module.exports = { setupCreatePaymentIntent };