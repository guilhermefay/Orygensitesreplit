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
    // LOG ADICIONADO: Início absoluto do handleSubmit
    console.log('>>> StripePaymentForm - handleSubmit EXECUTADO (Início da função)');
    console.log('>>> StripePaymentForm - handleSubmit INICIADO');
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet, or elements haven't been created
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // PAUSA PARA DEBUG: Verificar estado antes de chamar Stripe
    debugger;

    try {
      // 1. Confirmar o pagamento SEM redirecionamento automático inicial
      console.log('>>> StripePaymentForm - CHAMANDO stripe.confirmPayment com redirect: if_required');
      const confirmResult = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Definir return_url aqui é um fallback, mas o ideal é tratar no código
          return_url: `${window.location.origin}/success?formId=${formId}`,
        },
        redirect: 'if_required', // Mantém 'if_required', mas trataremos o resultado
      });

      // LOG ADICIONADO: Resultado IMEDIATO de confirmPayment
      console.log('>>> StripePaymentForm - Resultado IMEDIATO confirmPayment:', confirmResult);

      // 2. Checar erro na confirmação inicial
      if (confirmResult.error) {
        // LOG ADICIONADO: Erro detectado em confirmPayment
        console.error('>>> StripePaymentForm - ERRO DETECTADO em confirmPayment:', confirmResult.error);
        console.error('Erro na confirmação do pagamento:', confirmResult.error);
        setErrorMessage(confirmResult.error.message || 'Erro ao confirmar pagamento.');
        toast.error(confirmResult.error.message || 'Erro ao confirmar pagamento.');
        setIsLoading(false);
        return; // Parar aqui se houve erro na confirmação
      }

      // 3. Se não houve erro, buscar o status mais recente do PaymentIntent
      // (Importante porque o confirmResult pode não ter o status final)
      console.log('>>> StripePaymentForm - Buscando status atualizado do PaymentIntent:', clientSecret);
      const { paymentIntent, error: retrieveError } = await stripe.retrievePaymentIntent(clientSecret);

      // LOG ADICIONADO: Resultado IMEDIATO de retrievePaymentIntent
      console.log('>>> StripePaymentForm - Resultado IMEDIATO retrievePaymentIntent:', { paymentIntent, retrieveError });

      // 4. Checar erro ao buscar o PaymentIntent
      if (retrieveError) {
        // LOG ADICIONADO: Erro detectado em retrievePaymentIntent
        console.error('>>> StripePaymentForm - ERRO DETECTADO em retrievePaymentIntent:', retrieveError);
        console.error('Erro ao buscar PaymentIntent:', retrieveError);
        setErrorMessage(retrieveError.message || 'Erro ao verificar status do pagamento.');
        toast.error(retrieveError.message || 'Erro ao verificar status do pagamento.');
        setIsLoading(false);
        return;
      }

      // 5. Tratar o status final do PaymentIntent
      if (paymentIntent) {
        console.log('Status final do PaymentIntent:', paymentIntent.status);
        if (paymentIntent.status === 'succeeded') {
          console.log(`>>> StripePaymentForm - SUCESSO! Preparando para chamar onSuccess. formId: ${formId}, paymentId: ${paymentIntent.id}`);
          toast.success('Pagamento realizado com sucesso!');
          confetti({
            particleCount: 150, // Mais confete!
            spread: 90,      // Mais espalhado!
            origin: { y: 0.5 }
          });
          // Persistir dados importantes
          if (formId) {
            localStorage.setItem('form_id', formId);
          } else {
            console.warn('[StripePaymentForm] formId indisponível no sucesso!');
          }
          localStorage.setItem('current_payment_id', paymentIntent.id);
          // Chamar o callback de sucesso para navegar
          const finalFormId = formId || localStorage.getItem('form_id') || '';
          console.log(`>>> StripePaymentForm - CHAMANDO onSuccess AGORA com paymentId: ${paymentIntent.id}, formId: ${finalFormId}`);
          onSuccess(paymentIntent.id, finalFormId);
          console.log(`>>> StripePaymentForm - onSuccess CHAMADO.`);
        } else if (paymentIntent.status === 'processing') {
          // LOG ADICIONADO: Status 'processing' detectado
          console.log('>>> StripePaymentForm - STATUS DETECTADO: processing');
          setErrorMessage('O pagamento está sendo processado. Aguarde a confirmação.');
          toast.info('Pagamento em processamento.');
        } else if (paymentIntent.status === 'requires_payment_method') {
          // LOG ADICIONADO: Status 'requires_payment_method' detectado
          console.log('>>> StripePaymentForm - STATUS DETECTADO: requires_payment_method');
          setErrorMessage('Falha no pagamento. Verifique os dados do cartão e tente novamente.');
          toast.error('Falha no pagamento. Verifique os dados do cartão.');
        } else if (paymentIntent.status === 'requires_confirmation') {
          // LOG ADICIONADO: Status 'requires_confirmation' detectado
          console.log('>>> StripePaymentForm - STATUS DETECTADO: requires_confirmation');
          setErrorMessage('Pagamento requer confirmação adicional.');
          toast.info('Pagamento requer confirmação adicional.');
        } else if (paymentIntent.status === 'requires_action') {
          // LOG ADICIONADO: Status 'requires_action' detectado
          console.log('>>> StripePaymentForm - STATUS DETECTADO: requires_action');
          setErrorMessage('Pagamento requer ação adicional (ex: autenticação 3D Secure). Siga as instruções.');
          toast.warning('Pagamento requer ação adicional. Siga as instruções.');
          // Neste caso, o Stripe pode ter redirecionado ou mostrado um modal.
          // Não há ação extra no código aqui, apenas informar o usuário.
        } else {
          setErrorMessage(`Status inesperado: ${paymentIntent.status}`);
          toast.error(`Status inesperado do pagamento: ${paymentIntent.status}`);
        }
      } else {
        // LOG ADICIONADO: paymentIntent nulo após retrieve (sem erro explícito)
        console.warn('>>> StripePaymentForm - ALERTA: paymentIntent veio nulo após retrieve, mesmo sem retrieveError explícito.');
        setErrorMessage('Não foi possível obter o status do pagamento.');
        toast.error('Não foi possível verificar o status do pagamento.');
      }
    } catch (error: any) {
      // LOG ADICIONADO: Captura de erro geral no try/catch
      console.error('>>> StripePaymentForm - ERRO GERAL CAPTURADO no try/catch:', error);
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