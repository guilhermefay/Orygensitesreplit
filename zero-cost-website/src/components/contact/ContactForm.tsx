import React, { memo } from "react";
import FormNav from "./FormNav";
import { useContactForm } from "./hooks/useContactForm";
import FormContentContainer from "./components/FormContentContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import PaymentSuccessView from "./components/PaymentSuccessView";
import { usePaymentTracking } from "./hooks/usePaymentTracking";
import { useFormInitialization } from "./hooks/useFormInitialization";
import { useNavigate } from 'react-router-dom';

interface ContactFormProps {
  initialPlan?: "monthly" | "annual";
  onSuccess?: (businessName: string) => void;
  pricingConfig?: PricingConfiguration;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  initialPlan = "annual", 
  onSuccess,
  pricingConfig 
}) => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  
  const navigate = useNavigate();

  const {
    formData,
    isCreatingIntent,
    step,
    totalSteps,
    handleChange,
    nextStep,
    prevStep,
    resetForm,
    clientSecret,
    currentFormId,
    apiError
  } = useContactForm(onSuccess, initialPlan, pricingConfig) as any;

  // Handle local payment success - IMPLEMENTAR NAVEGAÇÃO
  const onPaymentSuccess = (paymentId: string) => {
    console.log(`ContactForm: Pagamento bem-sucedido! Payment ID: ${paymentId}, Form ID: ${currentFormId}`);
    if (currentFormId) {
       console.log(`Navegando para /coleta-dados?formId=${currentFormId}`);
       navigate(`/coleta-dados?formId=${currentFormId}`); // Navegar para a página de coleta de dados
    } else {
       console.error("Erro: currentFormId não está disponível após pagamento bem-sucedido.");
       toast.error("Erro ao processar pagamento. ID do formulário não encontrado.");
       navigate('/'); // Fallback para home em caso de erro grave
    }
  };
  
  // Handle back from payment step (Step 2 -> Step 1)
  const handlePaymentBack = (e: React.MouseEvent) => {
    e.preventDefault();
    prevStep(e);
  };

  // Defina o layout geral como um div simples ou React.Fragment
  return (
    <div className={`w-full ${isMobile ? 'max-w-full px-1' : 'max-w-4xl'} mx-auto`}>
      {/* StepIndicator pode ficar aqui se desejado, ou dentro do FormWrapper se ele fosse mantido */}
      {/* Exemplo: <StepIndicator currentStep={step} totalSteps={totalSteps} /> */}

      {/* Conteúdo do Formulário */}
      <FormContentContainer
        step={step}
        formData={formData}
        handleChange={handleChange}
        handlePaymentSuccess={onPaymentSuccess}
        handlePaymentBack={handlePaymentBack}
        pricingConfig={pricingConfig}
        clientSecret={clientSecret}
        currentFormId={currentFormId}
      />

      {/* Navegação (fora do FormContentContainer) */}
      <FormNav 
        step={step}
        totalSteps={totalSteps}
        isSubmitting={isCreatingIntent} // Ou outra variável de loading apropriada
        prevStep={prevStep}
        nextStep={nextStep}
      />
    </div>
  );
};

export default memo(ContactForm);