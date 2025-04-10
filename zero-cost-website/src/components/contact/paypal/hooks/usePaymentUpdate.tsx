
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export const usePaymentUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateFormSubmission = async (formId: string, paymentId: string, retryCount = 0) => {
    if (!formId || !paymentId) {
      console.error("Missing formId or paymentId for update:", { formId, paymentId });
      return false;
    }
    
    console.log(`🔄 Updating form submission ${formId} with payment ${paymentId} (attempt ${retryCount + 1})`);
    setIsUpdating(true);
    
    try {
      // Clear debug approach: Log current state before update
      const { data: beforeData, error: beforeError } = await supabase
        .from('form_submissions')
        .select('payment_status, payment_id, payment_date')
        .eq('id', formId)
        .single();
        
      if (beforeError) {
        console.error("Error fetching current form state:", beforeError);
      } else {
        console.log("Current form state before update:", beforeData);
      }

      // Perform the update with detailed logging
      console.log(`Attempting to update form_submissions where id = ${formId}`);
      console.log(`Setting payment_status = 'paid', payment_id = '${paymentId}', payment_date = ${new Date().toISOString()}`);
      
      const { data: updateData, error: updateError } = await supabase
        .from('form_submissions')
        .update({
          payment_status: 'paid',
          payment_id: paymentId,
          payment_date: new Date().toISOString()
        })
        .eq('id', formId)
        .select();
        
      if (updateError) {
        console.error(`❌ Attempt ${retryCount + 1}: Error updating form:`, updateError);
        console.log(`Error code: ${updateError.code}, message: ${updateError.message}, details: ${updateError.details}`);
        
        // Check if it's a permission error
        if (updateError.code === '42501' || updateError.message.includes('permission denied')) {
          console.error('💥 Permission error detected! This is likely an RLS policy issue.');
        }
        
        // Retry up to 3 times with increasing delay
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`⏱️ Retrying update in ${delay/1000} seconds (${retryCount + 1}/3)`);
          setTimeout(() => updateFormSubmission(formId, paymentId, retryCount + 1), delay);
          return false;
        } else {
          console.error("❌ Failed to update form after 3 attempts");
          toast.error("Pagamento realizado, mas erro ao atualizar registro");
          setIsUpdating(false);
          return false;
        }
      }
      
      console.log("✅ Update operation completed. Response data:", updateData);
      
      // Verify the update was successful
      const { data: checkData, error: checkError } = await supabase
        .from('form_submissions')
        .select('payment_status, payment_id, payment_date')
        .eq('id', formId)
        .single();
        
      if (checkError) {
        console.error("❌ Error verifying form update:", checkError);
        
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`⏱️ Retrying verification in ${delay/1000} seconds (${retryCount + 1}/3)`);
          setTimeout(() => updateFormSubmission(formId, paymentId, retryCount + 1), delay);
          setIsUpdating(false);
          return false;
        } else {
          setIsUpdating(false);
          return false;
        }
      }
      
      console.log("🔍 Verification query result:", checkData);
      
      if (checkData && checkData.payment_status === 'paid' && checkData.payment_id === paymentId) {
        console.log("✅ Form record updated and verified:", checkData);
        toast.success("Status de pagamento atualizado com sucesso!");
        setIsUpdating(false);
        return true;
      } else {
        console.error("⚠️ Form record update could not be verified:", checkData);
        
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`⏱️ Retrying update in ${delay/1000} seconds (${retryCount + 1}/3)`);
          setTimeout(() => updateFormSubmission(formId, paymentId, retryCount + 1), delay);
          setIsUpdating(false);
          return false;
        } else {
          setIsUpdating(false);
          return false;
        }
      }
    } catch (error) {
      console.error("❌ Exception during form update:", error);
      setIsUpdating(false);
      return false;
    }
  };

  return { updateFormSubmission, isUpdating };
};
