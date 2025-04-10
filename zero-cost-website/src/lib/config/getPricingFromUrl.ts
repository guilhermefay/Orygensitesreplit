
import { getPricingConfig } from './pricing';

export const getPricingFromUrl = (): ReturnType<typeof getPricingConfig> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return getPricingConfig('default');
  }
  
  // Check for URL parameters - This is the primary method we're using
  const params = new URLSearchParams(window.location.search);
  const variantParam = params.get('variant');
  
  if (variantParam) {
    // Check if it's one of the English variants
    if (variantParam === 'variant1' || variantParam === 'variant2' || variantParam === 'promotion_usd') {
      return getPricingConfig(variantParam);
    }
    return getPricingConfig(variantParam);
  }
  
  // Check path for variants (for /planos/variant1, etc.)
  if (window.location.pathname.includes('/planos/')) {
    const pathSegments = window.location.pathname.split('/');
    const pathVariant = pathSegments[pathSegments.length - 1];
    
    if (pathVariant) {
      // Check if it's one of the English variants
      if (pathVariant === 'variant1' || pathVariant === 'variant2' || pathVariant === 'promotion_usd') {
        return getPricingConfig(pathVariant);
      }
      return getPricingConfig(pathVariant);
    }
  }
  
  // Default fallback
  return getPricingConfig('default');
};
