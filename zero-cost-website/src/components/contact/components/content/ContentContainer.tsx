
import React from 'react';
import { ContentContainerProps } from '../../types';
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ContentContainer: React.FC<ContentContainerProps> = ({ 
  onBack,
  onConfirm,
}) => {
  const { language } = useLanguage();

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md flex flex-col h-[85vh]">
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
        <h2 className="text-2xl font-bold mb-4">
          {language === 'en' 
            ? "Your information has been received!" 
            : "Suas informações foram recebidas!"}
        </h2>
        <p className="text-gray-600 mb-8">
          {language === 'en'
            ? "Please proceed to the payment step to complete your order."
            : "Por favor, prossiga para o passo de pagamento para completar seu pedido."}
        </p>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          onClick={onBack} 
          variant="outline"
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'en' ? "Back" : "Voltar"}
        </Button>
        
        <Button 
          onClick={handleConfirmClick}
          className="bg-green-600 hover:bg-green-700"
        >
          {language === 'en' ? "Continue to Payment" : "Continuar para Pagamento"}
        </Button>
      </div>
    </div>
  );
};

export default ContentContainer;
