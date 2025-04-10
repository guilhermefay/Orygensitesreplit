
import { useEffect, useState } from 'react';
import { PricingConfiguration } from '@/lib/config/pricing';

// Exchange rate constant - can be updated periodically
// 1 USD = 5.45 BRL
const EXCHANGE_RATE = 5.45;

interface UseCurrencyHandlingProps {
  selectedPlan: "monthly" | "annual";
  pricingConfig: PricingConfiguration;
}

export const useCurrencyHandling = ({ 
  selectedPlan, 
  pricingConfig 
}: UseCurrencyHandlingProps) => {
  // Get URL variant parameter if it exists
  const urlVariant = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('variant') 
    : null;
  
  // Interface currency (that user sees)
  const [displayCurrency, setDisplayCurrency] = useState(pricingConfig.currency || 'BRL');
  const [displayCurrencySymbol, setDisplayCurrencySymbol] = useState(pricingConfig.currencySymbol || 'R$');
  
  // Processing currency (that PayPal processes) - ALWAYS in BRL
  const processingCurrency = 'BRL';
  
  useEffect(() => {
    console.log("🔍 [useCurrencyHandling] URL variant parameter:", urlVariant);
    
    // If the variant is variant1, variant2 or a, use USD for display
    if (urlVariant === 'variant1' || urlVariant === 'variant2' || urlVariant === 'a') {
      setDisplayCurrency('USD');
      setDisplayCurrencySymbol('$');
      console.log(`💱 [useCurrencyHandling] Setting display currency to USD for variant: ${urlVariant}`);
    }
    
    console.log(`💱 [useCurrencyHandling] Display currency: ${displayCurrency}, Processing currency: ${processingCurrency}`);
  }, [urlVariant, displayCurrency, processingCurrency]);
  
  // Get amount based on the selected plan and pricing configuration
  const displayAmount = selectedPlan === "monthly" ? pricingConfig.monthly : pricingConfig.annual;
  
  // Converting to processing value (always in BRL)
  let processingAmount = displayAmount;
  if (displayCurrency === 'USD') {
    // Converting USD to BRL for processing
    processingAmount = displayAmount * EXCHANGE_RATE;
    console.log(`💱 [useCurrencyHandling] Converting display amount ${displayAmount} ${displayCurrency} to processing amount ${processingAmount.toFixed(2)} ${processingCurrency}`);
  }
  
  const description = selectedPlan === "monthly" 
    ? `Plano Mensal - Site + Hospedagem por 1 mês (${displayCurrencySymbol}${displayAmount})` 
    : `Plano Anual - Site + Hospedagem por 12 meses (${displayCurrencySymbol}${displayAmount})`;

  return {
    displayCurrency,
    displayCurrencySymbol,
    processingCurrency,
    displayAmount,
    processingAmount,
    description
  };
};
