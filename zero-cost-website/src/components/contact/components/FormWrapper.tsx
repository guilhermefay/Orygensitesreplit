
import React from "react";
import StepIndicator from "../StepIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormWrapperProps {
  step: number;
  totalSteps: number;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

const FormWrapper: React.FC<FormWrapperProps> = ({ 
  step, 
  totalSteps, 
  onSubmit, 
  children 
}) => {
  const isMobile = useIsMobile();

  return (
    <form onSubmit={onSubmit} className={`w-full ${isMobile ? 'max-w-full px-1' : 'max-w-4xl'} mx-auto`}>
      <div className="flex justify-center mx-auto">
        <StepIndicator currentStep={step} totalSteps={totalSteps} />
      </div>
      {children}
    </form>
  );
};

export default FormWrapper;
