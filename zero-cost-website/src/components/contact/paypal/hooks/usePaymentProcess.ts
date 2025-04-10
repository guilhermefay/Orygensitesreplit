
import { useState, useEffect } from 'react';
import { usePayPalClientId } from './usePayPalClientId';
import { usePayPalOrder } from './usePayPalOrder';
import { ContactFormData, FileData } from '../../types';

interface UsePaymentProcessProps {
  processingAmount: number;
  description: string;
  formData: ContactFormData;
  files: FileData;
  colorPalette: string[];
  finalContent: string;
  displayCurrency: string;
  processingCurrency: string;
  onSuccess: (paymentId: string) => void;
}

export const usePaymentProcess = ({
  processingAmount,
  description,
  formData,
  files,
  colorPalette,
  finalContent,
  displayCurrency,
  processingCurrency,
  onSuccess
}: UsePaymentProcessProps) => {
  const [isPaid, setIsPaid] = useState(false);
  
  // Custom hooks for PayPal integration
  const { clientId, sdkError, isLoading: isClientLoading, sdkReady } = usePayPalClientId();
  
  const { 
    createOrder, 
    onApprove: handleApprove, 
    isLoading: isOrderLoading, 
    setIsLoading: setOrderLoading, 
    isPaid: orderIsPaid,
    paymentId,
    formSubmissionId
  } = usePayPalOrder({ 
    amount: processingAmount, // Use processing amount (BRL)
    description,
    formData,
    files,
    colorPalette,
    finalContent,
    currency: processingCurrency // Always process in BRL
  });

  // Combined loading state
  const isLoading = isClientLoading || isOrderLoading;

  // useEffect to call onSuccess when payment is completed
  useEffect(() => {
    // When isPaid becomes true and we have a paymentId, call onSuccess
    if (orderIsPaid && paymentId) {
      console.log(`🎉 [usePaymentProcess] Pagamento concluído com sucesso! PaymentId: ${paymentId}, Display Currency: ${displayCurrency}, Processing Currency: ${processingCurrency}`);
      setIsPaid(true);
      onSuccess(paymentId);
    }
  }, [orderIsPaid, paymentId, onSuccess, displayCurrency, processingCurrency]);

  // Log form submission ID when it changes
  useEffect(() => {
    if (formSubmissionId) {
      console.log(`📋 [usePaymentProcess] Form submission ID: ${formSubmissionId}, Display Currency: ${displayCurrency}, Processing Currency: ${processingCurrency}`);
    }
  }, [formSubmissionId, displayCurrency, processingCurrency]);

  // Log when clientId changes
  useEffect(() => {
    console.log(`🔑 [usePaymentProcess] Client ID alterado: ${clientId ? 'Recebido' : 'Nulo'}`);
    if (clientId) {
      console.log(`🔑 [usePaymentProcess] Prefixo do Client ID: ${clientId.substring(0, 5)}...`);
    }
  }, [clientId]);

  // Log SDK ready state
  useEffect(() => {
    console.log(`🔌 [usePaymentProcess] SDK Ready: ${sdkReady}`);
  }, [sdkReady]);

  return {
    clientId,
    sdkError,
    isLoading,
    isPaid,
    isClientLoading,
    setOrderLoading,
    createOrder,
    handleApprove
  };
};
