
import { useEffect } from "react";

export const useFormInitialization = (
  formId: string | null,
  initialPlan: string = "annual"
) => {
  // Add logging to debug formId
  useEffect(() => {
    console.log("ContactForm - current formId:", formId);
    console.log("ContactForm - stored formId:", localStorage.getItem('form_id'));
  }, [formId]);

  return {
    isStripePayment: true // Always use Stripe for payments
  };
};
