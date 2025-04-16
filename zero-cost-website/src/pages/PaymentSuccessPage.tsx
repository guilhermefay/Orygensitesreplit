import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Definir tipos para o status da verificação
type VerificationStatus = 'idle' | 'loading' | 'verified' | 'pending' | 'not_found' | 'error';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string>(''); // Mensagem detalhada do backend ou erro

  const formId = searchParams.get('formId');
  const sessionId = searchParams.get('sessionId');
  const source = searchParams.get('source'); // <<< Ler o parâmetro source

  console.log('[PaymentSuccessPage] Source parameter:', source);

  // Definir a URL do formulário final condicionalmente
  const defaultFormUrl = 'https://o7pxcg48.forms.app/orygen';
  const lpFormUrl = 'https://o7pxcg48.forms.app/orygensites';
  const externalFormUrl = source === 'lp' ? lpFormUrl : defaultFormUrl;

  useEffect(() => {
    console.log('[PaymentSuccessPage] Montado.');
    console.log('[PaymentSuccessPage] formId da URL:', formId);
    console.log('[PaymentSuccessPage] sessionId da URL:', sessionId);

    // Trigger confetti
    setShowConfetti(true);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 8000);

    // Get window dimensions
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // --- INÍCIO: Verificação do Pagamento ---
    if (sessionId) {
      setVerificationStatus('loading');
      setVerificationMessage(language === 'en' ? 'Verifying payment status...' : 'Verificando status do pagamento...');
      console.log(`[PaymentSuccessPage] Iniciando verificação para sessionId: ${sessionId}`);

      fetch('/api/verify-payment', { // Usar URL relativa
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      .then(async (response) => {
        const data = await response.json(); // Tentar ler o corpo JSON mesmo em erros
        console.log('[PaymentSuccessPage] Resposta da verificação:', { status: response.status, data });

        if (response.ok && data.success) {
          setVerificationStatus('verified');
          setVerificationMessage(data.message || (language === 'en' ? 'Payment verified and status updated.' : 'Pagamento verificado e status atualizado.'));
        } else if (response.status === 402) { // Pagamento não confirmado/pendente
          setVerificationStatus('pending');
          setVerificationMessage(data.message || (language === 'en' ? 'Payment not confirmed or still pending.' : 'Pagamento não confirmado ou ainda pendente.'));
        } else if (response.status === 404) { // Sessão não encontrada
          setVerificationStatus('not_found');
          setVerificationMessage(data.error || (language === 'en' ? 'Payment session not found.' : 'Sessão de pagamento não encontrada.'));
        } else {
          // Outros erros (500, etc.)
          setVerificationStatus('error');
          setVerificationMessage(data.error || (language === 'en' ? 'Failed to verify payment status.' : 'Falha ao verificar status do pagamento.'));
        }
      })
      .catch((error) => {
        console.error('[PaymentSuccessPage] Erro na chamada fetch para /api/verify-payment:', error);
        setVerificationStatus('error');
        setVerificationMessage(language === 'en' ? 'Network error or server unavailable.' : 'Erro de rede ou servidor indisponível.');
      });
    } else {
      // Caso não haja sessionId na URL
      setVerificationStatus('error');
      setVerificationMessage(language === 'en' ? 'Missing payment session ID in URL.' : 'ID da sessão de pagamento ausente na URL.');
      console.warn('[PaymentSuccessPage] sessionId não encontrado na URL.');
    }
    // --- FIM: Verificação do Pagamento ---

    // Cleanup
    return () => {
      clearTimeout(confettiTimer);
      window.removeEventListener('resize', handleResize);
    };
    // Adicionar language às dependências para atualizar mensagens
  }, [formId, sessionId, language]);

  // --- Text translations ---
  const texts = {
    title: {
      verified: language === 'en' ? 'Payment Successful!' : 'Pagamento Confirmado!',
      pending: language === 'en' ? 'Payment Pending' : 'Pagamento Pendente',
      not_found: language === 'en' ? 'Session Not Found' : 'Sessão Não Encontrada',
      error: language === 'en' ? 'Verification Error' : 'Erro na Verificação',
      loading: language === 'en' ? 'Verifying Payment...' : 'Verificando Pagamento...',
      idle: language === 'en' ? 'Processing...' : 'Processando...'
    },
    subtitle: {
      verified: language === 'en'
        ? 'Thank you for your purchase. Your site setup process will begin soon.'
        : 'Obrigado pela sua compra. O processo de criação do seu site começará em breve.',
      pending: language === 'en'
        ? 'Your payment is still processing or requires confirmation.'
        : 'Seu pagamento ainda está sendo processado ou requer confirmação.',
      not_found: language === 'en'
        ? 'The payment session ID provided was not found. Please contact support.'
        : 'O ID da sessão de pagamento fornecido não foi encontrado. Por favor, entre em contato com o suporte.',
      error: language === 'en'
        ? 'There was an error verifying your payment. Please contact support.'
        : 'Ocorreu um erro ao verificar seu pagamento. Por favor, entre em contato com o suporte.',
      loading: '', // Não mostra subtítulo durante o carregamento
      idle: ''
    },
    verificationInfo: language === 'en' ? 'Verification Status:' : 'Status da Verificação:',
    nextStepTitle: language === 'en' ? 'Next Step:' : 'Próximo Passo:',
    nextStepDescription: language === 'en'
      ? 'Please fill out the form with the details for your website development:'
      : 'Por favor, preencha o formulário com os detalhes para o desenvolvimento do seu site:',
    buttonText: language === 'en' ? 'Go to Information Form' : 'Ir para Formulário de Informações',
    linkHomeText: language === 'en' ? 'Back to Home' : 'Voltar para o Início',
  };

  // --- Ícone e Cor baseados no Status ---
  const StatusIcon = () => {
    switch (verificationStatus) {
      case 'verified': return <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-4" />;
      case 'pending': return <Clock className="text-yellow-500 h-16 w-16 mx-auto mb-4" />;
      case 'loading': return <Loader2 className="text-blue-500 h-16 w-16 mx-auto mb-4 animate-spin" />;
      case 'not_found':
      case 'error':
      case 'idle': // Pode mostrar erro ou loading para idle
      default:
        return <AlertTriangle className="text-red-500 h-16 w-16 mx-auto mb-4" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      {showConfetti && verificationStatus === 'verified' && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />
      )}
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full">
        <StatusIcon />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{texts.title[verificationStatus]}</h1>
        {texts.subtitle[verificationStatus] && (
           <p className="text-gray-600 mb-6">{texts.subtitle[verificationStatus]}</p>
        )}

        {/* Informação de Verificação */} 
        <div className="mt-4 mb-6 p-3 bg-gray-100 rounded-md text-sm text-gray-700">
            <strong>{texts.verificationInfo}</strong> {verificationMessage}
        </div>

        {/* Mostrar próximos passos apenas se verificado */} 
        {verificationStatus === 'verified' && (
          <>
            <hr className="my-6 border-gray-200" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{texts.nextStepTitle}</h2>
            <p className="text-gray-600 mb-4">{texts.nextStepDescription}</p>
            <Button
              asChild
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <a href={externalFormUrl} target="_blank" rel="noopener noreferrer">
                {texts.buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </>
        )}

         {/* Link para Home sempre visível */}
         <div className="mt-8">
            <Link to="/" className="text-sm text-blue-600 hover:underline">
                {texts.linkHomeText}
            </Link>
         </div>

        {/* Debug info (opcional) */}
        <div className="mt-6 text-xs text-gray-400">
            <p>Form ID: {formId || 'N/A'}</p>
            <p>Session ID: {sessionId || 'N/A'}</p>
            <p>Verification Status: {verificationStatus}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 