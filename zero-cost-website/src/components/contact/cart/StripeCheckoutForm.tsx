import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { language } = useLanguage();
  
  // Verificar quando o Stripe e Elements estão prontos
  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true);
      console.log('Stripe e Elements estão prontos para uso');
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js não carregou ainda
      toast.error(
        language === 'en' 
          ? 'Payment system not ready. Please try again.' 
          : 'Sistema de pagamento não está pronto. Por favor, tente novamente.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Confirmar o pagamento
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Retornar para a mesma página após o pagamento
          return_url: window.location.href,
          // Passar informações adicionais
          payment_method_data: {
            billing_details: {
              // Poderíamos preencher automaticamente se tivéssemos as informações do usuário
            }
          }
        },
        redirect: 'if_required', // Importante: apenas redireciona se absolutamente necessário
      });

      if (error) {
        // Erros específicos do Stripe
        console.error('Erro no pagamento:', error);
        toast.error(error.message || 
          (language === 'en' 
            ? 'An error occurred during payment' 
            : 'Ocorreu um erro durante o pagamento')
        );
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Pagamento bem-sucedido!
        toast.success(
          language === 'en'
            ? 'Payment successful!'
            : 'Pagamento realizado com sucesso!'
        );
        
        // Chamar callback de sucesso com o ID do pagamento
        onSuccess(paymentIntent.id);
      } else {
        // Outros casos
        toast.info(
          language === 'en' 
            ? 'Finalizing payment. Please wait...' 
            : 'Finalizando pagamento. Por favor, aguarde...'
        );
        
        // Se chegou aqui, provavelmente o pagamento está pendente de processamento
        console.log('Status do pagamento:', paymentIntent?.status);
      }
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      toast.error(
        language === 'en' 
          ? 'An unexpected error occurred' 
          : 'Ocorreu um erro inesperado'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Mostrar mensagem de carregamento enquanto o Stripe não está pronto
  if (!isReady) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center flex-col space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-700">
            {language === 'en' 
              ? 'Loading payment form...' 
              : 'Carregando formulário de pagamento...'}
          </p>
        </div>
      </div>
    );
  }

  // Renderizar o formulário quando estiver pronto
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Formulário de pagamento do Stripe */}
      <div className="mb-6">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: '',
                email: '',
                phone: '',
                address: {
                  country: 'BR',
                },
              },
            },
          }}
        />
      </div>
      
      {/* Botão de pagamento */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-all flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {language === 'en' ? 'Processing...' : 'Processando...'}
          </>
        ) : (
          language === 'en' ? 'Complete Payment' : 'Concluir Pagamento'
        )}
      </button>
      
      {/* Texto de segurança */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        {language === 'en' 
          ? 'Your payment information is processed securely.' 
          : 'Suas informações de pagamento são processadas com segurança.'}
      </p>
    </form>
  );
};

export default StripeCheckoutForm;