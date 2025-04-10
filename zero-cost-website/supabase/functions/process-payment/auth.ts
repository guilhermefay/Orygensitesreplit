// This file is now deprecated as its functionality has been moved to paypal-client.ts
// Keeping a minimal implementation for backward compatibility
import { getPayPalAccessToken as getToken } from './paypal-client.ts';
import { corsHeaders, createErrorResponse } from './config.ts';

// Re-export the function with the same name for backward compatibility
export const getPayPalAccessToken = async () => {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_SECRET_KEY');
  
  if (!clientId || !clientSecret) {
    console.error('PayPal API credentials missing');
    console.error('Client ID present:', Boolean(clientId));
    console.error('Client Secret present:', Boolean(clientSecret));
    throw new Error('PayPal configuration missing');
  }
  
  // Get access token - USING PRODUCTION URL
  const auth = btoa(`${clientId}:${clientSecret}`);
  try {
    const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`PayPal token error (${tokenResponse.status}): ${errorText}`);
      throw new Error(`PayPal authentication failed: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;
    
    if (!access_token) {
      console.error('Failed to get PayPal access token', tokenData);
      throw new Error('PayPal authentication failed: No access token returned');
    }
    
    return access_token;
  } catch (error) {
    console.error('Error getting PayPal token:', error);
    throw error;
  }
};
