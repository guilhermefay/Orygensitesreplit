
// PayPal API client for shared functionality
import { corsHeaders } from './config.ts';

// Get PayPal access token
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_SECRET_KEY');
  
  if (!clientId || !clientSecret) {
    console.error('🔑 [paypal-client] PayPal API credentials missing');
    console.error('Client ID present:', Boolean(clientId));
    console.error('Client Secret present:', Boolean(clientSecret));
    throw new Error('PayPal configuration missing');
  }
  
  // Get access token - USING PRODUCTION URL
  const baseUrl = 'https://api-m.paypal.com';
  const auth = btoa(`${clientId}:${clientSecret}`);
  
  try {
    console.log(`🔄 [paypal-client] Requesting PayPal access token from ${baseUrl}`);
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`💥 [paypal-client] PayPal token error (${tokenResponse.status}): ${errorText}`);
      throw new Error(`PayPal authentication failed: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;
    
    if (!access_token) {
      console.error('💥 [paypal-client] Failed to get PayPal access token', tokenData);
      throw new Error('PayPal authentication failed: No access token returned');
    }
    
    console.log('✅ [paypal-client] PayPal authentication successful');
    return access_token;
  } catch (error) {
    console.error('💥 [paypal-client] Error getting PayPal token:', error);
    throw error;
  }
}

// PayPal API URLs
export const PAYPAL_API_URL = 'https://api-m.paypal.com';

// Response types
export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: PayPalLink[];
  error?: any;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  payer_id?: string;
  amount?: number;
  currency?: string;
  error?: any;
}
