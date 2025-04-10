
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
    files,
    colorPalette,
    isSubmitting,
    step,
    totalSteps,
    finalContent,
    handleChange,
    handleColorChange,
    handleFileChange,
    nextStep,
    prevStep,
    resetForm,
    setFiles,
    addColor,
    removeColor,
    setFinalContent,
    showSuccessMessage,
    submitForm,
    setShowSuccessMessage,
    formId
  } = useContactForm(onSuccess, initialPlan, pricingConfig);

  const { paymentCompleted, handlePaymentSuccess, resetPaymentFlag } = usePaymentTracking();
  const { isStripePayment } = useFormInitialization(formId);
  
  // Reset payment flag when step changes
  resetPaymentFlag(step);

  // Handle form submission
  const handleFormSubmitWithTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // For other steps, maintain current behavior
      e.preventDefault();
      const currentEvent = e as unknown as React.MouseEvent;
      prevStep(currentEvent);
    }
  };
  
  // Handle local payment success
  const onPaymentSuccess = (paymentId: string) => {
    handlePaymentSuccess(paymentId, onSuccess, formData.business);
  };
  
  // Handle back from payment step
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
      {/* Show success message ONLY when returning from Stripe */}
      {(showSuccessMessage && paymentCompleted) ? (
        <PaymentSuccessView businessName={formData.business} />
      ) : (
        <>
          {/* Form Content */}
          <FormContentContainer
            step={step}
            formData={formData}
            files={files}
            colorPalette={colorPalette}
            finalContent={finalContent}
            handleChange={handleChange}
            handleColorChange={handleColorChange}
            handleFileChange={handleFileChange}
            setFiles={setFiles}
            addColor={addColor}
            removeColor={removeColor}
            handlePaymentSuccess={onPaymentSuccess}
            handlePaymentBack={handlePaymentBack}
            pricingConfig={pricingConfig}
            isStripePayment={isStripePayment}
            formId={formId}
          />
          
          {/* Navigation */}
          {step !== 4 && (
            <FormNav 
              step={step}
              totalSteps={totalSteps}
              isSubmitting={isSubmitting}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )}
        </>
      )}
    </FormWrapper>
  );
};

export default ContactForm;
