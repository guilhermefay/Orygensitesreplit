
import { supabase } from './client';
import { FormSubmission } from './types';

// Function to prepare data for Supabase (convert arrays to JSON strings)
const prepareDataForSupabase = (submission: FormSubmission) => {
  const prepared = { ...submission };
  
  // Convert arrays to strings for Supabase
  if (prepared.color_palette && Array.isArray(prepared.color_palette)) {
    prepared.color_palette = JSON.stringify(prepared.color_palette);
  }
  
  if (prepared.photo_urls && Array.isArray(prepared.photo_urls)) {
    prepared.photo_urls = JSON.stringify(prepared.photo_urls);
  }
  
  // Add plan variant from selectedPlan if available
  if (prepared.selected_plan && !prepared.plan_variant) {
    prepared.plan_variant = prepared.selected_plan;
  }
  
  // Ensure content is not empty
  if (!prepared.content || prepared.content.trim() === '') {
    prepared.content = `Conteúdo para ${prepared.business}`;
  }
  
  console.log('Prepared submission for Supabase:', prepared);
  return prepared;
};

// Function to save form data to Supabase
export const saveFormSubmission = async (submission: FormSubmission): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log('Preparing submission object for database:', submission);
    
    // Prepare data for Supabase
    const preparedSubmission = prepareDataForSupabase(submission);
    console.log('Prepared submission object:', preparedSubmission);
    
    // Add additional logging to track the request
    console.log('Sending request to Supabase form_submissions table...');
    console.log('Request timestamp:', new Date().toISOString());
    
    // Make sure payment_status has a default value
    if (!preparedSubmission.payment_status) {
      preparedSubmission.payment_status = 'pending';
    }
    
    // Direct insertion attempt with improved error handling
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([preparedSubmission])
      .select('*');

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      // Check if it's a permission error
      if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('violates row-level security')) {
        return {
          success: false,
          message: 'Database permission error. Please try again later.'
        };
      }
      
      // Check for network errors
      if (error.message.includes('network') || error.message.includes('connection')) {
        return {
          success: false,
          message: 'Network error. Please check your internet connection and try again.'
        };
      }
      
      return { 
        success: false, 
        message: `${error.code}: ${error.message}` 
      };
    }

    console.log('Database insert successful. Return data:', data);
    // Immediately check if the data was inserted successfully by querying it
    if (data && data.length > 0) {
      const { data: checkData, error: checkError } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('id', data[0].id)
        .single();
        
      if (checkError) {
        console.warn('Warning: Could not verify inserted data:', checkError);
      } else {
        console.log('Verified data exists in the database:', checkData);
      }
    }
    
    return {
      success: true,
      message: 'Data submitted successfully!',
      data: data && data.length > 0 ? data[0] : null
    };
  } catch (error) {
    console.error('Unexpected error submitting to Supabase:', error);
    return {
      success: false,
      message: error instanceof Error ? `Error submitting: ${error.message}` : 'Unknown error submitting data'
    };
  }
};
