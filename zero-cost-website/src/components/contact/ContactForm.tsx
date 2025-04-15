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
    apiError,
    paymentCompleted,
    setPaymentCompleted
  } = useContactForm(onSuccess, initialPlan, pricingConfig) as any;

  const handleLocalPaymentSuccess = async (paymentId: string) => {
    console.log(`ContactForm: Pagamento bem-sucedido! Payment ID: ${paymentId}, Form ID: ${currentFormId}`);
    
    if (!currentFormId || !paymentId) {
      console.error("Erro: currentFormId ou paymentId indisponíveis para finalizar submissão.");
      toast.error("Erro ao finalizar processo de pagamento. Contate o suporte.");
      // Talvez não mudar estado para erro, mas logar é crucial.
      return; // Impede de continuar
    }
    
    // Adicionar estado de loading específico para esta chamada?
    // setIsLoadingFinalize(true); 

    try {
      console.log(`Chamando API /api/finalize-submission...`);
      const response = await fetch('/api/finalize-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: currentFormId, paymentIntentId: paymentId })
      });

      if (!response.ok) {
        // Mesmo se a API falhar, o pagamento Stripe funcionou.
        // Logar o erro, mas talvez ainda mostrar sucesso para o usuário?
        const errorData = await response.json().catch(() => ({})); // Tenta pegar erro do JSON
        console.error('Erro ao chamar /api/finalize-submission:', response.status, errorData);
        toast.error( `Seu pagamento foi aprovado, mas houve um erro ao registrar os detalhes (${response.status}). Contate o suporte se necessário.`);
        // Decidir se continua para setPaymentCompleted(true) ou não.
        // Por ora, vamos continuar para mostrar sucesso ao usuário.
      } else {
         console.log('API /api/finalize-submission respondeu com sucesso.');
      }

      // Independentemente do resultado da API (desde que não seja erro grave antes do fetch),
      // se chegamos aqui, o pagamento Stripe foi ok, então mostramos sucesso.
      setPaymentCompleted(true); 

      // O callback onSuccess original (se existir) ainda pode ser chamado
      if (onSuccess && formData.business) {
        onSuccess(formData.business);
      }

    } catch (error) {
        console.error('Erro de rede ou inesperado ao chamar /api/finalize-submission:', error);
        toast.error("Ocorreu um erro de conexão ao finalizar seu pedido. Contate o suporte.");
        // Aqui também, decidir se mostra sucesso ou uma tela de erro específica.
        // Por segurança, vamos mostrar sucesso, pois o pagamento ocorreu.
         setPaymentCompleted(true); 
    } finally {
       // setIsLoadingFinalize(false);
    }
  };
  
  const handlePaymentBack = (e: React.MouseEvent) => {
    e.preventDefault();
    prevStep(e);
  };

  return (
    <div className={`w-full ${isMobile ? 'max-w-full px-1' : 'max-w-4xl'} mx-auto`}>
      {paymentCompleted ? (
        <PaymentSuccessView businessName={formData.business || 'seu negócio'} />
      ) : (
        <>
          <FormContentContainer
            step={step}
            formData={formData}
            handleChange={handleChange}
            handlePaymentSuccess={handleLocalPaymentSuccess}
            handlePaymentBack={handlePaymentBack}
            pricingConfig={pricingConfig}
            clientSecret={clientSecret}
            currentFormId={currentFormId}
          />

          <FormNav 
            step={step}
            totalSteps={totalSteps}
            isSubmitting={isCreatingIntent}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        </>
      )}
    </div>
  );
};

export default memo(ContactForm);