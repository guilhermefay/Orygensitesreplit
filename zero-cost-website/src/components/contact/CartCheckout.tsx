
import React, { useState } from "react";
import OrderSummary from "./cart/OrderSummary";
import PlanBenefits from "./cart/PlanBenefits";
import PeriodSelector from "./cart/PeriodSelector";
import PriceDisplay from "./cart/PriceDisplay";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ContactFormData, FileData } from "./types";
import DirectStripeButton from "./cart/DirectStripeButton";
import PayPalCheckout from "./PayPalCheckout";
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";

interface CartCheckoutProps {
  formData: ContactFormData;
  onPaymentSuccess: (paymentId: string) => void;
  onBack: (e: React.MouseEvent) => void;
  pricingConfig?: PricingConfiguration;
  isStripePayment?: boolean;
  useStripeRedirect?: boolean;
  formId: string;
  files: FileData;
  colorPalette: string[];
  finalContent: string;
}

const CartCheckout: React.FC<CartCheckoutProps> = ({
  formData,
  onPaymentSuccess,
  onBack,
  pricingConfig,
  isStripePayment = false,
  useStripeRedirect = true,
  formId,
  files,
  colorPalette,
  finalContent
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    formData.selectedPlan as "monthly" | "annual"
  );
  const { language } = useLanguage();

  // Default pricing config if none provided
  const effectivePricingConfig = pricingConfig || {
    monthly: 89.9,
    annual: 599.0,
    monthlyInAnnual: 49.9,
    currency: "BRL",
    currencySymbol: "R$",
    discount: 44,
    marketPrice: 530.65,
    savings: 480.75,
    savingsPercentage: 91,
  };

  // Calculate the price based on the selected plan
  const price = {
    plan: selectedPlan,
    monthly: effectivePricingConfig.monthly,
    annual: effectivePricingConfig.annual,
    monthlyInAnnual: effectivePricingConfig.monthlyInAnnual,
    totalPrice:
      selectedPlan === "monthly"
        ? effectivePricingConfig.monthly
        : effectivePricingConfig.annual,
    currency: effectivePricingConfig.currency,
  };
  
  console.log("Preço do plano:", price);
  console.log("Form ID for payment:", formId);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {language === 'en' ? 'Back' : 'Voltar'}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Order Summary & Benefits */}
        <div>
          <OrderSummary business={formData.business} />
          <div className="mt-6">
            <PlanBenefits currentPlan={selectedPlan} />
          </div>
        </div>

        {/* Right Column - Pricing & Payment */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            {language === 'en' ? 'Payment Details' : 'Detalhes do Pagamento'}
          </h3>

          {/* Period Selector */}
          <PeriodSelector
            selectedPlan={selectedPlan}
            onChange={setSelectedPlan}
            pricingConfig={effectivePricingConfig}
          />

          {/* Price Display */}
          <div className="mt-6">
            <PriceDisplay
              selectedPlan={selectedPlan}
              pricingConfig={effectivePricingConfig}
            />
          </div>

          {/* Payment Buttons */}
          <div className="mt-8 space-y-4">
            {isStripePayment ? (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium mb-4">
                  {language === 'en' ? 'Pay with Card' : 'Pagar com Cartão'}
                </h4>
                <div className="space-y-4">
                  {/* Redirecionar diretamente para a página de checkout do Stripe */}
                  <button
                    onClick={() => {
                      // Calcular o valor em centavos
                      const amountInCents = Math.round(price.totalPrice * 100);
                      
                      // Criar a URL com query parameters
                      const redirectUrl = `/api/checkout-redirect?amount=${amountInCents}&currency=brl&plan=${selectedPlan}&formId=${formId || 'unknown'}`;
                      
                      // Redirecionar para o servidor que criará a sessão de checkout
                      window.location.href = redirectUrl;
                    }}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all"
                  >
                    {language === 'en' ? 'Pay with Credit Card' : 'Pagar com Cartão de Crédito'}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <img src="/stripe-logo.svg" alt="Stripe" className="h-5" onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }} />
                    <div className="text-xs text-gray-500 text-center">
                      {language === 'en' 
                        ? 'Secure payment processed by Stripe' 
                        : 'Pagamento seguro processado pela Stripe'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {language === 'en' 
                      ? 'You will be redirected to a secure payment page' 
                      : 'Você será redirecionado para uma página de pagamento segura'}
                  </div>
                </div>
              </div>
            ) : (
              <PayPalCheckout
                selectedPlan={selectedPlan}
                onBack={onBack}
                onSuccess={onPaymentSuccess}
                formData={formData}
                files={files}
                colorPalette={colorPalette}
                finalContent={finalContent}
                pricingConfig={effectivePricingConfig}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
