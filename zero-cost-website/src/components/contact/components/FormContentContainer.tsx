
import React from 'react';
import ContactInfo from '../ContactInfo';
import BusinessDetails from '../BusinessDetails';
import VisualIdentity from '../VisualIdentity';
import CartCheckout from '../CartCheckout';
import { ContactFormData, FileData } from '../types';
import { PricingConfiguration } from '@/lib/config/pricing';
import { useFormSubmission } from '../hooks/useFormSubmission';

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
  formId?: string;
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
  formId
}) => {
  // Get formId from the useFormSubmission hook or localStorage
  const { formId: hookFormId } = useFormSubmission();
  const storedFormId = localStorage.getItem('form_id');
  
  // Use either the formId from props, hooks or from localStorage, ensure it's a valid ID
  const effectiveFormId = formId || hookFormId || storedFormId || '';
  
  console.log("FormContentContainer - using formId:", effectiveFormId);
  console.log("FormContentContainer - sources:", {
    fromProps: formId,
    fromHook: hookFormId,
    fromStorage: storedFormId
  });
  
  // Log para depuração do valor do useStripeRedirect
  console.log("🔍 FormContentContainer - valores de pagamento:", {
    isStripePayment,
    useStripeRedirect: useStripeRedirect === true ? true : false // Força valor booleano explícito
  });

  return (
    <div className="mt-6 mb-4">
      {step === 1 && (
        <ContactInfo
          formData={formData}
          handleChange={handleChange}
        />
      )}
      {step === 2 && (
        <BusinessDetails
          formData={formData}
          handleChange={handleChange}
        />
      )}
      {step === 3 && (
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
      )}
      {step === 4 && (
        <CartCheckout
          formData={formData}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
          pricingConfig={pricingConfig}
          formId={effectiveFormId}
          files={files}
          colorPalette={colorPalette}
          finalContent={finalContent}
        />
      )}
    </div>
  );
};

export default FormContentContainer;
