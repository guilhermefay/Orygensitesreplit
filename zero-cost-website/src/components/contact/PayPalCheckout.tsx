
import React from 'react';
import { toast } from 'sonner';
import { ContactFormData, FileData } from './types';
import { PricingConfiguration } from '@/lib/config/pricing';
import { useCurrencyHandling } from './paypal/hooks/useCurrencyHandling';
import { usePaymentProcess } from './paypal/hooks/usePaymentProcess';
import PaymentSection from './paypal/PaymentSection';

interface PayPalCheckoutProps {
  selectedPlan: "monthly" | "annual";
  onBack: (e: React.MouseEvent) => void;
  onSuccess: (paymentId: string) => void;
  formData: ContactFormData;
  files: FileData;
  colorPalette: string[];
  finalContent: string;
  pricingConfig?: PricingConfiguration;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({ 
  selectedPlan, 
  onBack, 
  onSuccess,
  formData,
  files,
  colorPalette,
  finalContent,
  pricingConfig = {
    monthly: 89.9,
    annual: 599.0,
    monthlyInAnnual: 49.9,
    currency: 'BRL',
    currencySymbol: 'R$',
    discount: 44,
    marketPrice: 530.65,  // Adding the missing properties
    savings: 480.75,
    savingsPercentage: 91
  }
}) => {
  console.log("🖥 [PayPalCheckout] Renderizando com os dados completos do formulário");
  
  // Handle currency and amounts
  const {
    displayCurrency,
    displayCurrencySymbol,
    processingCurrency,
    displayAmount,
    processingAmount,
    description
  } = useCurrencyHandling({
    selectedPlan,
    pricingConfig
  });
  
  // Handle payment process
  const {
    clientId,
    sdkError,
    isLoading,
    isPaid,
    isClientLoading,
    setOrderLoading,
    createOrder,
    handleApprove
  } = usePaymentProcess({
    processingAmount,
    description,
    formData,
    files,
    colorPalette,
    finalContent,
    displayCurrency,
    processingCurrency,
    onSuccess
  });

  // Wrapper for onApprove to include toast handling
  const onApprove = async (data: { orderID: string }) => {
    console.log(`💰 [PayPalCheckout] Pagamento aprovado pelo PayPal. OrderID: ${data.orderID}, Display Currency: ${displayCurrency}, Processing Currency: ${processingCurrency}`);
    
    // Show toast immediately to indicate progress
    toast.loading("Finalizando seu pagamento...");
    
    try {
      const result = await handleApprove(data);
      console.log(`[PayPalCheckout] Resultado da aprovação: ${result ? "Sucesso" : "Falha"}`);
      
      if (!result) {
        toast.dismiss();
        toast.error("Não foi possível finalizar o pagamento. Por favor, tente novamente.");
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[PayPalCheckout] Erro durante aprovação do pagamento:`, error);
      toast.dismiss();
      toast.error("Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.");
      return null;
    }
  };

  return (
    <PaymentSection
      selectedPlan={selectedPlan}
      onBack={onBack}
      displayAmount={displayAmount}
      description={description}
      displayCurrencySymbol={displayCurrencySymbol}
      displayCurrency={displayCurrency}
      processingAmount={processingAmount}
      processingCurrency={processingCurrency}
      isPaid={isPaid}
      clientId={clientId}
      sdkError={sdkError}
      isClientLoading={isClientLoading}
      setOrderLoading={setOrderLoading}
      createOrder={createOrder}
      onApprove={onApprove}
      isLoading={isLoading}
    />
  );
};

export default PayPalCheckout;
