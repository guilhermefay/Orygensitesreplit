
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ContactForm from './ContactForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPricingFromUrl } from '@/lib/config/getPricingFromUrl';
import { PricingConfiguration } from '@/lib/config/pricing';
import { useLanguage } from '@/contexts/LanguageContext';

interface FormContextType {
  isFormOpen: boolean;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FormContext = createContext<FormContextType>({
  isFormOpen: false,
  setIsFormOpen: () => {},
});

export const useFormContext = () => useContext(FormContext);

// Create a FormProvider component to export
export const FormProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  return (
    <FormContext.Provider value={{ isFormOpen, setIsFormOpen }}>
      {children}
    </FormContext.Provider>
  );
};

interface FloatingContactFormProps {
  children: ReactNode;
  initialPlan?: "monthly" | "annual";
  buttonClassName?: string;
  pricingConfig?: PricingConfiguration;
}

const FloatingContactForm: React.FC<FloatingContactFormProps> = ({ 
  children, 
  initialPlan = "annual",
  buttonClassName,
  pricingConfig
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isMobile = useIsMobile();
  const { translate } = useLanguage();
  
  // If no pricing config is provided, try to get it from URL parameters
  const derivedPricingConfig = pricingConfig || getPricingFromUrl();

  const handleFormSuccess = (businessName: string) => {
    console.log(`Contact form submitted successfully for: ${businessName}`);
    // We don't close the dialog here to show the success message in place
  };

  return (
    <FormContext.Provider value={{ isFormOpen, setIsFormOpen }}>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <button 
            className={buttonClassName || "fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg font-medium flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"}
            onClick={() => setIsFormOpen(true)}
          >
            {children}
          </button>
        </DialogTrigger>
        <DialogContent className={`${isMobile ? 'max-w-[98%] p-0' : 'max-w-4xl p-0'} max-h-[95vh] overflow-y-auto`}>
          <div className={`${isMobile ? 'p-2.5' : 'p-4'} border-b sticky top-0 bg-white z-10`}>
            <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{translate('contact.requestSite')}</h2>
          </div>
          <div className={`${isMobile ? 'p-2' : 'p-6'}`}>
            <ContactForm initialPlan={initialPlan} onSuccess={handleFormSuccess} pricingConfig={derivedPricingConfig} />
          </div>
        </DialogContent>
      </Dialog>
    </FormContext.Provider>
  );
};

export default FloatingContactForm;
