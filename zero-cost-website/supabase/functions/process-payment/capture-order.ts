
// Module for capturing PayPal orders
import { PAYPAL_API_URL, getPayPalAccessToken, PayPalCaptureResponse } from './paypal-client.ts';

export async function capturePayPalOrder(
  orderId: string,
  formId?: string
): Promise<PayPalCaptureResponse> {
  console.log(`🔍 [capture-order] Capturing PayPal order: ${orderId}, form ID: ${formId || 'not provided'}`);
  
  try {
    // Get PayPal access token
    console.log('🔄 [capture-order] Getting PayPal access token for capture...');
    const accessToken = await getPayPalAccessToken();
    console.log('✅ [capture-order] PayPal authentication successful for capture');
    
    // Capture the payment with the obtained token
    console.log(`🔄 [capture-order] Sending capture request for order: ${orderId} to ${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`);
    
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': crypto.randomUUID()
      }
    });
    
    // Log the raw response for debugging
    const captureResponseStatus = captureResponse.status;
    const captureResponseText = await captureResponse.text();
    console.log(`📊 [capture-order] PayPal capture response status: ${captureResponseStatus}`);
    console.log(`📊 [capture-order] PayPal capture response body: ${captureResponseText}`);
    
    if (!captureResponse.ok) {
      console.error(`💥 [capture-order] PayPal capture error: ${captureResponseStatus} - ${captureResponseText}`);
      return {
        id: orderId,
        status: 'ERROR',
        error: captureResponseText
      };
    }
    
    // Parse the JSON response (after reading it as text)
    let captureData;
    try {
      captureData = JSON.parse(captureResponseText);
    } catch (e) {
      console.error(`💥 [capture-order] Error parsing PayPal capture response: ${e}`);
      throw new Error(`Invalid JSON response from PayPal capture: ${captureResponseText}`);
    }
    
    console.log(`✅ [capture-order] PayPal payment captured: ${captureData.id} (status: ${captureData.status})`);
    
    // Extract the payer_id and other relevant data
    let payer_id = '';
    let amount = 0;
    let currency = '';
    
    try {
      payer_id = captureData.payer?.payer_id || '';
      console.log(`👤 [capture-order] Payer ID: ${payer_id}`);
      
      // Attempt to extract amount and currency
      if (captureData.purchase_units && 
          captureData.purchase_units.length > 0 && 
          captureData.purchase_units[0].payments && 
          captureData.purchase_units[0].payments.captures && 
          captureData.purchase_units[0].payments.captures.length > 0) {
            
        const capture = captureData.purchase_units[0].payments.captures[0];
        amount = parseFloat(capture.amount.value) || 0;
        currency = capture.amount.currency_code || '';
        console.log(`💵 [capture-order] Captured amount: ${amount} ${currency}`);
      }
      
    } catch (e) {
      console.warn('⚠️ [capture-order] Could not extract complete data from response:', e);
    }
    
    return {
      id: captureData.id,
      status: captureData.status,
      payer_id: payer_id,
      amount: amount,
      currency: currency
    };
  } catch (error) {
    console.error('💥 [capture-order] Error in capturePayPalOrder:', error);
    return {
      id: orderId,
      status: 'ERROR',
      error: String(error)
    };
  }
}
