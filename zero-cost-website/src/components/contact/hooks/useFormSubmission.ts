
import { useState } from "react";
import { ContactFormData, FileData } from "../types";
import { toast } from "sonner";
import { submitToSupabase } from "../utils/supabaseSubmitter";

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [finalContent, setFinalContent] = useState<string>("");
  const [formId, setFormId] = useState<string | null>(null);

  const submitForm = async (
    {
      formData,
      files,
      colorPalette,
      content
    }: {
      formData: ContactFormData;
      files: FileData;
      colorPalette: string[];
      content: string;
    },
    onSuccess?: (businessName: string) => void
  ) => {
    console.log('>>> useFormSubmission - submitForm INICIADO');
    setIsSubmitting(true);
    console.log("Submitting form data to Supabase...", formData);
    console.log("Content being submitted:", content);
    
    try {
      // Use the Supabase submitter function to send the data
      const result = await submitToSupabase(
        formData,
        files,
        colorPalette,
        content || finalContent
      );
      
      if (!result.success) {
        console.error("Error submitting to Supabase:", result.message);
        toast.error("Erro ao enviar o formulário: " + result.message);
        setIsSubmitting(false);
        return false;
      }
      
      console.log("Form submitted successfully to Supabase!");
      console.log("Supabase response data:", result.data);
      
      // Store the form ID for later use with Stripe payment
      if (result.data && result.data.id) {
        setFormId(result.data.id);
        // Also save it to localStorage as a backup
        localStorage.setItem('form_id', result.data.id);
        console.log("Form ID saved:", result.data.id);
      } else {
        console.error("No form ID returned from Supabase submission");
      }
      
      // Don't set showSuccessMessage yet - we'll wait for the payment to complete
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(formData.business);
      }
      
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Unexpected error during form submission:", error);
      toast.error("Erro inesperado ao enviar o formulário. Por favor, tente novamente.");
      setIsSubmitting(false);
      return false;
    }
  };

  const resetGeneratedContent = () => {
    setFinalContent("");
  };

  return {
    isSubmitting,
    handleSubmit: submitForm,
    resetGeneratedContent,
    generatedCopy: { content: finalContent },
    showSuccessMessage,
    setShowSuccessMessage,
    finalContent,
    setFinalContent,
    submitForm,
    formId
  };
};
