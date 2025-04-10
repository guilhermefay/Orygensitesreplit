
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const PricingHeader: React.FC = () => {
  const { translate } = useLanguage();
  
  return (
    <>
      <div className="flex justify-center mb-6 reveal">
        <div className="inline-block px-4 py-1 bg-black rounded-full">
          <p className="text-highlight text-sm font-medium tracking-wider uppercase">
            {translate('pricing.tag')}
          </p>
        </div>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 reveal">
        {translate('pricing.heading')} <span className="bg-highlight text-black px-2 py-1 rounded">{translate('pricing.highlight')}</span>
      </h2>
      
      <p className="text-center text-gray-700 max-w-3xl mx-auto mb-24 text-lg reveal">
        {translate('pricing.description')}
      </p>
    </>
  );
};

export default PricingHeader;
