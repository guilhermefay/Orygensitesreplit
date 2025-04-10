
// Configuration and constants for PayPal integration
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Utilities for consistent responses
export const createErrorResponse = (message: string, details: any = null, status = 500) => {
  console.error(message, details);
  return new Response(
    JSON.stringify({ error: message, details }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
  );
};

export const createSuccessResponse = (data: any) => {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
};
