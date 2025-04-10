
import React from 'react';
import { PricingConfiguration } from '@/lib/config/pricing';
import { formatPrice } from '../utils/formatPrice';
import { useLanguage } from '@/contexts/LanguageContext';

interface PriceDisplayProps {
  selectedPlan: "monthly" | "annual";
  pricingConfig: PricingConfiguration;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  selectedPlan,
  pricingConfig
}) => {
  const { language } = useLanguage();
  
  // Calculate the display price based on selected plan
  const pricePerMonth = selectedPlan === 'monthly' 
    ? pricingConfig.monthly 
    : pricingConfig.monthlyInAnnual;
  
  // Show original price only if there's a discount
  const showOriginalPrice = selectedPlan === 'annual' && pricingConfig.discount > 0;
  
  const originalPrice = pricingConfig.monthly; // Original monthly price
  
  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">
          {language === 'en' ? 'Price' : 'Preço'}:
        </span>
        <div className="text-right">
          <div className="text-xl font-bold text-purple-700">
            {formatPrice(pricePerMonth, pricingConfig.currency)}/
            {language === 'en' ? 'month' : 'mês'}
          </div>
          {showOriginalPrice && (
            <div className="line-through text-gray-500 text-sm">
              {formatPrice(originalPrice, pricingConfig.currency)}/
              {language === 'en' ? 'month' : 'mês'}
            </div>
          )}
        </div>
      </div>
      
      {selectedPlan === 'annual' && (
        <div className="text-sm text-gray-600 mt-1">
          {language === 'en' 
            ? 'Total annual price: ' 
            : 'Valor total anual: '}
          <span className="font-semibold">
            {formatPrice(pricingConfig.annual, pricingConfig.currency)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
