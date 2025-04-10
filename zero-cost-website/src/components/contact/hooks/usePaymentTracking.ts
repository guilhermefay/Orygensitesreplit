
import { useState, useEffect, useRef } from "react";

export const usePaymentTracking = () => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const paymentAlreadyProcessed = useRef(false);
  
  // Check for return from payment when component mounts
  useEffect(() => {
    const checkPaymentReturn = () => {
      const isReturnFromStripe = document.referrer.includes('stripe.com') || 
                              location.search.includes('payment=success');
                            
      if (isReturnFromStripe) {
        console.log("Detected possible return from Stripe payment");
        setPaymentCompleted(true);
      }
    };
    
    checkPaymentReturn();
  }, []);

  const handlePaymentSuccess = (paymentId: string, onSuccess?: (businessName: string) => void, businessName?: string) => {
    console.log("🎉 Payment initiated with ID:", paymentId);
    
    // Prevent multiple calls
    if (paymentAlreadyProcessed.current) {
      console.log("Payment already processed, ignoring duplicate callback");
      return;
    }
    
    paymentAlreadyProcessed.current = true;
    console.log(`Form submitted successfully for: ${businessName}`);
    
    // Call success callback if provided, but only to track the submission
    if (onSuccess && typeof onSuccess === 'function' && businessName) {
      onSuccess(businessName);
    }
  };

  // Reset payment flag for specific step
  const resetPaymentFlag = (step: number) => {
    useEffect(() => {
      if (step !== 4) {
        paymentAlreadyProcessed.current = false;
      }
    }, [step]);
  };

  return {
    paymentCompleted,
    handlePaymentSuccess,
    resetPaymentFlag
  };
};
