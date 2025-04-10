
import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PayPalScriptLoaderProps {
  clientId: string | null;
  sdkError: string | null;
  createOrder: () => Promise<string | null>;
  onApprove: (data: any) => Promise<any>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currency?: string;
}

const PayPalScriptLoader: React.FC<PayPalScriptLoaderProps> = ({
  clientId,
  sdkError,
  createOrder,
  onApprove,
  isLoading,
  setIsLoading,
  currency = 'BRL'
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  
  // Log component props for debugging
  useEffect(() => {
    console.log("🔍 [PayPalScriptLoader] Props recebidas:", {
      clientIdExists: !!clientId,
      clientIdPrefix: clientId ? clientId.substring(0, 5) + '...' : null,
      sdkError,
      isLoading,
      currency
    });
  }, [clientId, sdkError, isLoading, currency]);
  
  useEffect(() => {
    // Log loading state changes for debugging
    console.log("🔄 [PayPalScriptLoader] isLoading mudou para", isLoading);
    console.log("💱 [PayPalScriptLoader] usando moeda para processamento", currency);
  }, [isLoading, currency]);

  // Function to handle script loading errors
  const handleScriptError = (err: any) => {
    console.error("❌ [PayPalScriptLoader] Erro ao carregar script PayPal:", err);
    setScriptError(`${err}`);
    toast.error("Erro ao carregar o PayPal. Por favor, atualize a página e tente novamente.");
  };

  // Function to handle script initialization
  const handleScriptInit = () => {
    console.log("✅ [PayPalScriptLoader] PayPal script inicializado com sucesso!");
    setScriptLoaded(true);
  };
  
  if (sdkError) {
    console.error("❌ [PayPalScriptLoader] PayPal SDK Error:", sdkError);
    return (
      <div className="p-4 text-center text-red-500 border border-red-200 rounded-lg">
        <p>Erro ao carregar PayPal: {sdkError}</p>
        <p className="text-sm mt-2">Por favor, tente novamente mais tarde ou entre em contato com o suporte.</p>
      </div>
    );
  }

  if (!clientId) {
    console.log("⏳ [PayPalScriptLoader] Aguardando clientId do PayPal...");
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // Garantir que a moeda seja sempre BRL (para processamento)
  const processingCurrency = 'BRL'; // Forçar BRL para processamento
  const safeClientId = clientId ? clientId.trim() : '';
  
  console.log(`🔄 [PayPalScriptLoader] Inicializando script com moeda ${processingCurrency} e clientId ${safeClientId.substring(0, 5)}...`);
  
  // Simplified options for PayPalScriptProvider to avoid URI malformed errors
  const scriptOptions = {
    clientId: safeClientId,
    currency: processingCurrency,
    intent: "capture",
    components: "buttons"
  };
  
  console.log("🔧 [PayPalScriptLoader] Opções do script:", JSON.stringify(scriptOptions, null, 2));
  
  return (
    <PayPalScriptProvider options={scriptOptions}>
      {scriptError && (
        <div className="p-3 text-center text-red-500 border border-red-200 rounded-lg mb-3">
          <p>Erro ao carregar PayPal: {scriptError}</p>
          <button 
            className="text-sm mt-2 underline text-blue-500"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}
      
      <div className="paypal-button-container">
        <PayPalButtons
          style={{ 
            layout: "vertical",
            shape: "rect",
            color: "gold"
          }}
          createOrder={(data, actions) => {
            console.log(`🔄 [PayPalButtons] Criando pedido (moeda de processamento: ${processingCurrency})`);
            console.log("🔧 [PayPalButtons] Ações disponíveis:", Object.keys(actions).join(', '));
            
            return createOrder()
              .then(orderId => {
                console.log(`✅ [PayPalButtons] Pedido criado com sucesso: ${orderId}`);
                if (!orderId) {
                  const error = new Error("Falha ao criar pedido (ID nulo retornado)");
                  console.error(error);
                  throw error;
                }
                return orderId;
              })
              .catch(err => {
                console.error("❌ [PayPalButtons] Erro detalhado ao criar pedido:", err);
                // Registrar mais detalhes do erro para debug
                console.error("Tipo do erro:", typeof err);
                console.error("Mensagem:", err.message);
                console.error("Stack:", err.stack);
                toast.error("Erro ao criar pedido. Por favor, tente novamente.");
                throw err;
              });
          }}
          onApprove={(data, actions) => {
            console.log(`✅ [PayPalButtons] Pedido aprovado: ${data.orderID}, moeda de processamento: ${processingCurrency}`);
            console.log("📊 [PayPalButtons] Dados completos da aprovação:", JSON.stringify(data, null, 2));
            
            // Adicionar toast imediato para indicar que o botão foi clicado
            toast.info("Processando seu pagamento...");
            
            return onApprove(data)
              .then(result => {
                console.log("✅ [PayPalButtons] Resultado da captura:", result);
                return result;
              })
              .catch(err => {
                console.error("❌ [PayPalButtons] Erro durante a captura do pagamento:", err);
                console.error("Stack:", err.stack);
                toast.error("Erro ao finalizar o pagamento. Por favor, tente novamente.");
                throw err;
              });
          }}
          onError={(err) => {
            console.error("❌ [PayPalButtons] Erro durante o pagamento:", err);
            console.error("Detalhes do erro PayPal:", JSON.stringify(err, null, 2));
            setScriptError(`Erro no PayPal: ${err.message || JSON.stringify(err)}`);
            toast.error("Ocorreu um erro no processamento do PayPal. Por favor, tente novamente.");
            setIsLoading(false);
          }}
          onCancel={() => {
            console.log("ℹ️ [PayPalButtons] Pagamento cancelado pelo usuário");
            toast.info("Pagamento cancelado");
            setIsLoading(false);
          }}
        />
      </div>
      
      {scriptLoaded && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          PayPal carregado com sucesso (processamento em {processingCurrency})
        </div>
      )}
    </PayPalScriptProvider>
  );
};

export default PayPalScriptLoader;
