import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DirectStripeButtonProps {
  amount: number;
  plan: string;
  formId: string;
}

/**
 * Componente ultra-simplificado para pagamento com Stripe
 * Elimina qualquer dependência das bibliotecas Stripe no frontend
 * Usa apenas redirecionamento direto para o servidor
 */
const DirectStripeButton: React.FC<DirectStripeButtonProps> = ({
  amount,
  plan,
  formId
}) => {
  const { language } = useLanguage();

  // Função de redirecionamento que envia para a rota no servidor
  const handlePayment = () => {
    // Calcular o valor em centavos
    const amountInCents = Math.round(amount * 100);
    
    // Criar a URL com query parameters
    const redirectUrl = `/api/checkout-redirect?amount=${amountInCents}&currency=brl&plan=${plan}&formId=${formId || 'unknown'}`;
    
    console.log('Redirecionando para:', redirectUrl);
    
    // Redirecionar para o servidor que criará a sessão de checkout
    window.location.href = redirectUrl;
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all flex items-center justify-center"
    >
      {language === 'en' ? 'Pay with Credit Card' : 'Pagar com Cartão de Crédito'}
    </button>
  );
};

export default DirectStripeButton;