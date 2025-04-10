import React, { useState } from 'react';
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
 * Usa redirecionamento em vez do Elements para maior compatibilidade
 */
const SimpleStripeRedirect: React.FC<SimpleStripeRedirectProps> = ({
  amount,
  plan,
  formId,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Calcular o valor em centavos
      const amountInCents = Math.round(amount * 100);
      console.log('Valor calculado em centavos:', amountInCents);
      
      // Usar o origin atual para criar a URL da API
      const apiUrl = `${window.location.origin}/api/create-payment-intent`;
      
      // Logs para depuração
      console.log('Redirecionamento simples do Stripe - iniciando pagamento');
      console.log('Usando API URL:', apiUrl);
      console.log('Dados para pagamento:', { 
        amount: amountInCents,
        currency: 'brl',
        plan,
        formId
      });
      
      // Criar o PaymentIntent no servidor
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: amountInCents,
          currency: 'brl',
          plan,
          formId,
          redirect: true, // Indica que queremos URL de redirecionamento
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar PaymentIntent');
      }
      
      const data = await response.json();
      
      console.log('Resposta do servidor:', data);
      
      // Verificar se recebemos uma URL para redirecionamento
      if (data.redirectUrl) {
        console.log('Redirecionando para URL do Stripe:', data.redirectUrl);
        // Redirecionar para a página de pagamento do Stripe
        window.location.href = data.redirectUrl;
      } else if (data.clientSecret) {
        if (data.useCheckoutPage) {
          // Usar a página de checkout do Stripe diretamente
          console.log('Redirecionando para checkout.stripe.com');
          const stripeCheckoutUrl = `https://checkout.stripe.com/pay/${data.clientSecret}`;
          window.location.href = stripeCheckoutUrl;
        } else {
          // Fallback para checkout.stripe.com
          console.log('Usando fallback para checkout.stripe.com');
          const stripeCheckoutUrl = `https://checkout.stripe.com/pay/${data.clientSecret}`;
          window.location.href = stripeCheckoutUrl;
        }
      } else {
        throw new Error('Resposta inválida do servidor, não contém redirectUrl ou clientSecret');
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      alert(
        language === 'en' 
          ? 'Error processing payment. Please try again.' 
          : 'Erro ao processar pagamento. Por favor, tente novamente.'
      );
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md 
        disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {language === 'en' ? 'Processing...' : 'Processando...'}
        </>
      ) : (
        <>
          {language === 'en' ? 'Pay with Credit Card' : 'Pagar com Cartão de Crédito'}
        </>
      )}
    </button>
  );
};

export default SimpleStripeRedirect;