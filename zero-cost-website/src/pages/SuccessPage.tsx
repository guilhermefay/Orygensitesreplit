
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
      plan
    });
    
    // NOVA ABORDAGEM: Buscar dados diretamente do Supabase pelo payment_id (sessionId)
    const fetchPaymentDetails = async () => {
      if (!sessionId) {
        console.log('SuccessPage - Sem sessionId, mostrando página de sucesso genérica');
        setIsProcessing(false);
        return;
      }
      
      try {
        console.log('SuccessPage - Buscando detalhes de pagamento para sessionId:', sessionId);
        
        // Buscar registro pelo payment_id (que é o sessionId)
        const { data, error } = await supabase
          .from('form_submissions')
          .select('*')
          .eq('payment_id', sessionId);
          
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
          console.log('SuccessPage - Tentando buscar por originalFormId no sessionId');
          
          const { data: secondaryData, error: secondaryError } = await supabase
            .from('form_submissions')
            .select('*')
            .eq('original_form_id', sessionId);
            
          if (secondaryError) {
            console.error('Erro na busca secundária:', secondaryError);
          } else if (secondaryData && secondaryData.length > 0) {
            const secondaryPayment = secondaryData[0];
            setBusinessName(secondaryPayment.business);
            
            toast.success(language === 'en'
              ? 'Payment information found through alternative method!'
              : 'Informações do pagamento encontradas por método alternativo!');
          } else {
            console.log('SuccessPage - Nenhum registro encontrado com este sessionId ou formId');
          }
        }
      } catch (error) {
        console.error('Error processing payment details:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    fetchPaymentDetails();
  }, [language, sessionId, plan]);

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
