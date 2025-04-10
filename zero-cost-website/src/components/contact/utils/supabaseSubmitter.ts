
import { toast } from "sonner";
import { ContactFormData, FileData } from "../types";
import { uploadFile, saveFormSubmission } from "../../../lib/supabase";

/**
 * Simplified function to submit form data to Supabase
 */
export const submitToSupabase = async (
  formData: ContactFormData,
  files: FileData,
  colorPalette: string[],
  finalContent: string
): Promise<{ success: boolean; message: string; data?: any; debug?: any }> => {
  try {
    console.log('Starting submission to Supabase...');
    console.log('Form data being sent:', formData);
    console.log('Final content to be sent:', finalContent ? finalContent.substring(0, 100) + '...' : 'No content');
    
    // Upload logo if it exists
    let logoUrl = null;
    if (files.logo && files.logo.length > 0) {
      console.log('Sending logo...', files.logo[0].name);
      try {
        logoUrl = await uploadFile(files.logo[0], 'logos', '');
        if (!logoUrl) {
          console.warn('Failed to send logo');
          toast.warning("Could not upload logo, but the form will be sent without it.");
        } else {
          console.log('Logo sent successfully:', logoUrl);
        }
      } catch (logoError) {
        console.error('Error uploading logo:', logoError);
        toast.warning("Could not upload logo due to an error, but the form will be sent without it.");
      }
    }
    
    // Upload photos if they exist
    const photoUrls: string[] = [];
    if (files.photos && files.photos.length > 0) {
      console.log(`Sending ${files.photos.length} photos...`);
      
      for (const photo of files.photos) {
        try {
          console.log('Sending photo:', photo.name);
          const photoUrl = await uploadFile(photo, 'photos', '');
          if (photoUrl) {
            photoUrls.push(photoUrl);
            console.log('Photo sent successfully:', photoUrl);
          } else {
            console.warn('Failed to send photo:', photo.name);
          }
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
        }
      }
    }
    
    // Ensure content is not empty
    const contentToSubmit = finalContent || `Conteúdo para ${formData.business}`;
    
    // Prepare data for insertion
    const submission = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      business: formData.business,
      business_details: formData.businessDetails,
      color_palette: colorPalette,
      content: contentToSubmit, // Ensuring content is included and not empty
      logo_url: logoUrl,
      photo_urls: photoUrls.length > 0 ? photoUrls : null,
      selected_plan: formData.selectedPlan,
      plan_variant: formData.selectedPlan, // Explicitly save the plan variant
      payment_status: "pending" // Add payment status
    };
    
    console.log('Submission prepared for sending to Supabase:', submission);
    
    // Show toast to indicate saving
    toast.loading('Salvando os dados do formulário...');
    
    // Save form submission
    const result = await saveFormSubmission(submission);
    
    // Clear loading toast
    toast.dismiss();
    
    if (!result.success) {
      console.error('Error inserting data into Supabase:', result.message);
      toast.error(`Error sending form: ${result.message}`);
      return { 
        success: false, 
        message: result.message,
        debug: result
      };
    }
    
    console.log('Data sent successfully to Supabase!', result.data);
    toast.success('Dados salvos com sucesso!');
    
    // Verify form ID immediately
    if (result.data && result.data.id) {
      const formId = result.data.id;
      console.log('Form ID from submission:', formId);
      
      // Save to localStorage immediately
      localStorage.setItem('form_id', formId);
      
      // Double check that form exists in the database
      const { data: checkData, error: checkError } = await supabase
        .from('form_submissions')
        .select('id')
        .eq('id', formId)
        .single();
        
      if (checkError) {
        console.warn('Warning: Form verification failed:', checkError);
      } else {
        console.log('Form verified in database:', checkData);
      }
    }
    
    return {
      success: true,
      message: "Data sent successfully!",
      data: result.data
    };
  } catch (error) {
    console.error('General error sending to Supabase:', error);
    const errorMessage = "Error processing the form submission.";
    
    toast.error(errorMessage);
    return { 
      success: false, 
      message: errorMessage,
      debug: error instanceof Error ? error.message : String(error)
    };
  }
};

// Add missing supabase import to fix the formId verification
import { supabase } from '@/lib/supabase/client';
