
import React from 'react';
import { User, Palette, Building, CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const isMobile = useIsMobile();
  const { translate, language } = useLanguage();
  
  const steps = [
    { 
      name: translate('form.step.contactInfo'), 
      icon: <User size={isMobile ? 10 : 12} /> 
    },
    { 
      name: translate('form.step.business'), 
      icon: <Building size={isMobile ? 10 : 12} /> 
    },
    { 
      name: translate('form.step.visualIdentity'), 
      icon: <Palette size={isMobile ? 10 : 12} /> 
    },
    { 
      name: translate('form.step.payment'), 
      icon: <CreditCard size={isMobile ? 10 : 12} /> 
    }
  ];

  return (
    <div className="mb-3 md:mb-6 mx-auto w-full max-w-md">
      <div className="flex items-center justify-between mb-2 relative w-full">
        {/* Connecting line */}
        <div className="absolute top-2 md:top-3 left-6 md:left-8 right-6 md:right-8 h-[1px] md:h-[2px] bg-gray-200 z-0"></div>
        
        {steps.slice(0, totalSteps).map((step, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center relative z-10 ${
              index + 1 === currentStep
                ? "text-black font-medium"
                : index + 1 < currentStep
                ? "text-black"
                : "text-gray-400"
            }`}
          >
            <div 
              className={`flex items-center justify-center h-4 w-4 md:h-6 md:w-6 rounded-full relative ${
                index + 1 === currentStep
                  ? "bg-highlight"
                  : index + 1 < currentStep
                  ? "bg-highlight"
                  : "bg-gray-100"
              }`}
            >
              {/* Step number badge */}
              <div className="absolute -top-1 -right-1 bg-black text-white h-2 w-2 md:h-3 md:w-3 rounded-full flex items-center justify-center text-[6px] md:text-[8px] font-bold">
                {index + 1}
              </div>
              
              {index + 1 < currentStep ? (
                <svg className="h-2 w-2 md:h-3 md:w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-black">{step.icon}</span>
              )}
            </div>
            
            <span className="text-[8px] md:text-xs mt-1">{step.name}</span>
          </div>
        ))}
      </div>
      
      <div className="relative max-w-md mx-auto mt-1 md:mt-2">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 rounded-full"></div>
        <div 
          className="absolute top-0 left-0 h-1 bg-highlight rounded-full transition-all duration-500"
          style={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;
