import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import ReactConfetti from 'react-confetti';
import { loadStripe, Stripe, PaymentIntent } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';

// Log para verificar se o componente está sendo importado
console.log('SuccessPage.tsx carregado!');

// Carregar Stripe fora do componente
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY!;
let stripePromise: Promise<Stripe | null> | null = null;
if (stripePublicKey) {
  stripePromise = loadStripe(stripePublicKey);
  console.log('[SuccessPage] Stripe Promise inicializada.');
} else {
  console.error('[SuccessPage] Chave pública do Stripe não definida!');
}

// Componente interno para lidar com a lógica pós-carregamento do Stripe
const SuccessContent: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [businessName, setBusinessName] = useState<string>('');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showConfetti, setShowConfetti] = useState(false);
  const [finalStatusMessage, setFinalStatusMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [initialParamsChecked, setInitialParamsChecked] = useState(false);

  // Efeito para carregar a instância do Stripe
  useEffect(() => {
    if (stripePromise) {
      stripePromise.then(stripeInstance => {
        if (stripeInstance) {
          console.log('[SuccessPage] Instância do Stripe carregada.');
          setStripe(stripeInstance);
        } else {
          console.error('[SuccessPage] Falha ao carregar instância do Stripe.');
          setFinalStatusMessage('Erro ao inicializar o sistema de pagamento.');
          setIsProcessing(false);
        }
      });
    } else {
       setFinalStatusMessage('Erro: Chave Stripe não configurada.');
       setIsProcessing(false);
    }
  }, []);

  // Obter parâmetros da URL
  const queryParams = new URLSearchParams(location.search);
  const formId = queryParams.get('formId');
  const paymentIntentId = queryParams.get('payment_intent');
  const clientSecret = queryParams.get('payment_intent_client_secret');
  const redirectStatus = queryParams.get('redirect_status');
  const businessParam = queryParams.get('business');

  // Log inicial dos parâmetros (ocorre uma vez na montagem)
  useEffect(() => {
    console.log('[SuccessPage Initial Log] Parâmetros recebidos na URL:', {
        formId,
        paymentIntentId,
        clientSecretPresent: !!clientSecret,
        redirectStatus,
        businessParam,
        fullSearch: location.search
    });
    setInitialParamsChecked(true);
  }, [location.search]);

  // Efeito para atualizar o tamanho da janela (para o confetti)
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Efeito principal para processar o status do pagamento
  useEffect(() => {
    if (!stripe || !initialParamsChecked) {
      console.log('[SuccessPage Process] Aguardando Stripe e/ou leitura inicial de parâmetros...', { hasStripe: !!stripe, paramsChecked: initialParamsChecked });
      if (stripe && !initialParamsChecked) console.warn('[SuccessPage Process] Stripe carregado, mas parâmetros iniciais não foram checados?')
      if (!isProcessing && !stripe) {
         setFinalStatusMessage('Erro crítico: Falha ao carregar sistema de pagamento.');
         setIsProcessing(false);
      }
      return;
    }

    console.log('[SuccessPage Process] Iniciando processamento do retorno de pagamento...');
    const processPaymentReturn = async () => {
      setIsProcessing(true);
      setFinalStatusMessage(null);
      let paymentSucceeded = false;
      let finalBusinessName = '';

      try {
        // Cenário 1: Retorno de um redirect do Stripe (temos clientSecret)
        if (clientSecret) {
          console.log('[SuccessPage] Detectado retorno de redirect Stripe. Verificando status...');
          const { paymentIntent, error: retrieveError } = await stripe.retrievePaymentIntent(clientSecret);

          if (retrieveError) {
            console.error('[SuccessPage] Erro ao buscar Payment Intent pós-redirect:', retrieveError);
            setFinalStatusMessage('Erro ao verificar o pagamento. Entre em contato com o suporte.');
          } else if (paymentIntent) {
            console.log('[SuccessPage] Status do Payment Intent pós-redirect:', paymentIntent.status);
            if (paymentIntent.status === 'succeeded') {
              paymentSucceeded = true;
              toast.success('Pagamento confirmado com sucesso!');
              setFinalStatusMessage('Pagamento confirmado!');
              const metadata: any = paymentIntent.metadata;
              if (metadata && typeof metadata.business_name === 'string') {
                 finalBusinessName = metadata.business_name;
                 console.log('[SuccessPage] Nome da empresa recuperado dos metadados do Stripe (usando any):', finalBusinessName);
              }
            } else if (paymentIntent.status === 'processing') {
              setFinalStatusMessage('Seu pagamento ainda está sendo processado. Atualizaremos em breve.');
            } else {
              setFinalStatusMessage(`O pagamento não foi concluído (Status: ${paymentIntent.status}). Tente novamente ou contate o suporte.`);
            }
          } else {
             setFinalStatusMessage('Não foi possível verificar o status do pagamento após o retorno.');
          }
        }
        // Cenário 2: Navegação direta para /success (temos formId, sem clientSecret de redirect)
        else if (formId) {
           console.log('[SuccessPage] Navegação direta detectada. Assumindo sucesso prévio ou aguardando webhook.');
           paymentSucceeded = true;
           setFinalStatusMessage('Solicitação recebida!');
        }
        // Cenário 3: Fallback pelo nome na URL (raro)
        else if (businessParam) {
           console.log('[SuccessPage] Usando fallback com nome da empresa na URL.');
           paymentSucceeded = true;
           finalBusinessName = decodeURIComponent(businessParam);
           setFinalStatusMessage('Pagamento confirmado (via fallback).');
        }
        // Cenário 4: Sem identificador - erro ou acesso direto inválido
        else {
           console.warn('[SuccessPage] Nenhum identificador (formId, clientSecret, businessParam) encontrado.');
           setFinalStatusMessage('Não foi possível identificar sua solicitação. Se o pagamento foi feito, entre em contato.');
           paymentSucceeded = false;
        }

        if (paymentSucceeded) {
          setShowConfetti(true);
          const timer = setTimeout(() => setShowConfetti(false), 8000);

           if (formId) {
             console.log(`[SuccessPage] Buscando detalhes no Supabase para formId: ${formId}`);
             const { data, error } = await supabase
               .from('form_submissions')
               .select('business')
               .eq('id', formId)
               .single();

             if (error && !finalBusinessName) {
               console.error('[SuccessPage] Erro ao buscar dados no Supabase:', error);
               if (!finalStatusMessage) setFinalStatusMessage('Erro ao buscar detalhes da sua solicitação.');
             } else if (data?.business) {
               finalBusinessName = data.business;
               console.log('[SuccessPage] Nome da empresa recuperado do Supabase:', finalBusinessName);
             } else if (!finalBusinessName) {
               console.warn('[SuccessPage] Nenhum nome de empresa encontrado no Supabase ou metadados.');
             }
           } else if (!finalBusinessName) {
              console.warn('[SuccessPage] formId não disponível para buscar dados do Supabase.');
           }

           setBusinessName(finalBusinessName || 'sua empresa');

           return () => clearTimeout(timer);
        }

      } catch (error) {
        console.error('[SuccessPage] Erro inesperado no processamento:', error);
        setFinalStatusMessage('Ocorreu um erro inesperado ao processar sua solicitação.');
        paymentSucceeded = false;
      } finally {
        setIsProcessing(false);
        console.log('[SuccessPage] Processamento finalizado.');
      }
    };

    processPaymentReturn();

  }, [stripe, initialParamsChecked, clientSecret, formId, businessParam, language]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 relative overflow-hidden">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          colors={['#4ade80', '#22c55e', '#16a34a', '#ef4444', '#f97316', '#3b82f6', '#8b5cf6']}
          style={{ zIndex: 1 }}
        />
      )}

      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center relative z-10">
        {isProcessing ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {language === 'en' ? 'Processing Payment...' : 'Processando Pagamento...'}
            </h1>
            <p className="text-gray-600">
              {language === 'en' ? 'Please wait while we confirm your payment.' : 'Por favor, aguarde enquanto confirmamos seu pagamento.'}
            </p>
          </>
        ) : (
          <>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${showConfetti ? 'bg-green-100' : 'bg-red-100'}`}>
              {showConfetti ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              )}
            </div>

            <h1 className={`text-2xl font-bold mb-4 ${showConfetti ? 'text-gray-800' : 'text-red-700'}`}>
              {showConfetti
                ? (language === 'en' ? 'Payment Successful!' : 'Pagamento Realizado com Sucesso!')
                : (language === 'en' ? 'Payment Failed' : 'Falha no Pagamento')
              }
            </h1>

            {finalStatusMessage && (
               <p className={`text-lg mb-6 ${showConfetti ? 'text-gray-700' : 'text-red-600'}`}>
                 {finalStatusMessage}
               </p>
            )}

            {showConfetti && businessName && (
              <p className="text-gray-700 mb-6">
                {language === 'en'
                  ? `Thank you for choosing us for the website of ${businessName}!`
                  : `Obrigado por nos escolher para o site da ${businessName}!`}
              </p>
            )}

            <p className="text-gray-600 mb-8">
              {showConfetti
                 ? (language === 'en' ? 'Our team will contact you soon.' : 'Nossa equipe entrará em contato em breve.')
                 : (language === 'en' ? 'Please try again or contact support.' : 'Por favor, tente novamente ou contate o suporte.')
              }
            </p>

            <button
              onClick={handleGoHome}
              className={`px-6 py-3 rounded-lg text-white transition-colors ${showConfetti ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {language === 'en' ? 'Return to Home' : 'Voltar para o Início'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Componente principal que usa Suspense para aguardar o Stripe carregar
const SuccessPage: React.FC = () => {
  return <SuccessContent />;
};

export default SuccessPage;
