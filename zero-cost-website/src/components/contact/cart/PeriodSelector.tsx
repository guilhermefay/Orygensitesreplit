
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { PricingConfiguration } from '@/lib/config/pricing';
import { useLanguage } from '@/contexts/LanguageContext';

interface PeriodSelectorProps {
  selectedPlan: "monthly" | "annual";
  onChange: React.Dispatch<React.SetStateAction<"monthly" | "annual">>;
  pricingConfig: PricingConfiguration;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPlan,
  onChange,
  pricingConfig
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectPlan = (plan: "monthly" | "annual") => {
    onChange(plan);
    setIsOpen(false);
  };
  
  return (
    <div className="relative mb-4">
      <div 
        className="border rounded-md p-3 flex justify-between items-center cursor-pointer"
        onClick={toggleDropdown}
      >
        <span>
          {selectedPlan === 'monthly' 
            ? (language === 'en' ? 'Monthly Plan' : 'Plano Mensal') 
            : (language === 'en' ? 'Annual Plan' : 'Plano Anual')}
        </span>
        <ChevronDown size={18} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
          <div
            className={`p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${selectedPlan === 'monthly' ? 'bg-blue-50' : ''}`}
            onClick={() => selectPlan('monthly')}
          >
            <div>
              <div className="font-medium">
                {language === 'en' ? 'Monthly Plan' : 'Plano Mensal'}
              </div>
              <div className="text-sm text-gray-500">
                {pricingConfig.currencySymbol}{pricingConfig.monthly.toFixed(2)}/{language === 'en' ? 'month' : 'mês'}
              </div>
            </div>
            {selectedPlan === 'monthly' && <Check size={18} className="text-blue-500" />}
          </div>
          <div
            className={`p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${selectedPlan === 'annual' ? 'bg-blue-50' : ''}`}
            onClick={() => selectPlan('annual')}
          >
            <div>
              <div className="font-medium">
                {language === 'en' ? 'Annual Plan' : 'Plano Anual'}
              </div>
              <div className="text-sm text-gray-500">
                {pricingConfig.currencySymbol}{pricingConfig.monthlyInAnnual.toFixed(2)}/{language === 'en' ? 'month' : 'mês'}
              </div>
              <div className="text-xs text-green-600">
                {language === 'en' ? 'Save' : 'Economize'} {pricingConfig.discount}%
              </div>
            </div>
            {selectedPlan === 'annual' && <Check size={18} className="text-blue-500" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
