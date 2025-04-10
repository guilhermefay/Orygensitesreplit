
/**
 * Utility to format currency values consistently throughout the application
 */
export const formatPrice = (price: number, currency: string = 'BRL'): string => {
  // Format based on currency
  if (currency === 'USD') {
    return `$${price.toFixed(2)}`;
  }
  
  // Default to BRL
  return `R$${price.toFixed(2)}`;
};
