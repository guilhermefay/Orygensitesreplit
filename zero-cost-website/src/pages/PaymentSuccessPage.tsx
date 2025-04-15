import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext'; // Assuming context exists

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage(); // Use language context
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const formId = searchParams.get('formId');
  const sessionId = searchParams.get('sessionId'); // Stripe session ID

  const externalFormUrl = 'https://o7pxcg48.forms.app/orygen';

  // Log details on mount
  useEffect(() => {
    console.log('[PaymentSuccessPage] Montado.');
    console.log('[PaymentSuccessPage] formId da URL:', formId);
    console.log('[PaymentSuccessPage] sessionId da URL:', sessionId);

    // Trigger confetti
    setShowConfetti(true);

    // Stop confetti after some time
    const timer = setTimeout(() => setShowConfetti(false), 8000); // Show confetti for 8 seconds

    // Get window dimensions for confetti
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [formId, sessionId]);

  // --- Text translations ---
  const texts = {
    title: language === 'en' ? 'Payment Successful!' : 'Pagamento Confirmado!',
    subtitle: language === 'en'
      ? 'Thank you for your purchase. Your site setup process will begin soon.'
      : 'Obrigado pela sua compra. O processo de criação do seu site começará em breve.',
    nextStepTitle: language === 'en' ? 'Next Step:' : 'Próximo Passo:',
    nextStepDescription: language === 'en'
      ? 'Please fill out the form with the details for your website development:'
      : 'Por favor, preencha o formulário com os detalhes para o desenvolvimento do seu site:',
    buttonText: language === 'en' ? 'Go to Information Form' : 'Ir para Formulário de Informações',
    linkHomeText: language === 'en' ? 'Back to Home' : 'Voltar para o Início',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full">
        <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{texts.title}</h1>
        <p className="text-gray-600 mb-6">{texts.subtitle}</p>

        {/* Separator */}
        <hr className="my-6 border-gray-200" />

        {/* Next Step Section */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{texts.nextStepTitle}</h2>
        <p className="text-gray-600 mb-4">{texts.nextStepDescription}</p>

        <Button
          asChild // Render as an anchor tag
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <a href={externalFormUrl} target="_blank" rel="noopener noreferrer">
            {texts.buttonText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </Button>

         {/* Optional: Link back to home */}
         <div className="mt-8">
            <Link to="/" className="text-sm text-blue-600 hover:underline">
                {texts.linkHomeText}
            </Link>
         </div>

        {/* Debug info (optional, remove for production) */}
        {/*
        <div className="mt-6 text-xs text-gray-400">
            <p>Form ID: {formId || 'N/A'}</p>
            <p>Session ID: {sessionId || 'N/A'}</p>
        </div>
        */}
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 