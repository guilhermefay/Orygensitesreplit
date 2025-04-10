
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ContactFormData, FileData } from '../../types';
import { useFormSubmission } from './useFormSubmission';
import { usePaymentUpdate } from './usePaymentUpdate';
import { usePayPalOperations } from './usePayPalOperations';

interface UsePayPalOrderProps {
  amount: number;
  description: string;
  formData: ContactFormData;
  files: FileData;
  colorPalette: string[];
  finalContent: string;
  currency?: string;
}

export const usePayPalOrder = ({ 
  amount, 
  description, 
  formData, 
  files, 
  colorPalette, 
  finalContent,
  currency = 'BRL'
}: UsePayPalOrderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [formSubmissionId, setFormSubmissionId] = useState<string | null>(null);
  
  // Validar e normalizar a moeda - Garantir que seja BRL (processamento sempre em BRL)
  const normalizedCurrency = 'BRL'; // Force BRL for processing
  
  // Using our specialized hooks
  const { saveFormData, formSubmissionId: submissionId, setFormSubmissionId: setSubId, isSubmitting } = useFormSubmission();
  const { updateFormSubmission, isUpdating } = usePaymentUpdate();
  const { createPayPalOrder, capturePayPalOrder, isProcessing } = usePayPalOperations();

  // Update formSubmissionId when it changes in the useFormSubmission hook
  useEffect(() => {
    if (submissionId) {
      setFormSubmissionId(submissionId);
    }
  }, [submissionId]);

  // Master loading state combines all sub-loading states
  const combinedLoading = isLoading || isSubmitting || isProcessing || isUpdating;

  // Log da moeda sendo usada
  useEffect(() => {
    console.log(`💱 [usePayPalOrder] Usando moeda para processamento: ${normalizedCurrency} (valor original: ${currency})`);
    console.log(`💵 [usePayPalOrder] Valor para processamento: ${amount.toFixed(2)} ${normalizedCurrency}`);
  }, [normalizedCurrency, currency, amount]);

  const createOrder = async () => {
    try {
      setIsLoading(true);
      console.log(`🚀 [usePayPalOrder] Starting PayPal order creation process (processing currency: ${normalizedCurrency})`);
      
      // First save the form data to abandoned_forms and get the form ID
      console.log("📝 [usePayPalOrder] Saving form data to abandoned_forms before creating PayPal order");
      const formId = await saveFormData(formData, files, colorPalette, finalContent);
      
      if (!formId) {
        console.error("❌ [usePayPalOrder] Failed to save form data before payment");
        toast.error("Erro ao salvar dados do formulário");
        return null;
      }
      
      console.log(`✅ [usePayPalOrder] Form data saved successfully to abandoned_forms with ID: ${formId}`);
      
      // Now create the PayPal order
      console.log(`💲 [usePayPalOrder] Creating PayPal order for amount ${amount.toFixed(2)} ${normalizedCurrency} with form ID ${formId}`);
      const orderId = await createPayPalOrder(amount, description, formId, normalizedCurrency);
      
      if (!orderId) {
        console.error("❌ [usePayPalOrder] Failed to create PayPal order");
        return null;
      }
      
      console.log(`✅ [usePayPalOrder] PayPal order created successfully with ID: ${orderId}`);
      return orderId;
    } catch (error) {
      console.error("❌ [usePayPalOrder] Error in createOrder process:", error);
      toast.error("Erro ao processar o pedido. Por favor, tente novamente.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      setIsLoading(true);
      console.log(`🔍 [usePayPalOrder] Approving PayPal order: ${data.orderID} (processing currency: ${normalizedCurrency})`);
      
      // Make sure we have the form submission ID
      if (!formSubmissionId) {
        console.error("❌ [usePayPalOrder] No form submission ID found");
        toast.error("Erro: ID do formulário não encontrado");
        return null;
      }
      
      console.log(`🔄 [usePayPalOrder] Processing payment for form ID: ${formSubmissionId}`);
      
      // Capture the PayPal payment
      const capturedPaymentId = await capturePayPalOrder(
        data.orderID, 
        formSubmissionId,
        amount,
        normalizedCurrency
      );

      if (!capturedPaymentId) {
        console.error("❌ [usePayPalOrder] Failed to capture payment");
        toast.error("Erro ao capturar o pagamento. Por favor, tente novamente.");
        return null;
      }
      
      console.log(`💰 [usePayPalOrder] Payment captured successfully with ID: ${capturedPaymentId}`);
      
      // A migração entre tabelas é feita na edge function agora, não precisamos mais chamar updateFormSubmission
      console.log(`✅ [usePayPalOrder] Form ${formSubmissionId} migrated from abandoned_forms to form_submissions`);
      
      // Show success message IMMEDIATELY (don't wait for update confirmation)
      setIsPaid(true);
      toast.success("Pagamento realizado com sucesso!");
      
      // Return payment ID for further processing
      setPaymentId(capturedPaymentId);
      return capturedPaymentId;
    } catch (error) {
      console.error("❌ [usePayPalOrder] Error in payment approval process:", error);
      toast.error("Erro ao finalizar o pagamento. Por favor, verifique.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    createOrder, 
    onApprove, 
    isLoading: combinedLoading, 
    setIsLoading, 
    isPaid, 
    setIsPaid, 
    paymentId, 
    formSubmissionId,
    currency: normalizedCurrency // Always return BRL as processing currency
  };
};
