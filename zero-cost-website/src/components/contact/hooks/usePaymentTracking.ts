
import { useState, useEffect, useRef } from "react";

export const usePaymentTracking = () => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const paymentAlreadyProcessed = useRef(false);
  
  // Verificar retorno de pagamento quando o componente é montado
  useEffect(() => {
    const checkPaymentReturn = () => {
      // Verificar se estamos retornando de um redirecionamento do Stripe (abordagem antiga)
      const isReturnFromStripe = document.referrer.includes('stripe.com') || 
                              location.search.includes('payment=success');
      
      // Verificar se temos um pagamento concluído no localStorage (abordagem nova)
      const storedPaymentId = localStorage.getItem('payment_id');
      const paymentCompleted = localStorage.getItem('payment_completed') === 'true';
                            
      if (isReturnFromStripe) {
        console.log("Detected possible return from Stripe payment redirect");
        setPaymentCompleted(true);
      } else if (paymentCompleted && storedPaymentId) {
        console.log("Found completed direct payment in localStorage:", storedPaymentId);
        setPaymentId(storedPaymentId);
        setPaymentCompleted(true);
      }
    };
    
    checkPaymentReturn();
  }, []);

  const handlePaymentSuccess = (paymentId: string, onSuccess?: (businessName: string) => void, businessName?: string) => {
    console.log("🎉 Payment completed successfully with ID:", paymentId);
    
    // Prevenir chamadas múltiplas
    if (paymentAlreadyProcessed.current) {
      console.log("Payment already processed, ignoring duplicate callback");
      return;
    }
    
    // Armazenar dados do pagamento no localStorage e estado
    localStorage.setItem('payment_id', paymentId);
    localStorage.setItem('payment_completed', 'true');
    localStorage.setItem('payment_timestamp', Date.now().toString());
    
    paymentAlreadyProcessed.current = true;
    setPaymentId(paymentId);
    setPaymentCompleted(true);
    
    console.log(`Payment and form submitted successfully for: ${businessName}`);
    console.log("Payment state:", { paymentCompleted: true, paymentId, hasCallback: !!onSuccess });
    
    // Chamar callback de sucesso se fornecido
    if (onSuccess && typeof onSuccess === 'function' && businessName) {
      console.log("Calling success callback with business name:", businessName);
      onSuccess(businessName);
    }
  };

  // Resetar flag de pagamento para etapa específica
  const resetPaymentFlag = (step: number) => {
    useEffect(() => {
      if (step !== 4 && (paymentCompleted || paymentAlreadyProcessed.current)) {
        console.log("Resetting payment tracking for step:", step);
        paymentAlreadyProcessed.current = false;
        setPaymentCompleted(false);
        setPaymentId(null);
        
        // Limpar dados do localStorage ao mudar de etapa
        localStorage.removeItem('payment_id');
        localStorage.removeItem('payment_completed');
        localStorage.removeItem('payment_timestamp');
      }
    }, [step, paymentCompleted]);
  };

  return {
    paymentCompleted,
    paymentId,
    handlePaymentSuccess,
    resetPaymentFlag
  };
};
