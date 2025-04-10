
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('OpenAI proxy function initialized!');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the API key from environment variables (Supabase secrets)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('No OpenAI API key found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Chave da API OpenAI não configurada no servidor.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the OpenAI API request configuration from the client
    const body = await req.json();
    const { config } = body;
    
    console.log('Received OpenAI request:', {
      model: config.model,
      messagesCount: config.messages?.length || 0,
      temperature: config.temperature,
      max_tokens: config.max_tokens
    });

    // Forward the request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify(config)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ 
          error: data.error?.message || 'Erro na comunicação com a API da OpenAI' 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('OpenAI API response successful');
    
    // Return the OpenAI response to the client
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in OpenAI proxy function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno no servidor ao processar requisição para OpenAI' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
