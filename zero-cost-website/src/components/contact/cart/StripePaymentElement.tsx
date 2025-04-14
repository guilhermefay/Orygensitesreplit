import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { ContactFormData, FileData } from '../types';
import { Loader2 } from 'lucide-react';

// Get the Stripe public key from environment variables
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Log para depuração
console.log('[STRIPE] Chave pública disponível?', !!stripePublicKey);

// Usar fallback para desenvolvimento/teste se necessário
const finalStripeKey = stripePublicKey || 'pk_test_51OzEGcBL7JbfJBGnpnuFTzG66XCbiGF3Bqf4fxrSWBt3N9M7lDnTSOkqnYb7QFdnWjQiuDcxgAzEfNoDwuYAu9gw00YhGbxQEV';

// Initialize the Stripe object outside of the component to avoid re-creating it on every render
let stripePromise: Promise<any> | null = null;

try {
  stripePromise = loadStripe(finalStripeKey);
  console.log('[STRIPE] Stripe inicializado com sucesso');
} catch (error) {
  console.error('[STRIPE] Erro ao inicializar Stripe:', error);
}

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string, formId: string) => void;
  businessName: string;
  formId: string;
}

// Inner form component that uses the Stripe hooks
const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  clientSecret, 
  onSuccess,
  businessName,
  formId
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('>>> StripePaymentForm - handleSubmit INICIADO');
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet, or elements haven't been created
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Confirm the payment
      console.log('>>> StripePaymentForm - CHAMANDO stripe.confirmPayment');
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/success', // Fallback in case redirect is required
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        setErrorMessage(
          error.message || 
          (language === 'en' 
            ? 'An error occurred during payment processing.' 
            : 'Ocorreu um erro durante o processamento do pagamento.')
        );
        toast.error(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        toast.success(
          language === 'en' 
            ? 'Payment successful!' 
            : 'Pagamento realizado com sucesso!'
        );
        // Store formId in localStorage for potential page refreshes or redirects
        localStorage.setItem('payment_id', paymentIntent.id);
        // Call the success handler with the payment intent ID and formId
        onSuccess(paymentIntent.id, formId);
      } else {
        console.log('Payment status:', paymentIntent?.status);
        setErrorMessage(
          language === 'en' 
            ? 'Payment is being processed. Please wait...' 
            : 'O pagamento está sendo processado. Por favor, aguarde...'
        );
      }
    } catch (error: any) {
      console.error('Error during payment confirmation:', error);
      setErrorMessage(
        error.message || 
        (language === 'en' 
          ? 'An unexpected error occurred.' 
          : 'Ocorreu um erro inesperado.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {language === 'en' ? 'Processing...' : 'Processando...'}
          </>
        ) : (
          language === 'en' ? 'Pay Now' : 'Pagar Agora'
        )}
      </button>
      
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="text-xs text-gray-500 text-center">
          {language === 'en' 
            ? 'Secure payment processed by Stripe' 
            : 'Pagamento seguro processado pela Stripe'}
        </div>
      </div>
    </form>
  );
};

interface StripePaymentElementProps {
  amount: number;
  currency: string;
  formData: ContactFormData;
  onSuccess: (paymentId: string, formId: string) => void;
  formId: string;
  files: FileData;
  colorPalette: string[];
  finalContent: string;
  plan: string;
  clientSecret: string | null;
}

// Main component that sets up the Stripe Elements
const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
  amount,
  currency,
  formData,
  onSuccess,
  formId,
  files,
  colorPalette,
  finalContent,
  plan,
  clientSecret
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  if (!stripePromise) {
    return (
      <div className="text-center p-4 text-red-600">
        {language === 'en'
          ? 'Stripe failed to load. Please check your internet connection and refresh the page.'
          : 'Falha ao carregar o Stripe. Verifique sua conexão com a internet e atualize a página.'}
      </div>
    );
  }

  if (!clientSecret) {
    console.log('[StripePaymentElement] clientSecret ainda não disponível, renderizando fallback.');
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm text-gray-600">
          {language === 'en' ? 'Initializing payment system...' : 'Inicializando sistema de pagamento...'}
        </p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0570de',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        businessName={formData.business}
        formId={formId}
      />
    </Elements>
  );
};

export default StripePaymentElement;