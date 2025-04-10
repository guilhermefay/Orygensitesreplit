import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Interface props
interface StripeCheckoutFormProps {
  onSuccess: (paymentId: string) => void;
  plan: string;
  formId: string;
}

/**
 * Stub component that does nothing
 * Real implementation is completely replaced by the redirect approach
 */
const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = () => {
  const { language } = useLanguage();
  
  return (
    <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-center text-gray-500">
        {language === 'en' 
          ? 'Redirecting to secure payment page...' 
          : 'Redirecionando para página de pagamento segura...'}
      </p>
    </div>
  );
};

export default StripeCheckoutForm;
