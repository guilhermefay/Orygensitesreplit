
import { useState } from "react";
import { useFormData } from "./useFormData";
import { useFormNavigation } from "./useFormNavigation";
import { useContentGeneration } from "./useContentGeneration";
import { useFormSubmission } from "./useFormSubmission";
import { PricingConfiguration } from "@/lib/config/pricing";

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
    navIsSubmitting,
    setNavIsSubmitting,
    goToNextStep,
    goToPrevStep,
    setStep
  } = useFormNavigation();
  
  const {
    generatedCopy,
    isAiEditing,
    generateContent,
    editContent,
    resetGeneratedContent
  } = useContentGeneration();
  
  const {
    isSubmitting,
    finalContent,
    setFinalContent,
    showSuccessMessage,
    submitForm,
    formId,
    setShowSuccessMessage
  } = useFormSubmission();

  // Function to move to next step - no longer generates content
  const nextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // For all steps, just move forward without content generation
    return goToNextStep();
  };

  // Function to move to previous step
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    return goToPrevStep();
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gather form data
    const formSubmissionData = {
      formData,
      files,
      colorPalette,
      content: finalContent || generatedCopy.content || ""
    };
    
    // Submit the form data
    await submitForm(formSubmissionData, onSuccess);
  };

  // Function to reset the form
  const resetForm = () => {
    resetFormData();
    resetGeneratedContent();
    setStep(1);
  };

  // Function to set initial step
  const setInitialStep = (newStep: number) => {
    setStep(newStep);
  };

  return {
    formData,
    files,
    colorPalette,
    isSubmitting: isSubmitting || navIsSubmitting,
    step,
    totalSteps,
    generatedCopy,
    finalContent,
    formId,
    handleChange,
    handleColorChange,
    handleFileChange,
    nextStep,
    prevStep,
    handleSubmit,
    resetForm,
    setFiles,
    addColor,
    removeColor,
    setFinalContent,
    setInitialStep,
    showSuccessMessage,
    isAiEditing,
    editContent,
    submitForm,
    setShowSuccessMessage
  };
};
