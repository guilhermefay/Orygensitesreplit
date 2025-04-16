import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface FormNavProps {
  step: number;
  totalSteps: number;
  isSubmitting: boolean;
  prevStep: (e: React.MouseEvent) => void;
  nextStep: (e: React.MouseEvent) => void;
}

const FormNav: React.FC<FormNavProps> = ({ 
  step, 
  totalSteps, 
  isSubmitting, 
  prevStep, 
  nextStep 
}) => {
  const isMobile = useIsMobile();
  const { translate } = useLanguage();
  
  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Next button clicked for step:", step);
    nextStep(e);
  };
  
  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Previous button clicked for step:", step);
    prevStep(e);
  };
  
  return (
    <div className={`flex justify-between ${isMobile ? 'mt-5 w-full px-1' : 'mt-10 w-full max-w-md mx-auto'}`}>
      {step > 1 ? (
        <button
          type="button"
          onClick={handlePrevClick}
          className={`group px-3 py-1.5 md:px-4 md:py-2 border-2 border-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}
        >
          <ArrowLeft className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} transition-transform group-hover:-translate-x-1`} />
          {translate('form.back')}
        </button>
      ) : (
        <div></div>
      )}
      
      {step < totalSteps ? (
        <button
          type="button"
          onClick={handleNextClick}
          className={`group px-3 py-1.5 md:px-5 md:py-2.5 bg-black text-white font-medium rounded-lg shadow-md transition-all duration-300 hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-2`}
        >
          {translate('form.next')}
          <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} transition-transform group-hover:translate-x-1`} />
        </button>
      ) : null }
    </div>
  );
};

export default FormNav;
