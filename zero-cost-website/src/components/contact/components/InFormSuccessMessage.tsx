
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { SparklesCore } from '@/components/ui/sparkles';
import { Check } from 'lucide-react';

interface InFormSuccessMessageProps {
  businessName?: string;
}

const InFormSuccessMessage: React.FC<InFormSuccessMessageProps> = ({ 
  businessName = ''
}) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Stop confetti after a few seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);

    console.log("InFormSuccessMessage mounted with businessName:", businessName);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [businessName]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden h-[400px] flex flex-col items-center justify-center">
      {/* Background sparkles effect */}
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="tsparticles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleColor="#4F46E5"
          particleDensity={100}
          className="w-full h-full"
        />
      </div>
      
      {/* Confetti effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width > 800 ? 800 : windowSize.width}
          height={400}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          confettiSource={{
            x: windowSize.width > 800 ? 400 : windowSize.width / 2,
            y: 0,
            w: 0,
            h: 0
          }}
        />
      )}
      
      {/* Success content */}
      <div className="z-10 text-center space-y-4 max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <Check className="h-10 w-10 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-green-600">Sucesso!</h2>
        
        <p className="text-gray-700">
          Fique de olho no seu Email/Whatsapp cadastrado, iremos entrar em contato em instantes!
        </p>
        
        {businessName && (
          <p className="text-sm text-gray-500 mt-2">
            Obrigado por escolher nossos serviços para {businessName}.
          </p>
        )}
      </div>
    </div>
  );
};

export default InFormSuccessMessage;
