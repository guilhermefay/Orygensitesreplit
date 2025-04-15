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

  const handleLocalPaymentSuccess = (paymentId: string) => {
    console.log(`ContactForm: Pagamento bem-sucedido! Payment ID: ${paymentId}, Form ID: ${currentFormId}`);
    setPaymentCompleted(true);
    if (onSuccess && formData.business) {
      onSuccess(formData.business);
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