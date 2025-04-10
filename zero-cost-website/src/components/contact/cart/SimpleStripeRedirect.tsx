import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

interface SimpleStripeRedirectProps {
  amount: number;
  plan: string;
  formId: string;
  onSuccess: (paymentId: string) => void;
}

/**
 * Componente simplificado para integração com Stripe
 * Direciona diretamente para a URL de checkout do Stripe
 */
const SimpleStripeRedirect: React.FC<SimpleStripeRedirectProps> = ({
  amount,
  plan,
  formId
}) => {
  const { language } = useLanguage();

  // Criar URL para chamar diretamente o servidor e redirecionamento
  const handlePaymentRedirect = () => {
    // Calcular o valor em centavos
    const amountInCents = Math.round(amount * 100);
    
    // Criar a URL de redirecionamento para o servidor com todos os parâmetros na URL
    // Isso evita qualquer problema com fetch API ou erros de JavaScript
    const redirectUrl = `/api/checkout-redirect?amount=${amountInCents}&currency=brl&plan=${plan}&formId=${formId || 'unknown'}`;
    
    // Redirecionar diretamente para a URL
    window.location.href = redirectUrl;
  };

  return (
    <button
      onClick={handlePaymentRedirect}
      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md 
        transition-all flex items-center justify-center"
    >
      {language === 'en' ? 'Pay with Credit Card' : 'Pagar com Cartão de Crédito'}
    </button>
  );
};

export default SimpleStripeRedirect;