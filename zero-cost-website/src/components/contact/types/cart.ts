
export type PeriodOption = 1 | 12;

export interface PeriodPricing {
  months: PeriodOption;
  pricePerMonth: number;
  discount: number;
  freeDomain: boolean;
  customDomain: boolean;
  changes: number;
}

export const PERIOD_PRICING: PeriodPricing[] = [
  { months: 1, pricePerMonth: 89.90, discount: 0, freeDomain: true, customDomain: false, changes: 1 },
  { months: 12, pricePerMonth: 49.90, discount: 44, freeDomain: true, customDomain: true, changes: 3 }
];

// Re-export PricingConfiguration from the config module for convenience
export type { PricingConfiguration } from "@/lib/config/pricing";
