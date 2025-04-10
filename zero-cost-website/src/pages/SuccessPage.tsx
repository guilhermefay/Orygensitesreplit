
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

const SuccessPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [businessName, setBusinessName] = useState<string>('');
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const formId = localStorage.getItem('form_id');
    const paymentId = localStorage.getItem('current_payment_id');
    
    const updatePaymentStatus = async () => {
      if (!formId || !paymentId) {
        setIsProcessing(false);
        return;
      }
      
      try {
        // Fetch form details to get business name
        const { data: formData, error: fetchError } = await supabase
          .from('form_submissions')
          .select('business')
          .eq('id', formId)
          .single();
          
        if (formData && formData.business) {
          setBusinessName(formData.business);
        }
        
        // Update payment status
        const { error } = await supabase
          .from('form_submissions')
          .update({ 
            payment_status: 'completed',
            payment_id: paymentId,
            payment_date: new Date().toISOString()
          })
          .eq('id', formId);
          
        if (error) {
          console.error('Error updating payment status:', error);
          toast.error(language === 'en' 
            ? 'Error confirming payment. Please contact support.' 
            : 'Erro ao confirmar o pagamento. Por favor, entre em contato com o suporte.');
        } else {
          toast.success(language === 'en'
            ? 'Payment confirmed successfully! Our team will contact you soon.'
            : 'Pagamento confirmado com sucesso! Nossa equipe entrará em contato em breve.');
          
          // Clear storage after successful update
          localStorage.removeItem('form_id');
          localStorage.removeItem('current_payment_id');
        }
      } catch (error) {
        console.error('Error in payment confirmation:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    updatePaymentStatus();
  }, [language]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
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
