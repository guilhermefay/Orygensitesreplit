
import { useState } from 'react';
import { ContactFormData, FileData } from '../types';
import { PricingConfiguration } from '@/lib/config/pricing';

// Hook to manage form data
export const useFormData = (initialPlan: string = 'annual', pricingConfig?: PricingConfiguration) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    selectedPlan: initialPlan as "annual" | "monthly",
    business: '',
    description: '',
    industry: '',
    competitors: '',
    goals: '',
    colors: '',
    style: '',
    logo: false,
    additional: '',
  });

  const [files, setFiles] = useState<FileData>({
    logo: null,
    photos: [],
  });

  const [colorPalette, setColorPalette] = useState<string[]>(['#4F46E5', '#EC4899', '#06B6D4']);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // For checkbox fields
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    
    // For all other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file uploads
  const handleFileChange = (type: 'photos' | 'logo', e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: fileList } = e.target;
    
    if (!fileList || fileList.length === 0) return;
    
    if (type === 'logo') {
      setFiles((prev) => ({
        ...prev,
        logo: Array.from(fileList),
      }));
    } else if (type === 'photos') {
      // Add new photos to existing ones (up to 5)
      const newPhotos = Array.from(fileList);
      setFiles((prev) => {
        const updatedPhotos = [...(prev.photos || []), ...newPhotos].slice(0, 5);
        return {
          ...prev,
          photos: updatedPhotos,
        };
      });
    }
  };

  // Handle color palette changes
  const handleColorChange = (index: number, color: string) => {
    setColorPalette((prev) => {
      const newPalette = [...prev];
      newPalette[index] = color;
      return newPalette;
    });
  };

  // Add a new color to the palette
  const addColor = () => {
    if (colorPalette.length < 5) {
      setColorPalette((prev) => [...prev, '#000000']);
    }
  };

  // Remove a color from the palette
  const removeColor = (index: number) => {
    if (colorPalette.length > 1) {
      setColorPalette((prev) => prev.filter((_, i) => i !== index));
      return true;
    }
    return false;
  };

  // Handle plan changes
  const handlePlanChange = (plan: "monthly" | "annual") => {
    setFormData(prev => ({
      ...prev,
      selectedPlan: plan
    }));
  };

  // Set initial plan
  const setInitialPlan = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPlan: plan as "monthly" | "annual"
    }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      selectedPlan: initialPlan as "monthly" | "annual",
      business: '',
      description: '',
      industry: '',
      competitors: '',
      goals: '',
      colors: '',
      style: '',
      logo: false,
      additional: '',
    });
    setFiles({
      logo: null,
      photos: [],
    });
    setColorPalette(['#4F46E5', '#EC4899', '#06B6D4']);
  };

  return {
    formData,
    setFormData,
    files,
    setFiles,
    colorPalette,
    setColorPalette,
    handleChange,
    handleFileChange,
    handleColorChange,
    addColor,
    removeColor,
    handlePlanChange,
    setInitialPlan,
    resetFormData
  };
};
