
/**
 * Stripe payment integration
 */
import { supabase } from '@/lib/supabase/client';

// Initialize Stripe
export const initStripe = async (stripePublicKey: string) => {
  try {
    if (!stripePublicKey || stripePublicKey.trim() === "") {
      throw new Error("Chave pública do Stripe não fornecida");
    }
    
    // Dynamically import Stripe.js
    const { loadStripe } = await import('@stripe/stripe-js');
    const stripeInstance = await loadStripe(stripePublicKey);
    
    if (!stripeInstance) {
      throw new Error('Falha ao inicializar o Stripe');
    }
    
    return stripeInstance;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    throw error;
  }
};

// Create a checkout session
export const createCheckoutSession = async (formId: string, amount: number, plan: string, currency: string = 'USD') => {
  try {
    console.log(`Creating checkout session: form=${formId}, amount=${amount} ${currency}, plan=${plan}`);
    
    // Validação de valor antes de enviar ao servidor
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("Valor inválido para pagamento:", amount);
      
      // Valores de fallback baseados no plano
      if (plan === 'annual') {
        amount = 598.80;
      } else if (plan === 'monthly') {
        amount = 89.90;
      } else {
        throw new Error(`Valor de pagamento inválido: ${amount}`);
      }
      
      console.log("Usando valor fallback:", amount);
    }
    
    // Use supabase client to call the Edge Function
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: {
        formId,
        amount,
        plan,
        currency
      }
    });
    
    console.log('Checkout response:', data, error);
    
    if (error) {
      console.error('Error in create checkout session:', error);
      throw new Error(error.message || 'Erro ao criar sessão de pagamento');
    }
    
    if (!data) {
      throw new Error('Resposta vazia do servidor');
    }
    
    console.log('Checkout session created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (sessionId: string, stripe: any) => {
  if (!stripe) {
    console.error('Stripe has not been initialized');
    return { error: 'Stripe não foi inicializado' };
  }

  try {
    console.log('Redirecting to checkout with session ID:', sessionId);
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Error redirecting to checkout:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception in redirectToCheckout:', error);
    return { error: error.message || 'Erro desconhecido ao redirecionar para checkout' };
  }
};
