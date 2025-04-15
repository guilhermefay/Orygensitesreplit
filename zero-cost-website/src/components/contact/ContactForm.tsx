import React, { useState } from "react";
import FormNav from "./FormNav";
import { useContactForm } from "./hooks/useContactForm";
import FormContentContainer from "./components/FormContentContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import FormWrapper from "./components/FormWrapper";
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
    apiError
  } = useContactForm(onSuccess, initialPlan, pricingConfig) as any;

  // Reset payment flag when step changes
  // resetPaymentFlag(step);

  // Handle form submission
  const handleFormSubmitWithTracking = async (e: React.FormEvent) => {
    console.log('>>> ContactForm - handleFormSubmitWithTracking INICIADO');
    e.preventDefault();

    // COMENTADO: Lógica problemática que tentava submeter na Etapa 3
    /*
    // If we're on step 3 (visual identity), validate and submit to Supabase before advancing
    if (step === 3) {
      try {
        // Validate form
        console.log("Validating form before submitting to Supabase");

        // Simple validation logic
        if (!formData.name || !formData.email || !formData.phone || !formData.business) {
          toast.error(language === 'en'
            ? "Please complete all required fields before proceeding."
            : "Por favor, complete todos os campos necessários antes de prosseguir.");
          return;
        }

        console.log("Form validated, submitting to Supabase");

        // Submit form data to Supabase
        const formSubmissionData = {
          formData,
          files,
          colorPalette,
          content: finalContent || ""
        };

        // Show loading toast
        toast.loading(language === 'en' ? "Saving your information..." : "Salvando suas informações...");

        console.log('>>> ContactForm - CHAMANDO submitForm');
        const submitted = await submitForm(formSubmissionData);

        if (submitted) {
          // Dismiss loading toast and show success
          toast.dismiss();
          toast.success(language === 'en' ? "Information saved successfully!" : "Informações salvas com sucesso!");

          console.log("Form data submitted to Supabase successfully, advancing to payment step");
          console.log("Form ID after submission:", formId);

          // Store the formId in localStorage as soon as we get it
          if (formId) {
            localStorage.setItem('form_id', formId);
            console.log("Form ID saved to localStorage:", formId);
          } else {
            console.warn("No formId received after submission");
          }

          console.log('>>> ContactForm - CHAMANDO nextStep');
          nextStep(e as unknown as React.MouseEvent);
        } else {
          // Dismiss loading toast and show error
          toast.dismiss();
          console.error("Failed to submit form data to Supabase");
          toast.error(language === 'en'
            ? "Error saving form data. Please try again."
            : "Erro ao salvar dados do formulário. Por favor, tente novamente.");
        }
      } catch (error) {
        toast.dismiss();
        console.error("Error submitting form:", error);
        toast.error(language === 'en'
          ? "Error processing form. Please try again."
          : "Erro ao processar formulário. Por favor, tente novamente.");
      }
    } else {
      // COMENTADO: Comportamento anterior estranho para outras etapas
      // e.preventDefault(); // Já chamado no início
      // const currentEvent = e as unknown as React.MouseEvent;
      // prevStep(currentEvent);
    }
    */

    // TODO: Adicionar aqui a lógica de submissão FINAL, se necessária após o pagamento.
    // Por enquanto, o onSubmit não fará nada além de prevenir o default.
    console.warn("ContactForm onSubmit foi chamado, mas a lógica de submissão final precisa ser implementada/revisada aqui se necessário.");

  };
  
  // Handle local payment success - Ação a ser definida
  const onPaymentSuccess = (paymentId: string) => {
    console.warn(`ContactForm: onPaymentSuccess chamado com paymentId=${paymentId}. Ação precisa ser definida ou removida.`);
  };
  
  // Handle back from payment step (Step 2 -> Step 1)
  const handlePaymentBack = (e: React.MouseEvent) => {
    e.preventDefault();
    prevStep(e);
  };

  return (
    <FormWrapper 
      step={step} 
      totalSteps={totalSteps} 
      onSubmit={handleFormSubmitWithTracking}
    >
      {/* Remover a lógica de showSuccessMessage / paymentCompleted por enquanto */}
      {/* {(showSuccessMessage && paymentCompleted) ? (
        <PaymentSuccessView businessName={formData.business} />
      ) : ( */}
        <>
          {/* Form Content */}
          <FormContentContainer
            step={step}
            formData={formData}
            files={undefined}
            colorPalette={undefined}
            finalContent={undefined}
            handleChange={handleChange}
            handleColorChange={undefined}
            handleFileChange={undefined}
            setFiles={undefined}
            addColor={undefined}
            removeColor={undefined}
            handlePaymentSuccess={onPaymentSuccess}
            handlePaymentBack={handlePaymentBack}
            pricingConfig={pricingConfig}
            clientSecret={clientSecret}
            currentFormId={currentFormId}
          />
          
          {/* Navigation - Mostrar APENAS no passo 1 */}
          {step === 1 && (
            <FormNav 
              step={step}
              totalSteps={totalSteps}
              isSubmitting={isCreatingIntent}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )}
        </>
      {/* )} */}
    </FormWrapper>
  );
};

export default ContactForm;