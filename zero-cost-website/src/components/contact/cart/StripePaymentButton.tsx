
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface StripePaymentButtonProps {
  amount: number;
  plan: string;
  currency?: string;
  formId: string;
  onSuccess: (paymentId: string) => void;
  className?: string;
}

const StripePaymentButton: React.FC<StripePaymentButtonProps> = ({
  plan,
  currency = 'USD',
  formId,
  onSuccess,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const [formExists, setFormExists] = useState(false);
  
  // Check if the form exists in Supabase when component mounts
  useEffect(() => {
    const checkFormExists = async () => {
      if (!formId || formId === '' || formId === 'e' || formId.length < 10) {
        console.error('Invalid form ID:', formId);
        return;
      }
      
      try {
        console.log('Checking if form exists in Supabase with ID:', formId);
        const { data, error } = await supabase
          .from('form_submissions')
          .select('id')
          .eq('id', formId)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking form existence:', error);
        } else if (data) {
          console.log('Form exists in database:', data);
          setFormExists(true);
        } else {
          console.error('Form not found in database with ID:', formId);
          // Try to get form_id from local storage as a fallback
          const storedFormId = localStorage.getItem('form_id');
          if (storedFormId && storedFormId !== formId) {
            console.log('Trying with stored form ID instead:', storedFormId);
            const { data: storedData } = await supabase
              .from('form_submissions')
              .select('id')
              .eq('id', storedFormId)
              .maybeSingle();
              
            if (storedData) {
              console.log('Form found with stored ID:', storedData);
              setFormExists(true);
            }
          }
        }
      } catch (err) {
        console.error('Error checking form:', err);
      }
    };
    
    if (formId) {
      checkFormExists();
    }
  }, [formId]);
  
  // Fixed Stripe checkout URLs based on the plan and domain
  const stripeLinks = {
    // Main domain links (orygensites.com)
    main: {
      annual: 'https://buy.stripe.com/5kA6qR8pj55dgq46oo',
      monthly: 'https://buy.stripe.com/4gw4iJ7lf55d4HmfYZ'
    },
    // Variant domain links (www.orygensites.com/?variant=variant2)
    variant: {
      annual: 'https://buy.stripe.com/cN24iJ6hbeFNc9OdQS',
      monthly: 'https://buy.stripe.com/00geXn6hb0OX6PudQT'
    }
  };

  // Check if on variant domain by looking for "variant" in URL
  const isVariantDomain = window.location.href.includes('variant');
  
  // Get the correct URL based on the domain and plan
  const getLinkForPlan = () => {
    const domainLinks = isVariantDomain ? stripeLinks.variant : stripeLinks.main;
    return plan === 'annual' ? domainLinks.annual : domainLinks.monthly;
  };
  
  const checkoutUrl = getLinkForPlan();
  
  console.log("Selected plan:", plan);
  console.log("Using domain:", isVariantDomain ? "variant" : "main");
  console.log("Checkout URL:", checkoutUrl);
  console.log("Form ID for payment:", formId);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // Show loading toast
      toast.loading(language === 'en' ? "Preparing payment..." : "Preparando pagamento...");
      
      // Log for debugging
      console.log('Starting payment process for plan:', plan);
      console.log('Form ID:', formId);
      console.log('Will redirect to:', checkoutUrl);
      
      // Get the form ID from localStorage or create a temporary one
      let effectiveFormId = formId || localStorage.getItem('form_id');
      
      // If there's still no valid formId, create a temporary one
      if (!effectiveFormId || effectiveFormId === '' || effectiveFormId === 'e' || effectiveFormId.length < 10) {
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('form_id', tempId);
        effectiveFormId = tempId;
        console.log('Created new temporary form ID for payment:', tempId);
      }
      
      try {
        // Try to update form in Supabase if it exists
        const { error } = await supabase
          .from('form_submissions')
          .update({ 
            payment_status: 'pending',
            selected_plan: plan,
            plan_variant: plan
          })
          .eq('id', effectiveFormId);
        
        if (error) {
          console.log('Form not found in database or could not be updated:', error);
          // Continue with payment even if update fails
        } else {
          console.log('Form status updated successfully');
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue with payment even if database access fails
      }
      
      // Dismiss loading toast and show success
      toast.dismiss();
      toast.success(language === 'en' ? "Redirecting to payment..." : "Redirecionando para o pagamento...");
      
      // Generate a unique payment ID for tracking
      const paymentId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store this in localStorage to retrieve after redirect
      localStorage.setItem('current_payment_id', paymentId);
      localStorage.setItem('form_id', effectiveFormId);
      
      // Call the success handler with the payment ID
      onSuccess(paymentId);

      // Redirect immediately to Stripe checkout
      console.log('Now redirecting to Stripe checkout URL...');
      window.location.href = checkoutUrl;
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(language === 'en' ? 'Error processing payment. Please try again.' : 'Erro ao processar pagamento. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  // Criar um ID temporário se não existir
  useEffect(() => {
    if (!formId && !localStorage.getItem('form_id')) {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('form_id', tempId);
      console.log('Created temporary form ID:', tempId);
    }
  }, [formId]);

  return (
    <div className="w-full">
      <Button 
        onClick={handlePayment}
        disabled={isLoading}
        className={`relative w-full ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'en' ? 'Processing...' : 'Processando...'}
          </>
        ) : (
          <>{language === 'en' ? 'Pay with Stripe' : 'Pagar com Stripe'}</>
        )}
      </Button>
    </div>
  );
};

export default StripePaymentButton;
