
import { supabase } from './client';

// Function to verify and create storage buckets if needed
export const ensureStorageBuckets = async (): Promise<boolean> => {
  try {
    // Check and create 'logos' bucket if it doesn't exist
    const { data: logosExists, error: logosError } = await supabase
      .storage
      .getBucket('logos');
      
    if (!logosExists && !logosError) {
      const { error } = await supabase.storage.createBucket('logos', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
      
      if (error) {
        console.error('Error creating logos bucket:', error);
        return false;
      }
    }
    
    // Check and create 'photos' bucket if it doesn't exist
    const { data: photosExists, error: photosError } = await supabase
      .storage
      .getBucket('photos');
      
    if (!photosExists && !photosError) {
      const { error } = await supabase.storage.createBucket('photos', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
      
      if (error) {
        console.error('Error creating photos bucket:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/creating buckets:', error);
    return false;
  }
};

// Function to upload a file to Supabase storage
export const uploadFile = async (file: File, bucket: string, path: string = ''): Promise<string | null> => {
  try {
    console.log(`Attempting to upload file to bucket: ${bucket}, path: ${path}`);
    
    // Check file size
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      throw new Error(`File is too large. Maximum size: 5MB. Current size: ${Math.round(file.size/1024/1024)}MB`);
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    
    // Verify/create storage buckets if needed
    await ensureStorageBuckets();
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type // Add content type for proper handling
      });

    if (error) {
      console.error('Storage upload error details:', error);
      throw error;
    }
    
    console.log('File uploaded successfully:', data?.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return null;
  }
};
