interface PricingConfiguration {
  monthly: number;
  annual: number;
  monthlyInAnnual: number;
  currency: string;
  currencySymbol: string;
  discount: number;
  marketPrice: number;          // New field for market price
  savings: number;              // New field for savings amount
  savingsPercentage: number;    // New field for savings percentage
}

// Export the interface so it can be imported elsewhere
export type { PricingConfiguration };

// Available pricing configurations
export const pricingConfigurations: Record<string, PricingConfiguration> = {
  default: {
    monthly: 89.9,
    annual: 598.80,    // Updated to 598.80 reais - R$49.90 * 12
    monthlyInAnnual: 49.9,  // Updated to R$49.90 per month
    currency: 'BRL',
    currencySymbol: 'R$',
    discount: 44, // Discount percentage
    marketPrice: 530.65, // Market price for comparison
    savings: 480.75,     // Monthly savings
    savingsPercentage: 91 // Savings percentage
  },
  variant1: {
    monthly: 50,
    annual: 118.80,     // Updated to 118.80 USD - $9.90 * 12
    monthlyInAnnual: 9.9,  // Updated to $9.90 per month
    currency: 'USD',
    currencySymbol: '$',
    discount: 80, // Updated discount percentage
    marketPrice: 110,   // Market price for comparison
    savings: 100.1,     // Monthly savings
    savingsPercentage: 91 // Savings percentage
  },
  variant2: {
    monthly: 50,
    annual: 238.80,     // Updated to 238.80 USD - $19.90 * 12
    monthlyInAnnual: 19.9,  // Updated to $19.90 per month
    currency: 'USD',
    currencySymbol: '$',
    discount: 60, // Updated discount percentage
    marketPrice: 180,     // Market price for comparison
    savings: 160.1,      // Monthly savings
    savingsPercentage: 89 // Savings percentage
  },
  promotion: {
    monthly: 0.50,
    annual: 1.0,     // Keeping promotion as is
    monthlyInAnnual: 0.08,  // 1/12 = approx 0.08
    currency: 'BRL',
    currencySymbol: 'R$',
    discount: 99, // 99% discount
    marketPrice: 530.65,  // Same market price for comparison
    savings: 529.65,      // Monthly savings (updated)
    savingsPercentage: 99 // 99% savings percentage
  },
  // Updated promotion_usd variant with the correct values
  promotion_usd: {
    monthly: 1.0,        // Updated to $1.0 for monthly
    annual: 1.0,         // Updated to $1.0 for annual
    monthlyInAnnual: 0.08,  // $1.0/12 = approx 0.08
    currency: 'USD',
    currencySymbol: '$',
    discount: 99, // 99% discount
    marketPrice: 100,   // Market price for comparison
    savings: 99.0,     // Monthly savings
    savingsPercentage: 99 // 99% savings percentage
  },
  // Updated variant "a" with the specified prices
  a: {
    monthly: 49.90,      // Updated to $49.90 USD for monthly plan
    annual: 238.80,      // Updated to $238.80 USD for annual plan ($19.90 * 12)
    monthlyInAnnual: 19.90,  // Updated to $19.90 USD per month (when paid annually)
    currency: 'USD',
    currencySymbol: '$',
    discount: 60,        // Updated discount percentage (from $49.90 to $19.90)
    marketPrice: 180,    // Same as variant2 for comparison
    savings: 130.1,      // Updated savings amount
    savingsPercentage: 72 // Updated savings percentage
  }
  // Can add more variations as needed
};

// Function to get pricing configuration
export const getPricingConfig = (variant: string = 'default'): PricingConfiguration => {
  return pricingConfigurations[variant] || pricingConfigurations.default;
};
