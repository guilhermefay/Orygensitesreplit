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
import confetti from 'canvas-confetti';

// Remover hardcoding e usar variável de ambiente do Vite
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY!;
console.log('[STRIPE] Usando chave pública do Vite:', stripePublicKey ? stripePublicKey.substring(0, 10) + '...' : 'NÃO DEFINIDA');
const finalStripeKey = stripePublicKey;

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
      } else if (paymentIntent) {
        console.log('PaymentIntent retornado:', paymentIntent);
        if (paymentIntent.status === 'succeeded') {
          toast.success(
            language === 'en' 
              ? 'Payment successful!' 
              : 'Pagamento realizado com sucesso!'
          );
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          if (formId) {
            localStorage.setItem('form_id', formId);
            console.log('[StripePaymentForm] formId salvo no localStorage:', formId);
          } else {
            console.warn('[StripePaymentForm] formId não disponível no momento do sucesso! Tentando recuperar do localStorage.');
          }
          if (paymentIntent.id) {
            localStorage.setItem('current_payment_id', paymentIntent.id);
          }
          const finalFormId = formId || localStorage.getItem('form_id') || '';
          onSuccess(paymentIntent.id, finalFormId);
        } else if (paymentIntent.status === 'processing') {
          setErrorMessage('O pagamento está sendo processado. Aguarde a confirmação do Stripe.');
          toast.info('O pagamento está sendo processado. Você será notificado quando for confirmado.');
        } else if (paymentIntent.status === 'requires_action') {
          setErrorMessage('O pagamento requer uma ação adicional. Siga as instruções do Stripe.');
          toast.warning('O pagamento requer uma ação adicional. Siga as instruções do Stripe.');
        } else {
          setErrorMessage('Status inesperado do pagamento: ' + paymentIntent.status);
          toast.error('Status inesperado do pagamento: ' + paymentIntent.status);
        }
      } else {
        setErrorMessage('Não foi possível processar o pagamento. Tente novamente.');
        toast.error('Não foi possível processar o pagamento. Tente novamente.');
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
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-sm text-gray-600">
            {language === 'en' ? 'Aguarde um momento...' : 'Aguarde um momento...'}
          </p>
        </div>
      )}
      {!isLoading && <PaymentElement />}
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
            <Loader2 className="h-5 w-5 animate-spin text-white mr-2" />
            {language === 'en' ? 'Processando...' : 'Processando...'}
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