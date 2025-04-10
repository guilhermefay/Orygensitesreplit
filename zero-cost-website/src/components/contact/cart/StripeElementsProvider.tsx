import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

interface StripeElementsProviderProps {
  amount: number;
  plan: string;
  formId: string;
  onSuccess: (paymentId: string) => void;
}

/**
 * SUBSTITUIÇÃO TOTAL DO COMPONENTE
 * Este componente agora apenas redireciona para a URL de checkout,
 * exatamente como o SimpleStripeRedirect, para resolver problemas de
 * compatibilidade e evitar erros de JavaScript
 */
const StripeElementsProvider: React.FC<StripeElementsProviderProps> = ({ 
  amount, 
  plan, 
  formId
}) => {
  const { language } = useLanguage();

  // Função para redirecionar para o checkout
  const redirectToCheckout = () => {
    // Calcular o valor em centavos
    const amountInCents = Math.round(amount * 100);
    
    // Criar a URL com query parameters
    const redirectUrl = `/api/checkout-redirect?amount=${amountInCents}&currency=brl&plan=${plan}&formId=${formId || 'unknown'}`;
    
    // Redirecionar para o servidor que criará a sessão de checkout
    window.location.href = redirectUrl;
  };

  // Auto-executar o redirecionamento quando o componente for montado
  useEffect(() => {
    console.log("Redirecionando automaticamente para checkout...");
    redirectToCheckout();
  }, []);

  return (
    <div className="w-full p-8 flex flex-col items-center justify-center text-center">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-sm text-gray-500">
        {language === 'en' ? 'Redirecting to payment page...' : 'Redirecionando para página de pagamento...'}
      </p>
    </div>
  );
};

export default StripeElementsProvider;
