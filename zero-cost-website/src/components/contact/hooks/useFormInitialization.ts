
import { useEffect } from "react";

/**
 * Hook para inicialização do formulário e configuração do pagamento
 * @param formId - ID do formulário atual
 * @param initialPlan - Plano inicial (mensal ou anual)
 * @returns Object com configurações do formulário
 */
export const useFormInitialization = (
  formId: string | null,
  initialPlan: string = "annual"
) => {
  // Add logging to debug formId
  useEffect(() => {
    console.log("ContactForm - current formId:", formId);
    console.log("ContactForm - stored formId:", localStorage.getItem('form_id'));
  }, [formId]);

  // Verificar se estamos em ambiente de desenvolvimento ou produção
  const isDevelopment = process.env.NODE_ENV === 'development' || 
    window.location.hostname.includes('replit') || 
    window.location.hostname.includes('localhost');

  // Log informações sobre o ambiente
  useEffect(() => {
    console.log("Ambiente de execução:", process.env.NODE_ENV);
    console.log("Hostname:", window.location.hostname);
    console.log("Usando pagamento via Stripe:", true);
    console.log("Modo de desenvolvimento:", isDevelopment);
  }, []);

  // Configurar aqui como false explicitamente para usar o StripeElements
  const useRedirect = false;
  
  console.log('🔍 useFormInitialization - RETURNING:', {
    isStripePayment: true,
    useStripeRedirect: useRedirect
  });
  
  return {
    isStripePayment: true, // Always use Stripe for payments now
    useStripeRedirect: useRedirect // IMPORTANTE: false para usar o StripeElements para processar pagamentos na página
  };
};
