import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StripeCheckoutFormProps {
  onSuccess: (paymentId: string) => void;
  plan: string;
  formId: string;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ 
  onSuccess, 
  plan,
  formId 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe ainda não foi carregado
      return;
    }

    setIsLoading(true);
    toast.loading(language === 'en' ? "Processing payment..." : "Processando pagamento...");

    // Gerar um ID de pagamento único para rastreamento
    const paymentId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('current_payment_id', paymentId);
    localStorage.setItem('payment_plan', plan);

    // Confirmar o pagamento
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-success',
      },
      redirect: 'if_required',
    });

    toast.dismiss();

    if (error) {
      // Mostrar mensagem de erro
      console.error('Payment error:', error);
      toast.error(
        language === 'en' 
          ? `Payment failed: ${error.message}` 
          : `Falha no pagamento: ${error.message}`
      );
      setIsLoading(false);
    } else {
      // Pagamento processado com sucesso - sem redirecionamento
      toast.success(
        language === 'en' 
          ? "Payment successful!" 
          : "Pagamento realizado com sucesso!"
      );
      
      // Chamar o callback de sucesso
      onSuccess(paymentId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'en' ? 'Processing...' : 'Processando...'}
          </>
        ) : (
          <>{language === 'en' ? 'Pay Now' : 'Pagar Agora'}</>
        )}
      </Button>
    </form>
  );
};

export default StripeCheckoutForm;