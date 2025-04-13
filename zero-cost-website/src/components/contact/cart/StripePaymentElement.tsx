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

// Get the Stripe public key from environment variables
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Initialize the Stripe object outside of the component to avoid re-creating it on every render
let stripePromise: Promise<any> | null = null;

if (stripePublicKey) {
  stripePromise = loadStripe(stripePublicKey);
} else {
  console.error('Missing Stripe public key. Please check your environment variables.');
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
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet, or elements haven't been created
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Confirm the payment
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
  plan
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    // Create a PaymentIntent on the server and get its client secret
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Calculate amount in smallest currency unit (cents)
        const amountInCents = Math.round(amount * 100);
        
        console.log('[StripePaymentElement] Criando payment intent com estes detalhes:');
        console.log('- Amount:', amountInCents, 'cents');
        console.log('- Currency:', currency);
        console.log('- Form ID:', formId);
        console.log('- Plan:', plan);
        console.log('- Form Data:', JSON.stringify({
          name: formData.name,
          email: formData.email,
          business: formData.business,
          plan: formData.selectedPlan
        }));
        
        // Call our backend API to create a payment intent
        console.log('[StripePaymentElement] Fazendo chamada para /api/create-payment-intent');
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan,
            formData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        console.log('Payment intent created successfully with client secret');
        
        // Save the form ID to localStorage for recovery scenarios
        if (data.formId) {
          localStorage.setItem('form_id', data.formId);
          console.log('Saved form ID to localStorage:', data.formId);
        }
        
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Failed to create payment intent');
        toast.error(
          language === 'en' 
            ? 'Failed to initialize payment. Please try again.' 
            : 'Falha ao inicializar o pagamento. Por favor, tente novamente.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, currency, formId, plan, formData, language]);

  if (!stripePromise) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
        {language === 'en' 
          ? 'Stripe has not been properly configured. Please contact support.' 
          : 'O Stripe não foi configurado corretamente. Por favor, entre em contato com o suporte.'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
        <p className="font-medium mb-2">
          {language === 'en' ? 'Error initializing payment' : 'Erro ao inicializar pagamento'}
        </p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          {language === 'en' ? 'Try Again' : 'Tentar Novamente'}
        </button>
      </div>
    );
  }

  if (isLoading || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">
          {language === 'en' ? 'Setting up payment...' : 'Preparando pagamento...'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        <StripePaymentForm 
          clientSecret={clientSecret} 
          onSuccess={onSuccess}
          businessName={formData.business}
          formId={formId}
        />
      </Elements>
    </div>
  );
};

export default StripePaymentElement;