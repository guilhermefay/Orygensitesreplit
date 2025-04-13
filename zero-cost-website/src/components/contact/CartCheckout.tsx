
import React, { useState, Suspense, lazy } from "react";
import OrderSummary from "./cart/OrderSummary";
import PlanBenefits from "./cart/PlanBenefits";
import PeriodSelector from "./cart/PeriodSelector";
import PriceDisplay from "./cart/PriceDisplay";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ContactFormData, FileData } from "./types";
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";

// Lazy load apenas o StripePaymentElement
const StripePaymentElement = lazy(() => import('./cart/StripePaymentElement'));

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
  useStripeRedirect = false,
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

          {/* Payment Section - Simplificado, apenas Stripe */}
          <div className="mt-8 space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium mb-4">
                {language === 'en' ? 'Pay with Card' : 'Pagar com Cartão'}
              </h4>
              
              {/* Stripe Payment Element com carregamento lazy */}
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-sm text-gray-600">
                    {language === 'en' ? 'Loading payment form...' : 'Carregando formulário de pagamento...'}
                  </p>
                </div>
              }>
                <StripePaymentElement 
                  amount={price.totalPrice}
                  currency={effectivePricingConfig.currency.toLowerCase()}
                  formData={formData}
                  onSuccess={onPaymentSuccess}
                  formId={formId || ''}
                  files={files}
                  colorPalette={colorPalette}
                  finalContent={finalContent}
                  plan={selectedPlan}
                />
              </Suspense>

              {/* Botão para teste com 1 real */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    try {
                      console.log("MODO TESTE: Iniciando pagamento de teste de R$ 1,00...");
                      console.log("Form ID para teste:", formId);
                      
                      // Configurar identificador único para o formulário se não existir
                      const effectiveFormId = formId || `test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                      
                      console.log("ID efetivo para teste:", effectiveFormId);
                      
                      // Create a test payment intent
                      const createResponse = await fetch('/api/create-payment-intent', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          plan: 'test', // Use the test plan which is R$ 1,00
                          formData: formData,
                          formId: effectiveFormId // Importante: passar o formId explicitamente
                        }),
                      });
                      
                      if (!createResponse.ok) {
                        throw new Error("Falha ao criar pagamento de teste");
                      }
                      
                      const data = await createResponse.json();
                      console.log("Resposta do pagamento de teste:", data);
                      
                      // Redirect to success page directly for testing
                      onPaymentSuccess(data.formId || effectiveFormId);
                      
                      console.log("Pagamento de teste processado com sucesso");
                    } catch (error) {
                      console.error("Erro ao processar pagamento de teste:", error);
                      alert("Ocorreu um erro ao processar o pagamento de teste. Por favor, tente novamente.");
                    }
                  }}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-all flex items-center justify-center"
                >
                  Testar com R$ 1,00
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
