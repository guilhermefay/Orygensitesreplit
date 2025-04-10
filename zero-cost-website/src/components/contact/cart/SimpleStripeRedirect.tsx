import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Mostrar mensagem de carregamento em português ou inglês
      const loadingMessage = language === 'en' ? 'Processing payment...' : 'Processando pagamento...';
      toast({
        title: loadingMessage,
        description: language === 'en' ? 'Please wait...' : 'Por favor, aguarde...',
      });
      
      try {
        // Primeiro, verificar se o Stripe está configurado
        const testResponse = await fetch(`${window.location.origin}/api/stripe-test`);
        const testData = await testResponse.json();
        
        if (testResponse.status !== 200 || testData.status !== 'ok') {
          throw new Error(testData.message || 'Erro de configuração do Stripe no servidor');
        }
      } catch (error) {
        console.error('Erro ao verificar configuração do Stripe:', error);
        // Continuar mesmo com erro, pois o servidor pode ainda funcionar
      }
      
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
      
      // Forçar o uso do redirecionamento para o Checkout Session do Stripe
      const payload = { 
        amount: amountInCents,
        currency: 'brl',
        plan,
        formId,
        redirect: true // Forçar redirecionamento para Checkout Session
      };
      
      console.log('Enviando payload para o servidor:', payload);
      
      // Criar o PaymentIntent ou Checkout Session no servidor
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: language === 'en' ? 'Payment Error' : 'Erro no Pagamento',
          description: errorData.message || language === 'en' ? 'Failed to create payment session' : 'Falha ao criar sessão de pagamento',
          variant: "destructive",
        });
        throw new Error(errorData.message || 'Erro ao criar sessão de pagamento');
      }
      
      const data = await response.json();
      console.log('Resposta do servidor:', data);
      
      // Verificar se recebemos uma URL para redirecionamento (preferido)
      if (data.redirectUrl) {
        console.log('Redirecionando para URL do Stripe:', data.redirectUrl);
        // Redirecionar para a página de pagamento do Stripe
        window.location.href = data.redirectUrl;
        return;
      } 
      
      // Fallback para clientSecret com checkout.stripe.com
      if (data.clientSecret) {
        console.log('Usando checkout.stripe.com com clientSecret');
        const stripeCheckoutUrl = `https://checkout.stripe.com/pay/${data.clientSecret}`;
        window.location.href = stripeCheckoutUrl;
        return;
      }
      
      // Se chegou aqui, não temos uma forma de redirecionar
      throw new Error('Resposta inválida do servidor, não contém redirectUrl ou clientSecret');
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      // Usar o toast em vez de alert para melhor UX
      toast({
        title: language === 'en' ? 'Payment Error' : 'Erro no Pagamento',
        description: language === 'en' 
          ? 'Error processing payment. Please try again.' 
          : 'Erro ao processar pagamento. Por favor, tente novamente.',
        variant: "destructive",
      });
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