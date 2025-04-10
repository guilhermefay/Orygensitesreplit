
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { CheckCircle, Mail, Phone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SuccessMessageProps {
  businessName: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ businessName }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const isMobile = useIsMobile();

  const [showConfetti, setShowConfetti] = useState(true);

  // Update window size if it changes
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Stop confetti after 8 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);

    console.log("SuccessMessage mounted with businessName:", businessName);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [businessName]);

  useEffect(() => {
    // Scroll to top when success message is shown
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`text-center ${isMobile ? 'py-4 px-2' : 'py-10 px-4'} relative z-20 animate-fade-in`}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={isMobile ? 75 : 150}
          gravity={0.15}
        />
      )}
      
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 ${isMobile ? 'p-4' : 'p-8 md:p-12'} mx-auto max-w-3xl mb-6`}>
        <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6`}>
          <CheckCircle className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} text-green-500`} />
        </div>
        
        <h2 className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} font-bold text-gray-900 mb-3 md:mb-4`}>
          Solicitação Enviada com Sucesso!
        </h2>
        
        <p className={`${isMobile ? 'text-base' : 'text-xl'} text-gray-600 mb-4 md:mb-8`}>
          Obrigado por escolher nossos serviços para o site da <span className="font-semibold text-highlight">{businessName || "sua empresa"}</span>!
        </p>
        
        <div className={`bg-blue-50 ${isMobile ? 'p-3' : 'p-6'} rounded-xl mb-4 md:mb-8`}>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-900 mb-2 md:mb-3`}>Próximos passos:</h3>
          
          <div className={`flex items-start mb-3 md:mb-4 ${isMobile ? 'px-2' : 'md:px-6'}`}>
            <div className="bg-blue-100 p-2 rounded-full mr-3 md:mr-4">
              <Mail className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-700`} />
            </div>
            <div className="text-left">
              <p className={`font-medium text-blue-900 ${isMobile ? 'text-sm' : ''}`}>Fique de olho no seu e-mail</p>
              <p className={`text-blue-700 ${isMobile ? 'text-xs' : ''}`}>Enviaremos detalhes importantes sobre seu projeto em breve.</p>
            </div>
          </div>
          
          <div className={`flex items-start ${isMobile ? 'px-2' : 'md:px-6'}`}>
            <div className="bg-blue-100 p-2 rounded-full mr-3 md:mr-4">
              <Phone className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-700`} />
            </div>
            <div className="text-left">
              <p className={`font-medium text-blue-900 ${isMobile ? 'text-sm' : ''}`}>Aguarde contato via WhatsApp</p>
              <p className={`text-blue-700 ${isMobile ? 'text-xs' : ''}`}>Nossa equipe entrará em contato para iniciar o desenvolvimento do seu site.</p>
            </div>
          </div>
        </div>
        
        <p className={`text-gray-500 ${isMobile ? 'text-xs' : ''}`}>
          Em instantes entraremos em contato para dar início ao seu projeto. 
          Estamos ansiosos para transformar sua visão em realidade!
        </p>
      </div>
      
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`mt-2 md:mt-4 bg-gray-900 hover:bg-gray-800 text-white font-medium ${isMobile ? 'py-1.5 px-4 text-sm' : 'py-2 px-5'} rounded-lg transition-colors`}
      >
        Voltar para o topo
      </button>
    </div>
  );
};

export default SuccessMessage;
