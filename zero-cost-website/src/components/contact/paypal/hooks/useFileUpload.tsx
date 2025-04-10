
import { useState } from 'react';
import { FileData } from '../../types';
import { uploadFile, ensureStorageBuckets } from '@/lib/supabase/storageManager';
import { toast } from 'sonner';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  // Function to upload files to Supabase
  const uploadFiles = async (files: FileData, businessName: string) => {
    try {
      setIsUploading(true);
      console.log("📊 Processing file uploads...");
      
      // Verify and create buckets if needed
      const bucketsCreated = await ensureStorageBuckets();
      if (!bucketsCreated) {
        console.error("❌ Error verifying/creating storage buckets");
        toast.error("Erro ao verificar buckets de armazenamento");
        return { logoUrl: null, photoUrls: [] };
      }
      
      // Upload files to Supabase Storage and get permanent URLs
      const uploadedPhotoUrls = [];
      const timestamp = new Date().getTime(); // To avoid name conflicts
      
      // Upload photos
      if (files.photos && files.photos.length > 0) {
        for (let i = 0; i < files.photos.length; i++) {
          const file = files.photos[i];
          const sanitizedBusinessName = businessName.replace(/\s+/g, '-').toLowerCase();
          const filePath = `${sanitizedBusinessName}-${timestamp}-${i}`;
          
          console.log(`Starting upload of photo ${i+1}/${files.photos.length}`);
          const photoUrl = await uploadFile(file, 'photos', filePath);
            
          if (photoUrl) {
            console.log(`✅ Photo ${i+1} uploaded successfully:`, photoUrl);
            uploadedPhotoUrls.push(photoUrl);
          } else {
            console.error(`❌ Error uploading photo ${i+1}`);
          }
        }
      }
      
      // Upload logo
      let uploadedLogoUrl = null;
      if (files.logo && files.logo.length > 0) {
        const logoFile = files.logo[0];
        const sanitizedBusinessName = businessName.replace(/\s+/g, '-').toLowerCase();
        const filePath = `${sanitizedBusinessName}-${timestamp}`;
        
        console.log("Starting logo upload");
        uploadedLogoUrl = await uploadFile(logoFile, 'logos', filePath);
          
        if (uploadedLogoUrl) {
          console.log("✅ Logo uploaded successfully:", uploadedLogoUrl);
        } else {
          console.error("❌ Error uploading logo");
        }
      }
      
      return { logoUrl: uploadedLogoUrl, photoUrls: uploadedPhotoUrls };
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Erro ao fazer upload dos arquivos");
      return { logoUrl: null, photoUrls: [] };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFiles, isUploading };
};
