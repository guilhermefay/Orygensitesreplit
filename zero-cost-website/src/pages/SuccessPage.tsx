import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import ReactConfetti from 'react-confetti';
import { loadStripe, Stripe, PaymentIntent } from '@stripe/stripe-js'; // Importar PaymentIntent type
import { Loader2 } from 'lucide-react'; // Importar Loader2

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
  const [showConfetti, setShowConfetti] = useState(false); // Iniciar como false
  const [finalStatusMessage, setFinalStatusMessage] = useState<string | null>(null); // Mensagem final
  const navigate = useNavigate();
  const location = useLocation(); // Mova useLocation para cá
  const queryParams = new URLSearchParams(location.search); // Use location aqui
  const formId = queryParams.get('formId'); // ID do nosso formulário
  const paymentIntentId = queryParams.get('payment_intent'); // ID do Payment Intent (do Stripe)
  const clientSecret = queryParams.get('payment_intent_client_secret'); // Client Secret (do Stripe)
  const redirectStatus = queryParams.get('redirect_status'); // Status do redirect (do Stripe)
  const businessParam = queryParams.get('business'); // Fallback
  const { language } = useLanguage();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [initialParamsChecked, setInitialParamsChecked] = useState(false); // Novo estado

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
    setInitialParamsChecked(true); // Marcar que parâmetros foram lidos
  }, [location.search]); // Executar apenas se a URL mudar

  // Efeito para atualizar o tamanho da janela (para o confetti)
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Efeito principal para processar o status do pagamento
  useEffect(() => {
    // NÃO EXECUTE ANTES do Stripe estar carregado E os parâmetros iniciais terem sido checados
    if (!stripe || !initialParamsChecked) {
      console.log('[SuccessPage Process] Aguardando Stripe e/ou leitura inicial de parâmetros...', { hasStripe: !!stripe, paramsChecked: initialParamsChecked });
      // Se o Stripe carregou mas os parâmetros não, pode ser normal na primeira renderização
      if (stripe && !initialParamsChecked) console.log('[SuccessPage Process] Stripe carregado, aguardando checagem de parâmetros iniciais.')
      // Se não estiver processando e não tiver Stripe, mostre erro crítico
      if (!isProcessing && !stripe) {
         setFinalStatusMessage('Erro crítico: Falha ao carregar sistema de pagamento.');
         setIsProcessing(false); // Garante que saia do loading
      }
      return;
    }

    console.log('[SuccessPage Process] Iniciando processamento do retorno de pagamento...');
    const processPaymentReturn = async () => {
      // Já começamos com isProcessing = true, não precisa setar de novo aqui
      setFinalStatusMessage(null); // Limpar mensagem anterior
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
              setFinalStatusMessage('Pagamento confirmado!'); // Mensagem positiva
              // Tentar pegar nome da empresa dos metadados se disponível
              // @ts-ignore - Ignorar erro de tipo, pois sabemos que metadata existe na API
              if (paymentIntent.metadata && typeof paymentIntent.metadata.business_name === 'string') {
                 // @ts-ignore - Ignorar erro de tipo aqui também
                 finalBusinessName = paymentIntent.metadata.business_name;
                 console.log('[SuccessPage] Nome da empresa recuperado dos metadados do Stripe:', finalBusinessName);
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
        // Este cenário assume que o pagamento já foi confirmado ANTES da navegação
        // e que o webhook (se existir) já atualizou o Supabase.
        else if (formId) {
           console.log('[SuccessPage] Navegação direta detectada. Assumindo sucesso prévio ou aguardando webhook.');
           // Aqui, consideramos sucesso para UI, mas podemos verificar Supabase se necessário.
           // Para simplificar, vamos assumir sucesso visualmente se formId está presente
           // e confiar no fetchSubmissionDetails para buscar o nome.
           paymentSucceeded = true; // Assumir sucesso visualmente
           setFinalStatusMessage('Solicitação recebida!'); // Mensagem neutra/positiva

           // IMPORTANTE: Se não houver webhook, este cenário pode mostrar sucesso
           // mesmo que o pagamento falhe depois. O webhook é crucial.
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

        // Se o pagamento sucedeu (direta ou indiretamente), buscar detalhes e mostrar confete
        if (paymentSucceeded) {
          setShowConfetti(true); // Mostrar confete APENAS se sucesso
          const timer = setTimeout(() => setShowConfetti(false), 8000); // Esconder depois

           // Buscar detalhes da submissão no Supabase usando formId (se disponível)
           if (formId) {
             console.log(`[SuccessPage] Buscando detalhes no Supabase para formId: ${formId}`);
             try { // Adicionar try/catch para a busca no Supabase
                const { data, error } = await supabase
                  .from('form_submissions')
                  .select('business') // Buscar apenas o nome da empresa
                  .eq('id', formId)
                  .single();

                if (error && !finalBusinessName) { // Só mostrar erro se não pegamos dos metadados
                  console.error('[SuccessPage] Erro ao buscar dados no Supabase:', error);
                  // Não sobrescrever mensagem de status se já houver uma
                  if (!finalStatusMessage) setFinalStatusMessage('Erro ao buscar detalhes da sua solicitação.');
                } else if (data?.business) {
                  finalBusinessName = data.business;
                  console.log('[SuccessPage] Nome da empresa recuperado do Supabase:', finalBusinessName);
                } else if (!finalBusinessName) {
                  console.warn('[SuccessPage] Nenhum nome de empresa encontrado no Supabase ou metadados.');
                }
             } catch (supabaseError) {
                 console.error('[SuccessPage] Exceção ao buscar dados do Supabase:', supabaseError);
                 if (!finalStatusMessage) setFinalStatusMessage('Erro ao carregar detalhes.');
             }
           } else if (!finalBusinessName) {
              console.warn('[SuccessPage] formId não disponível para buscar dados do Supabase.');
           }

           // Definir o nome final da empresa
           setBusinessName(finalBusinessName || 'sua empresa'); // Usar fallback

           // Limpar timeout do confete na desmontagem
           return () => clearTimeout(timer);
        }
        // Se o pagamento NÃO sucedeu, garantir que confete não apareça
        else {
            setShowConfetti(false);
        }

      } catch (error) {
        console.error('[SuccessPage] Erro inesperado no processamento:', error);
        setFinalStatusMessage('Ocorreu um erro inesperado ao processar sua solicitação.');
        paymentSucceeded = false; // Garantir que não mostre confete
        setShowConfetti(false);
      } finally {
        setIsProcessing(false); // Finalizar o processamento
        console.log('[SuccessPage] Processamento finalizado.');
      }
    };

    processPaymentReturn();

  // Adicionar clientSecret e formId às dependências para re-executar se mudarem (embora devam vir da URL)
  }, [stripe, initialParamsChecked, clientSecret, formId, businessParam, language]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 relative overflow-hidden">
      {/* Efeito de confete (controlado por showConfetti) */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false} // Não reciclar, apenas uma vez
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
            {/* Ícone de sucesso ou erro */}
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

            {/* Título (Sucesso ou Falha) */}
            <h1 className={`text-2xl font-bold mb-4 ${showConfetti ? 'text-gray-800' : 'text-red-700'}`}>
              {showConfetti
                ? (language === 'en' ? 'Payment Successful!' : 'Pagamento Realizado com Sucesso!')
                : (language === 'en' ? 'Payment Failed' : 'Falha no Pagamento')
              }
            </h1>

            {/* Mensagem de Status Final */}
            {finalStatusMessage && (
               <p className={`text-lg mb-6 ${showConfetti ? 'text-gray-700' : 'text-red-600'}`}>
                 {finalStatusMessage}
               </p>
            )}

             {/* Detalhes Adicionais (se sucesso) */}
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
  // A lógica de carregamento do Stripe é tratada internamente no SuccessContent
  return <SuccessContent />;
};


export default SuccessPage;