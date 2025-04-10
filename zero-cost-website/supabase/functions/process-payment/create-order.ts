
// Module for creating PayPal orders
import { PAYPAL_API_URL, getPayPalAccessToken, PayPalOrderResponse } from './paypal-client.ts';

export async function createPayPalOrder(
  amount: number,
  description: string,
  currency = 'BRL',
  formId?: string
): Promise<PayPalOrderResponse> {
  console.log(`🚀 [create-order] Creating PayPal order: amount=${amount} ${currency}, description=${description}`);
  
  // Validate that the currency is supported
  if (!['BRL', 'USD'].includes(currency)) {
    console.warn(`⚠️ [create-order] Unsupported currency: ${currency}. Defaulting to BRL.`);
    currency = 'BRL';
  }
  
  // Verify the amount is a valid number
  if (isNaN(amount) || amount <= 0) {
    console.error(`💥 [create-order] Invalid amount: ${amount}`);
    throw new Error(`Invalid amount: ${amount}`);
  }
  
  // Format the amount with 2 decimal places
  const formattedAmount = amount.toFixed(2);
  console.log(`💰 [create-order] Formatted amount: ${formattedAmount} ${currency}`);
  
  try {
    // Get PayPal access token
    console.log('🔄 [create-order] Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('✅ [create-order] PayPal authentication successful');
    
    // Create order with the obtained token
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: formattedAmount
        },
        description: description,
        custom_id: formId || ''  // Store formId in custom_id field
      }]
    };
    
    console.log('📦 [create-order] Order payload:', JSON.stringify(orderPayload));
    
    console.log(`🔄 [create-order] Creating order at ${PAYPAL_API_URL}/v2/checkout/orders`);
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderPayload)
    });
    
    // Log the raw response for debugging
    const orderResponseStatus = orderResponse.status;
    const orderResponseText = await orderResponse.text();
    console.log(`📊 [create-order] PayPal order response status: ${orderResponseStatus}`);
    console.log(`📊 [create-order] PayPal order response body: ${orderResponseText}`);
    
    if (!orderResponse.ok) {
      console.error(`💥 [create-order] PayPal order creation error: ${orderResponseStatus} - ${orderResponseText}`);
      throw new Error(`Failed to create PayPal order: ${orderResponseStatus} - ${orderResponseText}`);
    }
    
    // Parse the JSON response (after reading it as text)
    let orderData;
    try {
      orderData = JSON.parse(orderResponseText);
    } catch (e) {
      console.error(`💥 [create-order] Error parsing PayPal response: ${e}`);
      throw new Error(`Invalid JSON response from PayPal: ${orderResponseText}`);
    }
    
    console.log(`✅ [create-order] PayPal order created: ${orderData.id} (status: ${orderData.status})`);
    
    return {
      id: orderData.id,
      status: orderData.status,
      links: orderData.links
    };
  } catch (error) {
    console.error('💥 [create-order] Error in createPayPalOrder:', error);
    return {
      id: '',
      status: 'ERROR',
      links: [],
      error: String(error)
    };
  }
}
