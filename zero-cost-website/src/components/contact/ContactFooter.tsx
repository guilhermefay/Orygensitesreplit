
import React from 'react';
import { MessageCircle, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ContactFooter: React.FC = () => {
  const { language } = useLanguage();
  
  return (
    <div className="mt-16 text-center max-w-3xl mx-auto reveal">
      <div className="flex items-center justify-center space-x-2 text-white mb-4">
        <MessageCircle className="h-5 w-5 text-highlight" />
        <p className="text-sm">
          {language === 'en' 
            ? "Didn't find the answer you were looking for? Contact us through our support channels."
            : "Não encontrou a resposta que procurava? Entre em contato pelos nossos canais de atendimento."}
        </p>
      </div>
      
      <div className="flex items-center justify-center mt-4 bg-gray-900 rounded-lg p-4">
        <Shield className="text-highlight mr-2 h-5 w-5" />
        <p className="text-sm text-white">
          {language === 'en'
            ? "Your data is protected and will not be shared with third parties"
            : "Seus dados estão protegidos e não serão compartilhados com terceiros"}
        </p>
      </div>
    </div>
  );
};

export default ContactFooter;
