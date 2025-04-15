import React, { useState } from "react";
import OrderSummary from "./cart/OrderSummary";
import PlanBenefits from "./cart/PlanBenefits";
import PeriodSelector from "./cart/PeriodSelector";
import PriceDisplay from "./cart/PriceDisplay";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ContactFormData, FileData } from "./types";
// Removed PayPalCheckout import as it's unused
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Lazy load the StripePaymentElement
// const StripePaymentElement = lazy(() => import('./cart/StripePaymentElement'));
import StripePaymentElement from './cart/StripePaymentElement';

interface CartCheckoutProps {
  formData: ContactFormData;
  onPaymentSuccess: (paymentId: string, formId: string) => void; // Expects paymentId and formId
  onBack: (e: React.MouseEvent) => void;
  pricingConfig?: PricingConfiguration;
  // isStripePayment prop is removed as we always use Stripe now
  files: FileData;
  colorPalette: string[];
  finalContent: string;
  clientSecret: string | null;
  currentFormId: string | null;
}

const CartCheckout: React.FC<CartCheckoutProps> = ({
  formData,
  onPaymentSuccess, // This prop is passed to StripePaymentElement
  onBack,
  pricingConfig,
  files,
  colorPalette,
  finalContent,
  clientSecret,
  currentFormId
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    formData.selectedPlan as "monthly" | "annual"
  );
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isTestLoading, setIsTestLoading] = useState(false);

  // >>> LOG ADICIONADO <<<
  console.log("[CartCheckout] Recebeu clientSecret:", clientSecret);
  console.log("[CartCheckout] Recebeu currentFormId:", currentFormId);

  // Default pricing config if none provided
  const effectivePricingConfig = pricingConfig || {
    monthly: 89.9,
    annual: 598.80,
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
    totalPrice:
      selectedPlan === "monthly"
        ? effectivePricingConfig.monthly
        : effectivePricingConfig.annual,
    currency: effectivePricingConfig.currency,
  };

  console.log("CartCheckout - Renderizando Etapa 4");
  console.log("CartCheckout - Form ID:", currentFormId);
  console.log("CartCheckout - Plano Selecionado:", selectedPlan);

  // Função de callback para sucesso do Stripe
  const handleStripeSuccess = (paymentId: string, formIdFromElement: string) => {
    // LOG ADICIONADO: Início do handleStripeSuccess
    console.log(`>>> CartCheckout - handleStripeSuccess INICIADO. paymentId: ${paymentId}, formId: ${formIdFromElement}`);
    if (!formIdFromElement) {
       console.error('>>> CartCheckout - handleStripeSuccess ERRO: formId recebido do elemento está vazio ou nulo!');
       toast.error('Erro ao processar ID do formulário após pagamento. Contate o suporte.');
       // Talvez tentar recuperar do localStorage como último recurso?
       const storedId = localStorage.getItem('form_id');
       if(storedId) {
           console.log('>>> CartCheckout - handleStripeSuccess: Usando formId recuperado do localStorage:', storedId);
           formIdFromElement = storedId;
       } else {
          console.error('>>> CartCheckout - handleStripeSuccess ERRO FATAL: formId não encontrado nem no elemento nem no localStorage.');
          return; // Não pode navegar sem formId
       }
    }
    
    // Persistir os IDs no localStorage para garantir que a SuccessPage possa usá-los
    localStorage.setItem('current_payment_id', paymentId);
    localStorage.setItem('form_id', formIdFromElement);
    
    // LOG ADICIONADO: Antes de chamar navigate
    console.log(`>>> CartCheckout - handleStripeSuccess: Preparando para NAVEGAR para /success?formId=${formIdFromElement}`);
    navigate(`/success?formId=${formIdFromElement}`);
    // LOG ADICIONADO: Após chamar navigate
    console.log(`>>> CartCheckout - handleStripeSuccess: NAVEGAÇÃO para /success INICIADA.`);
  };

  // Handler for the Test Button
  const handleTestPayment = async () => {
    console.log('>>> CartCheckout - handleTestPayment CLICADO');
    setIsTestLoading(true);
    toast.loading(language === 'en' ? "Processing test payment..." : "Processando pagamento de teste...");
    try {
      console.log("MODO TESTE: Iniciando pagamento de teste de R$ 1,00...");

      // Use currentFormId (from props or localStorage)
      const effectiveFormId = currentFormId;
      console.log("MODO TESTE: Usando formId:", effectiveFormId);

      if (!effectiveFormId) {
        throw new Error("Form ID não encontrado para o pagamento de teste.");
      }

      // Call API to create test payment intent
      const createResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'test',
          formData: formData,
          // We don't need to pass formId here, the backend generates it
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Falha ao criar pagamento de teste");
      }

      const data = await createResponse.json();
      console.log("Test payment intent API response:", data);

      if (!data.formId) {
        throw new Error("API não retornou formId para pagamento de teste");
      }

      // **SIMULATE SUCCESS & NAVIGATE**
      // The webhook *won't* run for this test.
      navigate(`/success?formId=${data.formId}&test=true`);

      toast.dismiss();
      console.log("Pagamento de teste simulado e redirecionado com sucesso");

    } catch (error) {
      toast.dismiss();
      console.error("Erro ao processar pagamento de teste:", error);
      toast.error(
        (error instanceof Error ? error.message : "Ocorreu um erro") ||
        (language === 'en' ? "Error processing test payment." : "Erro ao processar pagamento de teste.")
      );
    } finally {
      setIsTestLoading(false);
    }
  };

  console.log('>>> CartCheckout - RENDERIZADO com formId:', currentFormId);
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {language === 'en' ? 'Back' : 'Voltar'}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna Esquerda */}
        <div>
          <OrderSummary business={formData.business} />
          <div className="mt-6">
            <PlanBenefits currentPlan={selectedPlan} />
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            {language === 'en' ? 'Payment Details' : 'Detalhes do Pagamento'}
          </h3>

          <PeriodSelector
            selectedPlan={selectedPlan}
            onChange={setSelectedPlan}
            pricingConfig={effectivePricingConfig}
          />

          <div className="mt-6">
            <PriceDisplay
              selectedPlan={selectedPlan}
              pricingConfig={effectivePricingConfig}
            />
          </div>

          {/* --- Seção de Pagamento Stripe --- */}
          <div className="mt-8 space-y-4">
             <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium mb-4">
                  {language === 'en' ? 'Pay with Card' : 'Pagar com Cartão'}
                </h4>

                {/* Stripe Payment Element (Renderizado Diretamente) */}
                {!clientSecret ? (
                  <div className="flex flex-col items-center justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? 'Initializing payment system...' : 'Inicializando sistema de pagamento...'}
                    </p>
                  </div>
                ) : (
                  <StripePaymentElement
                    formData={formData}
                    onSuccess={handleStripeSuccess}
                    formId={currentFormId}
                    plan={selectedPlan}
                    amount={price.totalPrice}
                    currency={effectivePricingConfig.currency}
                    files={files}
                    colorPalette={colorPalette}
                    finalContent={finalContent}
                    clientSecret={clientSecret}
                  />
                )}
             </div>
             {/* --- Fim Seção de Pagamento Stripe --- */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
