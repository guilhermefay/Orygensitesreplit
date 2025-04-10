
import { useState } from 'react';
import { PeriodOption, PERIOD_PRICING } from '../types/cart';

export const useCartCheckout = (selectedPlan: string | null) => {
  // Default to the appropriate period based on selected plan
  const defaultPeriod = selectedPlan === "monthly" ? 1 : 12;
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(defaultPeriod as PeriodOption);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Find pricing info for selected period
  const periodInfo = PERIOD_PRICING.find(p => p.months === selectedPeriod) || PERIOD_PRICING[0];
  
  // Calculate prices and discounts
  const basePrice = 89.90; // Default monthly price
  const discountedPrice = periodInfo.pricePerMonth;
  const totalOriginalPrice = basePrice * periodInfo.months;
  const totalDiscountedPrice = discountedPrice * periodInfo.months;
  const totalSavings = totalOriginalPrice - totalDiscountedPrice;
  
  // Determine plan name and base price based on selected plan
  let planBaseName = "Site";
  let planBasePrice = totalDiscountedPrice;
  
  if (selectedPlan === "monthly") {
    planBaseName = "Site Plano Mensal";
    planBasePrice = 89.90 * periodInfo.months;
  } else if (selectedPlan === "annual") {
    planBaseName = "Site Plano Anual";
    planBasePrice = 49.90 * periodInfo.months;
  }

  return {
    selectedPeriod,
    setSelectedPeriod,
    isDropdownOpen,
    setIsDropdownOpen,
    periodInfo,
    basePrice,
    discountedPrice,
    totalOriginalPrice,
    totalDiscountedPrice,
    totalSavings,
    planBaseName,
    planBasePrice,
    PERIOD_PRICING
  };
};
