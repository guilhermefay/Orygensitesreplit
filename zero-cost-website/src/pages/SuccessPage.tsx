
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import ReactConfetti from 'react-confetti';

// Log para verificar se o componente está sendo importado
console.log('SuccessPage.tsx carregado!');

const SuccessPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [businessName, setBusinessName] = useState<string>('');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showConfetti, setShowConfetti] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  
  // Obter parâmetros da URL
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('sessionId');
  const plan = queryParams.get('plan');
  const formId = queryParams.get('formId');
  const businessParam = queryParams.get('business');
  
  // Log de todos os parâmetros recebidos
  console.log('SuccessPage - Parâmetros da URL:', { 
    sessionId, 
    plan, 
    formId, 
    business: businessParam,
    fullSearch: location.search 
  });

  // Efeito para atualizar o tamanho da janela (para o confetti)
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Efeito para esconder o confetti após 8 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Log de debug para verificar o contexto da página
    console.log('SuccessPage - useEffect iniciando com:', { 
      pathname: location.pathname,
      search: location.search,
      sessionId,
      plan,
      formId
    });
    
    // NOVA ABORDAGEM: Buscar dados diretamente do Supabase pelo payment_id (sessionId) ou formId
    const fetchPaymentDetails = async () => {
      // MÉTODO DIRETO: Se temos o nome da empresa diretamente na URL (para casos de emergência/fallback)
      if (businessParam) {
        console.log('SuccessPage - Nome da empresa encontrado diretamente na URL:', businessParam);
        setBusinessName(decodeURIComponent(businessParam));
        setShowConfetti(true);
        setIsProcessing(false);
        return;
      }
      
      // Tentar usar sessionId ou formId, um dos dois deve estar presente
      if (!sessionId && !formId) {
        console.log('SuccessPage - Sem sessionId ou formId, mostrando página de sucesso genérica');
        setIsProcessing(false);
        return;
      }
      
      // NOTA: Removemos o código que tentava processar o pagamento diretamente,
      // agora dependemos exclusivamente do webhook para atualizar o status no Supabase.
      // Apenas seguimos com a busca dos dados usando o formId ou sessionId (como payment_id)
      
      // Apenas logar para diagnóstico
      if (sessionId) {
        console.log('SuccessPage - Usando sessionId como payment_id para buscar informações:', sessionId);
      } else if (formId) {
        console.log('SuccessPage - Usando formId para buscar informações:', formId);
      }
      
      try {
        // Estratégia de busca por múltiplos critérios
        if (sessionId) {
          console.log('SuccessPage - Buscando detalhes de pagamento para sessionId:', sessionId);
        } else if (formId) {
          console.log('SuccessPage - Buscando detalhes de pagamento para formId:', formId);
        }
        
        // Determinar qual critério usar para busca
        let query = supabase
          .from('form_submissions')
          .select('*');
          
        if (sessionId) {
          // Primeiro tentar pelo payment_id (que é o sessionId)
          query = query.eq('payment_id', sessionId);
        } else if (formId) {
          // Caso contrário, tentar pelo original_form_id
          query = query.eq('original_form_id', formId);
        }
        
        const { data, error } = await query;
          
        if (error) {
          console.error('Erro ao buscar detalhes do pagamento:', error);
          setIsProcessing(false);
          return;
        }
        
        console.log('SuccessPage - Dados encontrados:', data);
        
        if (data && data.length > 0) {
          // Mostrar nome da empresa
          const payment = data[0];
          setBusinessName(payment.business);
          
          toast.success(language === 'en'
            ? 'Payment information retrieved successfully!'
            : 'Informações do pagamento recuperadas com sucesso!');
        } else {
          // Buscar por original_form_id no caso de outro formato de ID
          // Se temos formId, mas já tentamos por ele e não encontramos, não precisamos tentar de novo
          const idToTry = sessionId || (formId ? null : formId);
          
          if (idToTry) {
            console.log('SuccessPage - Tentando busca secundária por ID:', idToTry);
          
            const { data: secondaryData, error: secondaryError } = await supabase
              .from('form_submissions')
              .select('*')
              .eq('id', idToTry);
          
            if (secondaryError) {
              console.error('Erro na busca secundária:', secondaryError);
            } else if (secondaryData && secondaryData.length > 0) {
              const secondaryPayment = secondaryData[0];
              setBusinessName(secondaryPayment.business);
              
              toast.success(language === 'en'
                ? 'Payment information found through alternative method!'
                : 'Informações do pagamento encontradas por método alternativo!');
              return;  // Sair da função se encontrou
            }
          }
          
          // Última tentativa: buscar qualquer pagamento recente
          console.log('SuccessPage - Tentativa final: buscar pagamento recente');
          
          try {
            // Buscar o pagamento mais recente (limitando a 1)
            const { data: recentPayment, error: recentError } = await supabase
              .from('form_submissions')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (recentError) {
              console.error('Erro ao buscar pagamento recente:', recentError);
            } else if (recentPayment && recentPayment.length > 0) {
              console.log('SuccessPage - Encontrou pagamento recente:', recentPayment[0]);
              setBusinessName(recentPayment[0].business);
              
              toast.success(language === 'en'
                ? 'We found a recent payment in our records!'
                : 'Encontramos um pagamento recente em nossos registros!');
            } else {
              console.log('SuccessPage - Nenhum registro encontrado em nenhuma tentativa');
              toast.error(language === 'en'
                ? 'We could not find your payment information, but your payment was successful. We will contact you soon.'
                : 'Não conseguimos encontrar suas informações de pagamento, mas seu pagamento foi bem-sucedido. Entraremos em contato em breve.');
            }
          } catch (finalError) {
            console.error('Erro na tentativa final de busca:', finalError);
            toast.error(language === 'en'
              ? 'We could not find your payment information, but your payment was successful. We will contact you soon.'
              : 'Não conseguimos encontrar suas informações de pagamento, mas seu pagamento foi bem-sucedido. Entraremos em contato em breve.');
          }
        }
      } catch (error) {
        console.error('Error processing payment details:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    fetchPaymentDetails();
  }, [language, sessionId, plan, formId, businessParam]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 relative overflow-hidden">
      {/* Efeito de confete quando o pagamento é bem sucedido */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={500}
          gravity={0.2}
          colors={['#4ade80', '#22c55e', '#16a34a', '#ef4444', '#f97316', '#3b82f6', '#8b5cf6']}
        />
      )}

      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center relative z-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {language === 'en' ? 'Payment Successful!' : 'Pagamento Realizado!'}
        </h1>
        
        {businessName && (
          <p className="text-lg text-gray-700 mb-6">
            {language === 'en' 
              ? `Thank you for choosing ${businessName}!` 
              : `Obrigado por escolher ${businessName}!`}
          </p>
        )}
        
        <p className="text-gray-600 mb-8">
          {language === 'en' 
            ? 'Our team will contact you soon to start working on your project.'
            : 'Nossa equipe entrará em contato em breve para iniciar seu projeto.'}
        </p>
        
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {language === 'en' ? 'Return to Home' : 'Voltar para o Início'}
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
