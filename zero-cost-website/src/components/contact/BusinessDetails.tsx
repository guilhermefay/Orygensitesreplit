
import React from "react";
import { ContactFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

interface BusinessDetailsProps {
  formData: ContactFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ formData, handleChange }) => {
  const isMobile = useIsMobile();
  const { translate, language } = useLanguage();
  
  return (
    <div className={`${isMobile ? 'p-2 space-y-3' : 'p-5 space-y-6'}`}>
      <div className={`text-center ${isMobile ? 'mb-3' : 'mb-8'}`}>
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold ${isMobile ? 'mb-1' : 'mb-2'}`}>
          {translate('form.aboutBusiness')}
        </h2>
        {!isMobile && (
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Tell us more about your company so we can create the ideal content for your website.'
              : 'Conte-nos mais sobre sua empresa para que possamos criar o conteúdo ideal para o seu site.'}
          </p>
        )}
      </div>

      <div className={`${isMobile ? 'space-y-3' : 'space-y-6'}`}>
        <div className="space-y-2">
          <Label htmlFor="business" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
            {translate('form.businessName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="business"
            name="business"
            value={formData.business || ""}
            onChange={handleChange}
            placeholder={language === 'en' ? "Enter your company name" : "Digitar nome da sua empresa"}
            className={`w-full ${isMobile ? 'p-2' : 'p-3'}`}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDetails" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium flex items-center`}>
            {translate('form.businessDetails')} <span className="text-red-500">*</span>
            <div className="group relative ml-2">
              <AlertCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
              <div className="absolute left-0 bottom-full mb-2 hidden w-64 rounded-md bg-black p-2 text-xs text-white group-hover:block z-50">
                {translate('form.businessDetailsHelp')}
              </div>
            </div>
          </Label>
          <Textarea
            id="businessDetails"
            name="businessDetails"
            value={formData.businessDetails || ""}
            onChange={handleChange}
            placeholder={language === 'en' 
              ? "Tell us about your company, your products/services, advantages, target audience, company values, etc." 
              : "Conte-nos sobre sua empresa, seus produtos/serviços, diferenciais, público-alvo, valores da empresa, etc."}
            className={`${isMobile ? 'min-h-[150px]' : 'min-h-[200px]'} w-full ${isMobile ? 'p-2' : 'p-3'} resize-y`}
            required
          />
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-1`}>
            {translate('form.businessDetailsDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
