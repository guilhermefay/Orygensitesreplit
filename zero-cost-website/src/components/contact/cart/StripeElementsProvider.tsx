import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StripeElementsProviderProps {
  amount: number;
  plan: string;
  formId: string;
  onSuccess: (paymentId: string) => void;
}

// Carregando o Stripe fora do componente para evitar recarregar
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripeElementsProvider: React.FC<StripeElementsProviderProps> = ({ 
  amount, 
  plan, 
  formId,
  onSuccess 
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    // Função para criar a PaymentIntent no servidor
    const createPaymentIntent = async () => {
      try {
        setLoading(true);

        // Calcular o valor em centavos
        const amountInCents = Math.round(amount * 100);
        
        // Criar a PaymentIntent - apontando para o servidor Express
        // Use a URL relativa para que funcione tanto em desenvolvimento quanto em produção
        const apiUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5001/api/create-payment-intent'
          : '/api/create-payment-intent';
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: amountInCents,
            currency: 'brl',
            plan,
            formId
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao criar PaymentIntent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Erro desconhecido');
        toast.error(
          language === 'en' 
            ? 'Error setting up payment. Please try again.' 
            : 'Erro ao configurar pagamento. Por favor, tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, plan, formId, language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>
          {language === 'en' 
            ? 'Preparing payment...' 
            : 'Preparando pagamento...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p className="font-medium">
          {language === 'en' ? 'Error' : 'Erro'}:
        </p>
        <p>{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        <p>
          {language === 'en' 
            ? 'Unable to initialize payment. Please try again.' 
            : 'Não foi possível inicializar o pagamento. Por favor, tente novamente.'}
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm 
        onSuccess={onSuccess}
        plan={plan}
        formId={formId}
      />
    </Elements>
  );
};

export default StripeElementsProvider;