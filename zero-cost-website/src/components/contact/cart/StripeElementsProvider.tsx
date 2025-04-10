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
// Verificando se a chave pública existe e exibindo um erro se não existir
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY) {
  console.error('Chave pública do Stripe não encontrada! Verifique a variável de ambiente VITE_STRIPE_PUBLIC_KEY');
}

// Inicialização segura do Stripe
let stripePromise;
try {
  stripePromise = loadStripe(STRIPE_PUBLIC_KEY || '');
} catch (error) {
  console.error('Erro ao carregar o Stripe:', error);
}

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
        console.log('Iniciando criação de PaymentIntent...');

        // Calcular o valor em centavos
        const amountInCents = Math.round(amount * 100);
        console.log('Valor calculado em centavos:', amountInCents);
        
        // Criar a PaymentIntent
        // Em nossa configuração unificada, a API está no mesmo servidor que a aplicação
        
        // Usar o origin atual para criar a URL da API
        const apiUrl = `${window.location.origin}/api/create-payment-intent`;
        
        // Log completo da URL que estamos usando para depuração
        console.log('Configuração atual:');
        
        // Logs para depuração
        console.log('Hostname atual:', window.location.hostname);
        console.log('Porta atual:', window.location.port);
        console.log('Origin completo:', window.location.origin);
        console.log('Usando API URL:', apiUrl);
        
        console.log('Enviando requisição para criar PaymentIntent com dados:', { 
          amount: amountInCents,
          currency: 'brl',
          plan,
          formId
        });
          
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

        console.log('Resposta recebida do servidor:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erro na resposta do servidor:', errorData);
          throw new Error(errorData.message || 'Erro ao criar PaymentIntent');
        }

        const data = await response.json();
        console.log('PaymentIntent criado com sucesso, ClientSecret recebido');
        
        if (!data.clientSecret) {
          console.error('Resposta não contém clientSecret:', data);
          throw new Error('A resposta do servidor não contém um clientSecret válido');
        }
        
        console.log('Definindo clientSecret e inicializando formulário de pagamento');
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

  // Verificar se o stripePromise foi inicializado corretamente
  if (!stripePromise) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p className="font-medium">
          {language === 'en' ? 'Configuration Error' : 'Erro de Configuração'}:
        </p>
        <p>
          {language === 'en' 
            ? 'Payment system is not properly configured. Please contact support.' 
            : 'Sistema de pagamento não está configurado corretamente. Por favor, entre em contato com o suporte.'}
        </p>
      </div>
    );
  }

  // Renderizar o componente Elements do Stripe
  return (
    <div className="w-full rounded-lg overflow-hidden">
      <Elements stripe={stripePromise} options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0369a1', // Cor primária azul
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
          }
        } 
      }}>
        <StripeCheckoutForm 
          onSuccess={onSuccess}
          plan={plan}
          formId={formId}
        />
      </Elements>
    </div>
  );
};

export default StripeElementsProvider;