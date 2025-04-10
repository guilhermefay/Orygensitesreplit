
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { createPayPalOrder } from './create-order.ts';
import { capturePayPalOrder } from './capture-order.ts';
import { corsHeaders, createErrorResponse, createSuccessResponse } from './config.ts';

// Configure supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  try {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Log raw request information
    console.log(`🔍 [process-payment] Request received: ${req.method} ${req.url}`);
    console.log(`🔍 [process-payment] Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2)}`);
    
    // Parse request body
    const requestText = await req.text();
    console.log(`🔍 [process-payment] Raw request body: ${requestText}`);
    
    // Try to parse as JSON
    let requestBody;
    try {
      requestBody = JSON.parse(requestText);
      console.log(`✅ [process-payment] Request body parsed successfully`);
    } catch (parseError) {
      console.error(`❌ [process-payment] Error parsing request body: ${parseError.message}`);
      console.error(`❌ [process-payment] Raw body that failed to parse: ${requestText}`);
      return createErrorResponse('Failed to parse request body as JSON', null, 400);
    }

    const { action, orderData } = requestBody;
    
    console.log(`🔄 [process-payment] Processando ação de pagamento: ${action}`, orderData ? JSON.stringify(orderData) : 'sem dados');

    // Get PayPal Client ID
    if (action === 'get_client_id') {
      const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
      console.log(`🔑 [process-payment] Requisição get_client_id recebida. Client ID existe: ${!!clientId}`);
      
      if (!clientId) {
        console.error('❌ [process-payment] PAYPAL_CLIENT_ID não está configurado nas variáveis de ambiente');
        return createErrorResponse('PayPal Client ID not configured', null, 500);
      }
      
      console.log(`✅ [process-payment] Retornando client_id: ${clientId.substring(0, 5)}...`);
      return createSuccessResponse({ clientId });
    }

    // Create an order in PayPal
    if (action === 'create_order') {
      const { amount, description, currency = 'BRL', formId } = orderData || {};

      console.log(`📝 [process-payment] Create order request: amount=${amount}, currency=${currency}, formId=${formId}`);

      if (!amount || !description) {
        return createErrorResponse('Missing required data for create_order');
      }

      const result = await createPayPalOrder(amount, description, currency, formId);
      
      if (result.error) {
        console.error(`❌ [process-payment] Failed to create PayPal order: ${result.error}`);
        return createErrorResponse(`Failed to create PayPal order: ${result.error}`);
      }
      
      console.log(`✅ [process-payment] Order created successfully: ${result.id}`);
      return createSuccessResponse(result);
    }

    // Capture an order in PayPal
    if (action === 'capture_order') {
      const { orderId, formId, amount, currency = 'BRL' } = orderData || {};

      console.log(`📝 [process-payment] Capture order request: orderId=${orderId}, formId=${formId}, currency=${currency}`);

      if (!orderId || !formId) {
        return createErrorResponse('Missing required data for capture_order');
      }

      console.log(`💳 [process-payment] Capturando pagamento do pedido ${orderId} para o formulário ${formId} em ${currency}`);

      // Capture the payment
      const captureResult = await capturePayPalOrder(orderId, formId);

      if (captureResult.error) {
        console.error(`❌ [process-payment] Capture error: ${captureResult.error}`);
        return createErrorResponse(captureResult.error);
      }

      try {
        console.log(`✅ [process-payment] Pagamento capturado com sucesso. Migrando dados do formulário ${formId} para form_submissions`);

        // Get the abandoned form data
        const { data: abandonedForm, error: fetchError } = await supabaseClient
          .from('abandoned_forms')
          .select('*')
          .eq('form_id', formId)
          .maybeSingle();

        if (fetchError || !abandonedForm) {
          console.error('❌ [process-payment] Erro ao buscar dados do formulário abandonado:', fetchError || 'Formulário não encontrado');
          return createErrorResponse(
            fetchError?.message || 'Formulário não encontrado',
            { paymentStatus: captureResult.status, id: captureResult.id }
          );
        }

        // Prepare data for form_submissions
        const submissionData = {
          name: abandonedForm.name,
          email: abandonedForm.email,
          phone: abandonedForm.phone,
          business: abandonedForm.business,
          business_details: abandonedForm.business_details,
          color_palette: abandonedForm.color_palette,
          content: abandonedForm.content,
          logo_url: abandonedForm.logo_url,
          photo_urls: abandonedForm.photo_urls,
          selected_plan: abandonedForm.selected_plan,
          plan_variant: abandonedForm.plan_variant,
          payment_status: 'completed',
          payment_id: captureResult.id,
          payment_date: new Date().toISOString(),
          original_form_id: formId // Reference to the original form ID
        };

        console.log(`🔄 [process-payment] Inserindo dados em form_submissions: ${JSON.stringify({ plan_variant: abandonedForm.plan_variant, currency })}`);

        // Insert into form_submissions
        const { data: submissionResult, error: insertError } = await supabaseClient
          .from('form_submissions')
          .insert([submissionData])
          .select();

        if (insertError) {
          console.error('❌ [process-payment] Erro ao inserir dados em form_submissions:', insertError);
          return createErrorResponse(
            insertError.message,
            { paymentStatus: captureResult.status, id: captureResult.id }
          );
        }

        // Delete from abandoned_forms after successful migration
        const { error: deleteError } = await supabaseClient
          .from('abandoned_forms')
          .delete()
          .eq('form_id', formId);

        if (deleteError) {
          console.warn('⚠️ [process-payment] Erro ao excluir formulário de abandoned_forms:', deleteError);
          // Continue anyway, as the main operation succeeded
        }

        // Register payment info in the payments table
        const paymentData = {
          form_submission_id: submissionResult[0].id,
          payment_id: captureResult.id,
          payer_id: captureResult.payer_id,
          amount: captureResult.amount || amount,
          currency: captureResult.currency || currency,
          status: captureResult.status
        };

        console.log(`💰 [process-payment] Registrando informações de pagamento: ${JSON.stringify(paymentData)}`);

        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert([paymentData]);

        if (paymentError) {
          console.warn('⚠️ [process-payment] Erro ao registrar pagamento:', paymentError);
        }

        console.log(`🎉 [process-payment] Migração completa. Formulário ${formId} movido para form_submissions com ID ${submissionResult[0].id}`);

        return createSuccessResponse({
          ...captureResult,
          formSubmissionId: submissionResult[0].id
        });
      } catch (dbError) {
        console.error('❌ [process-payment] Erro no processamento do banco de dados:', dbError);
        return createErrorResponse(
          `Erro no banco de dados: ${dbError.message}`,
          { paymentStatus: captureResult.status, id: captureResult.id }
        );
      }
    }

    console.error(`❌ [process-payment] Ação inválida ou não reconhecida: "${action}"`);
    return createErrorResponse('Invalid action');
  } catch (error) {
    console.error('❌ [process-payment] Erro no processamento da requisição:', error);
    console.error('❌ [process-payment] Stack trace:', error.stack);
    return createErrorResponse(error.message);
  }
});
