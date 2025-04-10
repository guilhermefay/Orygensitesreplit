
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export const usePayPalClientId = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [requestAttempt, setRequestAttempt] = useState(0); // Track retry attempts
  
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        setIsLoading(true);
        console.log(`🔍 [usePayPalClientId] Buscando PayPal Client ID do servidor... (tentativa ${requestAttempt + 1})`);
        
        // Log what's being sent to the edge function
        const requestBody = { action: "get_client_id" };
        console.log("📤 [usePayPalClientId] Enviando requisição:", JSON.stringify(requestBody, null, 2));
        
        const { data, error } = await supabase.functions.invoke("process-payment", {
          body: requestBody
        });

        if (error) {
          console.error("❌ [usePayPalClientId] Erro ao buscar PayPal client ID:", error);
          console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
          toast.error("Erro ao conectar com o PayPal. Por favor, tente novamente.");
          setSdkError(`Erro ao buscar Client ID: ${error.message}`);
          
          // Retry logic if needed (max 3 attempts)
          if (requestAttempt < 2) {
            console.log(`🔄 [usePayPalClientId] Tentando novamente em 2 segundos (tentativa ${requestAttempt + 1}/3)...`);
            setTimeout(() => setRequestAttempt(prev => prev + 1), 2000);
          }
          return;
        }

        console.log("📊 [usePayPalClientId] Resposta completa get_client_id:", JSON.stringify(data, null, 2));

        if (data && data.clientId) {
          // Sanitize the clientId to prevent URI malformed errors
          const sanitizedClientId = data.clientId.trim();
          console.log(`✅ [usePayPalClientId] Client ID recebido com sucesso: ${sanitizedClientId.substring(0, 5)}...`);
          setClientId(sanitizedClientId);
          setSdkReady(true);
        } else {
          console.error("❌ [usePayPalClientId] PayPal client ID não retornado. Resposta:", JSON.stringify(data, null, 2));
          toast.error("Configuração do PayPal não encontrada. Por favor, contate o suporte.");
          setSdkError("Client ID não retornado do servidor");
          
          // Retry logic
          if (requestAttempt < 2) {
            console.log(`🔄 [usePayPalClientId] Tentando novamente em 2 segundos (tentativa ${requestAttempt + 1}/3)...`);
            setTimeout(() => setRequestAttempt(prev => prev + 1), 2000);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : "No stack trace";
        console.error("❌ [usePayPalClientId] Exceção ao buscar client ID:", errorMsg);
        console.error("Stack trace:", errorStack);
        
        // More detailed error logging
        console.error("Tipo de erro:", typeof error);
        console.error("JSON de erro:", JSON.stringify(error, null, 2));
        
        toast.error("Erro ao conectar com o PayPal. Por favor, tente novamente.");
        setSdkError(`Exceção: ${errorMsg}`);
        
        // Retry logic
        if (requestAttempt < 2) {
          console.log(`🔄 [usePayPalClientId] Tentando novamente em 2 segundos (tentativa ${requestAttempt + 1}/3)...`);
          setTimeout(() => setRequestAttempt(prev => prev + 1), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientId();
  }, [requestAttempt]); // Added dependency on requestAttempt for retry logic

  return { isLoading, clientId, sdkError, sdkReady };
};
