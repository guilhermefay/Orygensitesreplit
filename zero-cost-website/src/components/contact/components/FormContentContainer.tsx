import React, { useState } from 'react';
import ContactInfo from '../ContactInfo';
import BusinessDetails from '../BusinessDetails';
import VisualIdentity from '../VisualIdentity';
import CartCheckout from '../CartCheckout';
import { ContactFormData, FileData } from '../types';
import { PricingConfiguration } from '@/lib/config/pricing';
import { useFormSubmission } from '../hooks/useFormSubmission';
import { cn } from '@/lib/utils';

interface FormContentContainerProps {
  step: number;
  formData: ContactFormData;
  files: FileData;
  colorPalette: string[];
  finalContent: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleColorChange: (colorIndex: number, color: string) => void;
  handleFileChange: (type: 'photos' | 'logo', e: React.ChangeEvent<HTMLInputElement>) => void;
  setFiles: React.Dispatch<React.SetStateAction<FileData>>;
  addColor: () => void;
  removeColor: (index: number) => boolean;
  handlePaymentSuccess: (paymentId: string) => void;
  handlePaymentBack: (e: React.MouseEvent) => void;
  pricingConfig?: PricingConfiguration;
  isStripePayment?: boolean;
  useStripeRedirect?: boolean;
  clientSecret: string | null;
  currentFormId: string | null;
}

const FormContentContainer: React.FC<FormContentContainerProps> = ({
  step,
  formData,
  files,
  colorPalette,
  finalContent,
  handleChange,
  handleColorChange,
  handleFileChange,
  setFiles,
  addColor,
  removeColor,
  handlePaymentSuccess,
  handlePaymentBack,
  pricingConfig,
  isStripePayment = false,
  useStripeRedirect = false,
  clientSecret,
  currentFormId
}) => {
  // Log para depuração do valor do useStripeRedirect
  console.log("🔍 FormContentContainer - valores de pagamento:", {
    isStripePayment,
    useStripeRedirect: useStripeRedirect === true ? true : false // Força valor booleano explícito
  });

  return (
    <div className="mt-6 mb-4 relative">
      {/* Render ALL step components, control visibility with CSS */}
      <div className={cn({ block: step === 1, hidden: step !== 1 })}>
        <ContactInfo
          formData={formData}
          handleChange={handleChange}
        />
      </div>
      <div className={cn({ block: step === 2, hidden: step !== 2 })}>
        <BusinessDetails
          formData={formData}
          handleChange={handleChange}
        />
      </div>
      <div className={cn({ block: step === 3, hidden: step !== 3 })}>
        <VisualIdentity
          formData={formData}
          files={files}
          colorPalette={colorPalette}
          handleColorChange={handleColorChange}
          handleFileChange={handleFileChange}
          setFiles={setFiles}
          addColor={addColor}
          removeColor={removeColor}
        />
      </div>
      <div className={cn({ block: step === 4, hidden: step !== 4 })}>
        <CartCheckout
          formData={formData}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
          pricingConfig={pricingConfig}
          files={files}
          colorPalette={colorPalette}
          finalContent={finalContent}
          clientSecret={clientSecret}
          currentFormId={currentFormId}
        />
      </div>
    </div>
  );
};

export default FormContentContainer;
