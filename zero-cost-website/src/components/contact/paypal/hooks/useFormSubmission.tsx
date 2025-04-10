
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useFileUpload } from './useFileUpload';
import { useContentGeneration } from '../../hooks/useContentGeneration';
import { ContactFormData, FileData } from '../../types';

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmissionId, setFormSubmissionId] = useState<string | null>(null);
  const { uploadFiles } = useFileUpload();
  const { generatedCopy } = useContentGeneration();

  // Função para salvar dados do formulário em abandoned_forms antes do pagamento
  const saveFormData = async (
    formData: ContactFormData,
    files: FileData,
    colorPalette: string[],
    finalContent: string
  ) => {
    try {
      setIsSubmitting(true);
      console.log("Salvando dados do formulário na tabela abandoned_forms antes do pagamento");
      
      // First, upload files to get URLs
      const { logoUrl, photoUrls } = await uploadFiles(files, formData.business);
      console.log("File upload results - Logo:", logoUrl, "Photos:", photoUrls);
      
      // Prepare data for Supabase
      let contentToSave = finalContent;
      
      // If finalContent is empty, try to get from generatedCopy
      if (!contentToSave && generatedCopy?.content) {
        console.log("finalContent empty, using generatedCopy.content");
        contentToSave = generatedCopy.content;
      }

      // If still empty, try to retrieve from localStorage
      if (!contentToSave) {
        const savedContent = localStorage.getItem('generated_content');
        if (savedContent) {
          console.log("Retrieving content from localStorage");
          contentToSave = savedContent;
        } else {
          console.warn("Couldn't recover content, using fallback");
          contentToSave = `Conteúdo padrão para ${formData.business}`;
        }
      }
      
      // Build data object for Supabase - Use specific plan variant if available
      const planVariant = new URLSearchParams(window.location.search).get('variant') || formData.selectedPlan;
      
      // Gerar UUID para usar como ID do formulário
      const formId = crypto.randomUUID();
      
      // Inserir em abandoned_forms com form_id como identificador único
      const submissionData = {
        form_id: formId, // Agora este é apenas um identificador único, não uma chave estrangeira
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        business: formData.business,
        business_details: formData.businessDetails,
        content: contentToSave,
        color_palette: JSON.stringify(colorPalette),
        selected_plan: formData.selectedPlan,
        plan_variant: planVariant, // Explicitly save plan variant
        logo_url: logoUrl,
        photo_urls: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null
      };
      
      console.log("Form data being saved to abandoned_forms:", submissionData);
      
      // Insert into abandoned_forms table
      const { data: submissionResult, error: submissionError } = await supabase
        .from('abandoned_forms')
        .insert([submissionData])
        .select();
        
      if (submissionError) {
        console.error("Error saving form data to abandoned_forms:", submissionError);
        toast.error("Erro ao salvar dados do formulário: " + submissionError.message);
        return null;
      }
      
      if (submissionResult && submissionResult.length > 0) {
        console.log("Form saved to abandoned_forms with ID:", formId);
        // Definir o ID do formulário para uso no processo de pagamento
        setFormSubmissionId(formId);
        return formId;
      } else {
        console.error("No form ID returned after abandoned_forms submission");
        toast.error("Erro: Nenhum ID retornado após salvar o formulário");
        return null;
      }
    } catch (error) {
      console.error("Error in form save to abandoned_forms:", error);
      toast.error("Erro ao salvar dados: " + (error instanceof Error ? error.message : String(error)));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { saveFormData, formSubmissionId, setFormSubmissionId, isSubmitting };
};
