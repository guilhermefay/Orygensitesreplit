import React, { useState } from 'react';
import ContactInfo from '../ContactInfo';
import CartCheckout from '../CartCheckout';
import { ContactFormData } from '../types';
import { PricingConfiguration } from '@/lib/config/pricing';
import { cn } from '@/lib/utils';

interface FormContentContainerProps {
  step: number;
  formData: ContactFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handlePaymentSuccess: (paymentId: string) => void;
  handlePaymentBack: (e: React.MouseEvent) => void;
  pricingConfig?: PricingConfiguration;
  clientSecret: string | null;
  currentFormId: string | null;
}

const FormContentContainer: React.FC<FormContentContainerProps> = ({
  step,
  formData,
  handleChange,
  handlePaymentSuccess,
  handlePaymentBack,
  pricingConfig,
  clientSecret,
  currentFormId
}) => {
  console.log("[FormContentContainer] Renderizando Step:", step);
  console.log("[FormContentContainer] Recebeu clientSecret:", clientSecret);
  console.log("[FormContentContainer] Recebeu currentFormId:", currentFormId);

  return (
    <div className="mt-6 mb-4 relative">
      <div className={cn({ block: step === 1, hidden: step !== 1 })}>
        <ContactInfo
          formData={formData}
          handleChange={handleChange}
        />
      </div>
      <div className={cn({ block: step === 2, hidden: step !== 2 })}>
        <CartCheckout
          formData={{
            ...formData,
            business: formData.business || "-",
            industry: formData.industry || "",
            competitors: formData.competitors || "",
            goals: formData.goals || "",
            businessDetails: formData.businessDetails || ""
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
          pricingConfig={pricingConfig}
          files={undefined}
          colorPalette={undefined}
          finalContent={undefined}
          clientSecret={clientSecret}
          currentFormId={currentFormId}
        />
      </div>
    </div>
  );
};

export default FormContentContainer;
