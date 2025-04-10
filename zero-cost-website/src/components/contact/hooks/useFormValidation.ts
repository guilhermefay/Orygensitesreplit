
import { ContactFormData } from "../types";
import { toast } from "sonner";

export const useFormValidation = (devMode: boolean = false) => {
  const validateStep = (step: number, formData: ContactFormData): boolean => {
    // Always validate regardless of dev mode
    
    if (step === 1) {
      // Step 1: Personal info
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error("Por favor, preencha todos os campos obrigatórios antes de continuar.");
        return false;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Por favor, insira um endereço de email válido.");
        return false;
      }
      
      // Phone validation (simple check)
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        toast.error("Por favor, insira um número de telefone válido.");
        return false;
      }
    }
    
    if (step === 2) {
      // Step 2: Business info
      if (!formData.business || !formData.businessDetails || formData.businessDetails.length < 20) {
        toast.error("Por favor, forneça informações completas sobre seu negócio antes de continuar.");
        return false;
      }
      
      if (formData.businessDetails.length < 20) {
        toast.error("Por favor, forneça mais detalhes sobre seu negócio.");
        return false;
      }
    }
    
    // Step 3 validation would be handled separately in visual identity component
    
    return true;
  };
  
  return { validateStep };
};
