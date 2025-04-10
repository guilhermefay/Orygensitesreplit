
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Get the API key from environment variables
  const stripeApiKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeApiKey) {
    console.error('No Stripe API key found in environment variables');
    return new Response(
      JSON.stringify({ 
        error: 'Chave da API Stripe não configurada no servidor.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
  
  try {
    // Parse request body
    const body = await req.json();
    const { formId, amount, plan, currency = 'USD' } = body;
    
    if (!formId || !amount || !plan) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios faltando' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Creating checkout session for form ${formId}, plan ${plan}, amount ${amount} ${currency}`);
    
    // Initialize Stripe
    const stripe = new Stripe(stripeApiKey, {
      apiVersion: '2023-10-16',
    });
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `Website development and maintenance - ${plan} plan`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'https://yourdomain.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || 'https://yourdomain.com'}/cancel`,
      metadata: {
        formId: formId,
        plan: plan
      },
    });
    
    // Store form data in Supabase (if needed)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseKey);
      
      // Log the session creation for debugging
      try {
        await supabaseClient
          .from('stripe_sessions')
          .insert({
            session_id: session.id,
            form_id: formId,
            amount: amount,
            currency: currency,
            plan: plan,
            created_at: new Date().toISOString()
          });
      } catch (dbError) {
        console.error('Error logging session to database:', dbError);
        // Continue even if logging fails
      }
    }
    
    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in Stripe checkout function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Erro ao processar pagamento: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
