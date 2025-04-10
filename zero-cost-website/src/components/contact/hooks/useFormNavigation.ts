
import { useState } from "react";

export const useFormNavigation = () => {
  const [step, setStep] = useState(1); // Começa na etapa 1 (dados de contato)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4; // Total de etapas: 1. Informações de contato, 2. Detalhes do negócio, 3. Identidade visual, 4. Pagamento
  
  const nextStep = () => {
    if (step < totalSteps) {
      console.log(`Moving to next step: ${step} -> ${step + 1}`);
      setStep(prevStep => prevStep + 1);
      return true;
    }
    console.log(`Can't move to next step, already at max: ${step}`);
    return false;
  };
  
  const prevStep = (e?: React.MouseEvent) => {
    if (step > 1) {
      console.log(`Moving to previous step: ${step} -> ${step - 1}`);
      setStep(prevStep => prevStep - 1);
      return true;
    }
    console.log(`Can't move to previous step, already at min: ${step}`);
    return false;
  };
  
  const goToStep = (newStep: number) => {
    if (newStep >= 1 && newStep <= totalSteps) {
      console.log(`Going directly to step: ${step} -> ${newStep}`);
      setStep(newStep);
      return true;
    }
    console.log(`Can't go to step ${newStep}, out of range (1-${totalSteps})`);
    return false;
  };
  
  const setInitialStep = (initialStep: number) => {
    console.log(`Setting initial step to: ${initialStep}`);
    if (initialStep >= 1 && initialStep <= totalSteps) {
      setStep(initialStep);
      return true;
    }
    console.log(`Can't set initial step to ${initialStep}, out of range (1-${totalSteps})`);
    return false;
  };
  
  return {
    step,
    totalSteps,
    isSubmitting,
    setIsSubmitting,
    nextStep,
    prevStep,
    goToStep,
    setInitialStep,
    // Adding these for compatibility with existing code
    navIsSubmitting: isSubmitting,
    setNavIsSubmitting: setIsSubmitting,
    goToNextStep: nextStep,
    goToPrevStep: prevStep,
    setStep
  };
};
