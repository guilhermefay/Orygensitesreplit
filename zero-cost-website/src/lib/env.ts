
/**
 * Environment variables helper
 * Provides consistent access to environment variables across the application
 */

// Static Stripe key - will be used if environment variables fail
// ALTERADO: Usando chave publicável live para corresponder ao backend
const STATIC_STRIPE_KEY = "pk_live_51OvVlQIOGRh4QR8FHEJbEj5GrL3aFRo0IMJUxu3ELQTkR2Wy6L6LHMWqTuZ6TGXg2CtOCiBVfAFD8sZ94nFVFo5Z00WbAFqepk";

// Get environment variable with fallbacks
export const getEnvVariable = (name: string): string | undefined => {
  // If this is for Stripe key, ensure we always have a value
  if (name === 'VITE_STRIPE_PUBLIC_KEY') {
    // First try to access from import.meta.env (Vite standard)
    const fromVite = import.meta.env[name];
    
    if (fromVite) {
      return fromVite;
    } else {
      // Always use static key as fallback for Stripe
      return STATIC_STRIPE_KEY;
    }
  }
  
  // For other variables, try to access from various sources
  // Try to access from import.meta.env (Vite standard)
  const fromVite = import.meta.env[name];
  
  // Try to access from window (useful for runtime-injected variables)
  const fromWindow = (window as any)[name];
  
  // Try to access from process.env (for some bundlers)
  const fromProcess = (typeof process !== 'undefined' && process.env) 
    ? process.env[name] 
    : undefined;
  
  // Return the first non-undefined value
  return fromVite || fromWindow || fromProcess;
};

// Common environment variables
export const STRIPE_PUBLIC_KEY = getEnvVariable('VITE_STRIPE_PUBLIC_KEY');

// Debug function to check environment variable availability
export const debugEnvVariables = () => {
  console.log('Environment Variables Debug:');
  console.log('VITE_STRIPE_PUBLIC_KEY:', getEnvVariable('VITE_STRIPE_PUBLIC_KEY') ? 'Available ✅' : 'Missing ❌');
  console.log('VITE_STRIPE_KEY_TYPE:', getEnvVariable('VITE_STRIPE_PUBLIC_KEY')?.startsWith('pk_live') ? 'LIVE MODE' : 'TEST MODE');
  
  // List all available Vite environment variables
  console.log('All Vite env variables:', import.meta.env);
};
