
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export const usePayPalOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Create PayPal order
  const createPayPalOrder = async (
    amount: number,
    description: string,
    formId: string,
    currency: string = 'BRL'
  ) => {
    if (!formId) {
      console.error("❌ [usePayPalOperations] No formId provided for PayPal order");
      return null;
    }
    
    setIsProcessing(true);
    try {
      console.log(`💰 [usePayPalOperations] Creating PayPal order: amount=${amount} ${currency}, formId=${formId}`);
      console.log(`📝 [usePayPalOperations] Order description: ${description}`);
      
      // Validate currency 
      const validCurrency = ['BRL', 'USD'].includes(currency) ? currency : 'BRL';
      if (validCurrency !== currency) {
        console.warn(`⚠️ [usePayPalOperations] Invalid currency ${currency} detected, defaulting to ${validCurrency}`);
      }
      
      // Garanta que o valor seja um número válido
      const validAmount = parseFloat(amount.toFixed(2));
      console.log(`💵 [usePayPalOperations] Formatted amount: ${validAmount} ${validCurrency}`);
      
      // Log the exact request being sent to the edge function
      const requestBody = {
        action: "create_order",
        orderData: {
          amount: validAmount,
          description,
          currency: validCurrency,
          formId
        }
      };
      
      console.log('🔄 [usePayPalOperations] Chamando edge function process-payment com payload:', JSON.stringify(requestBody, null, 2));
      
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: requestBody
      });

      // Log da resposta completa da API
      console.log('📊 [usePayPalOperations] Resposta completa da Edge Function create_order:', JSON.stringify({ data, error }, null, 2));

      if (error) {
        console.error("❌ [usePayPalOperations] Error creating order:", error);
        console.error("❌ [usePayPalOperations] Error details:", JSON.stringify(error, null, 2));
        toast.error("Erro ao iniciar o pagamento. Por favor, tente novamente.");
        return null;
      }

      if (!data) {
        console.error("❌ [usePayPalOperations] Nenhum dado retornado da edge function");
        toast.error("Resposta vazia do servidor. Por favor, tente novamente.");
        return null;
      }
      
      if (data.error) {
        console.error("❌ [usePayPalOperations] Erro retornado pela edge function:", data.error);
        toast.error(`Erro do servidor: ${data.error}`);
        return null;
      }

      if (!data.id) {
        console.error("❌ [usePayPalOperations] ID do pedido não encontrado na resposta:", data);
        toast.error("Resposta inválida do servidor. Por favor, tente novamente.");
        return null;
      }

      console.log(`✅ [usePayPalOperations] PayPal order created successfully: ${data.id} (currency: ${validCurrency})`);
      return data.id;
    } catch (error) {
      console.error("❌ [usePayPalOperations] Error creating PayPal order:", error);
      console.error("❌ [usePayPalOperations] Error stack:", error instanceof Error ? error.stack : "No stack trace");
      toast.error("Erro ao conectar com o PayPal. Por favor, tente novamente.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture PayPal order (finalize payment)
  const capturePayPalOrder = async (
    orderId: string,
    formId: string,
    amount: number,
    currency: string = 'BRL'
  ) => {
    if (!orderId || !formId) {
      console.error("❌ [usePayPalOperations] Missing orderId or formId for capture:", { orderId, formId });
      return null;
    }
    
    setIsProcessing(true);
    try {
      console.log(`🔍 [usePayPalOperations] Capturing PayPal order: ${orderId}, for form: ${formId}, amount: ${amount} ${currency}`);
      
      // Validate currency
      const validCurrency = ['BRL', 'USD'].includes(currency) ? currency : 'BRL';
      if (validCurrency !== currency) {
        console.warn(`⚠️ [usePayPalOperations] Currency normalized from ${currency} to ${validCurrency} for capture`);
      }
      
      // Garanta que o valor seja um número válido
      const validAmount = parseFloat(amount.toFixed(2));
      console.log(`💵 [usePayPalOperations] Formatted capture amount: ${validAmount} ${validCurrency}`);
      
      // Log the exact request being sent
      const requestBody = {
        action: "capture_order",
        orderData: {
          orderId: orderId,
          formId: formId,
          amount: validAmount,
          currency: validCurrency
        }
      };
      
      console.log('🔄 [usePayPalOperations] Chamando edge function process-payment para captura:', JSON.stringify(requestBody, null, 2));
      
      const { data: captureData, error } = await supabase.functions.invoke("process-payment", {
        body: requestBody
      });

      // Log detalhado para depuração
      console.log('📊 [usePayPalOperations] Resposta completa da captura:', JSON.stringify({ captureData, error }, null, 2));

      if (error) {
        console.error("❌ [usePayPalOperations] Erro na chamada da função de captura:", error);
        console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
        toast.error("Erro ao comunicar com o servidor. Por favor, tente novamente.");
        return null;
      }

      if (!captureData) {
        console.error("❌ [usePayPalOperations] Resposta de captura vazia");
        toast.error("Resposta vazia do servidor. Por favor, tente novamente.");
        return null;
      }

      if (captureData.error) {
        console.error("❌ [usePayPalOperations] Erro retornado na captura:", captureData.error);
        console.error("Detalhes completos:", JSON.stringify(captureData, null, 2));
        toast.error(`Erro ao processar pagamento: ${captureData.error}`);
        return null;
      }

      console.log("📊 [usePayPalOperations] Resposta detalhada da captura:", JSON.stringify(captureData, null, 2));

      if (captureData && captureData.status === "COMPLETED") {
        console.log(`✅ [usePayPalOperations] Payment completed by PayPal (${validCurrency}):`, captureData);
        toast.success("Pagamento confirmado!");
        return captureData.id;
      } else {
        const status = captureData ? captureData.status : "Desconhecido";
        console.warn(`⚠️ [usePayPalOperations] Payment not completed. Status: ${status}, Currency: ${validCurrency}`);
        toast.warning(`Pagamento não foi concluído. Status: ${status}`);
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : "No stack trace";
      console.error(`❌ [usePayPalOperations] Error capturing PayPal order: ${errorMsg}`);
      console.error("Stack:", stack);
      console.error("Detalhes completos do erro:", JSON.stringify(error, null, 2));
      toast.error("Erro ao finalizar o pagamento. Por favor, verifique.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { createPayPalOrder, capturePayPalOrder, isProcessing };
};
