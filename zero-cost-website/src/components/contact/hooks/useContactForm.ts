import { useState } from "react";
import { useFormData } from "./useFormData";
import { useFormNavigation } from "./useFormNavigation";
import { useContentGeneration } from "./useContentGeneration"; // Mantido caso precise dos dados
import { useFormSubmission } from "./useFormSubmission";
import { PricingConfiguration } from "@/lib/config/pricing";
import { toast } from "sonner"; // Import toast for validation messages
import { useLanguage } from "@/contexts/LanguageContext"; // Import useLanguage
import { validateName, validateEmail, validatePhone } from '../utils/inputValidation'; // Import validation functions

export const useContactForm = (
  onSuccess?: (businessName: string) => void,
  initialPlan: "monthly" | "annual" = "annual",
  pricingConfig?: PricingConfiguration
) => {
  const {
    formData,
    files,
    colorPalette,
    handleChange,
    handleColorChange,
    handleFileChange,
    handlePlanChange,
    setInitialPlan,
    addColor,
    removeColor,
    setFiles,
    resetFormData
  } = useFormData(initialPlan, pricingConfig);

  const {
    step,
    totalSteps,
    // navIsSubmitting, // Redundant now
    // setNavIsSubmitting, // Redundant now
    goToNextStep,
    goToPrevStep,
    setStep
  } = useFormNavigation();

  const {
    generatedCopy, // Mantido
    finalContent, // Mantido para passar adiante
    setFinalContent, // Mantido
    resetGeneratedContent, // Mantido
    submitForm, // Mantido, mas não será chamado ao sair do Step 3
    formId, // Mantido
    isSubmitting, // Mantido
    setShowSuccessMessage, // Mantido
    showSuccessMessage // Mantido
  } = useFormSubmission();

  const { language } = useLanguage(); // Get language context

  // Function to move to next step - CORRECTED LOGIC
  const nextStep = (e: React.MouseEvent) => {
    console.log('>>> useContactForm - nextStep INICIADO para step:', step);
    e.preventDefault();

    // --- VALIDATION BEFORE ADVANCING ---
    if (step === 1) {
        if (!validateName(formData.name) || !validateEmail(formData.email) || !validatePhone(formData.phone)) {
            toast.error(language === 'en' ? "Please fill in all required fields correctly." : "Por favor, preencha todos os campos obrigatórios corretamente.");
            return false; // Stop advancement
        }
    }
    if (step === 2) {
        if (!formData.business || !formData.businessDetails || formData.businessDetails.length < 20) {
            toast.error(language === 'en' ? "Please provide complete business details." : "Por favor, forneça detalhes completos sobre seu negócio.");
            return false; // Stop advancement
        }
    }
    // Add validation for step 3 if needed (e.g., require logo or colors)

    // --- ADVANCE STEP ---
    // For ALL steps, including advancing from 3 to 4, just change the step.
    // The API call to create the payment intent will happen inside StripePaymentElement
    // when step becomes 4.
    if (step < totalSteps) {
      console.log(`useContactForm: Avançando do passo ${step} para ${step + 1}`);
      console.log('>>> useContactForm - nextStep CHAMANDO goToNextStep');
      goToNextStep(); // Use the correct navigation function
      return true;
    }
    console.log(`useContactForm: Já está no último passo (${step}).`);
    return false;
  };

  // Function to move to previous step (remains the same)
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    return goToPrevStep();
  };

  // Function to handle FINAL form submission (e.g., if needed AFTER payment)
  // This function is NOT called when moving from step 3 to 4 anymore.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("useContactForm: handleSubmit - Esta função não deveria ser chamada no fluxo atual antes do pagamento.");
    // Potentially call submitForm here AFTER successful payment if needed,
    // but currently the webhook handles the final database update.
  };

  // Function to reset the form
  const resetForm = () => {
    resetFormData();
    resetGeneratedContent();
    setStep(1);
  };

  // Function to set initial step (remains the same)
  const setInitialStep = (newStep: number) => {
    setStep(newStep);
  };

  return {
    formData,
    files,
    colorPalette,
    isSubmitting, // Still reflects submission state if used elsewhere
    step,
    totalSteps,
    generatedCopy, // Pass through
    finalContent, // Pass through
    formId, // Pass through
    handleChange,
    handleColorChange,
    handleFileChange,
    nextStep, // Use the corrected nextStep
    prevStep,
    handleSubmit, // Keep for potential future use
    resetForm,
    setFiles,
    addColor,
    removeColor,
    setFinalContent, // Pass through
    setInitialStep,
    showSuccessMessage,
    setShowSuccessMessage
    // isAiEditing and editContent are removed as content generation was disabled
  };
};
