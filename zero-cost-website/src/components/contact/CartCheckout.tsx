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
  onPaymentSuccess: (paymentId: string) => void;
  onBack: (e: React.MouseEvent) => void;
  pricingConfig?: PricingConfiguration;
  clientSecret: string | null;
  currentFormId: string | null;
}

const CartCheckout: React.FC<CartCheckoutProps> = ({
  formData,
  onPaymentSuccess,
  onBack,
  pricingConfig,
  clientSecret,
  currentFormId
}) => {
  const selectedPlan = formData.selectedPlan as "monthly" | "annual" | "promotion" | "promotion_usd" | "test";
  const { language } = useLanguage();
  const navigate = useNavigate();

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

  console.log("CartCheckout - Renderizando Etapa 2 (Pagamento)");
  console.log("CartCheckout - Form ID:", currentFormId);
  console.log("CartCheckout - Plano Selecionado:", selectedPlan);

  // Função de callback para sucesso do Stripe - NAVEGAR PARA NOVA PÁGINA
  const handleStripeSuccess = (paymentId: string, formIdFromElement: string) => {
    console.log(`>>> CartCheckout - handleStripeSuccess INICIADO. paymentId: ${paymentId}, formId: ${formIdFromElement}`);
    if (!formIdFromElement) {
       console.error('>>> CartCheckout - handleStripeSuccess ERRO: formId recebido do elemento está vazio ou nulo!');
       toast.error('Erro crítico ao processar ID do formulário pós-pagamento. Contate o suporte.');
       // Tentar recuperar do localStorage como último recurso?
       const storedId = localStorage.getItem('form_id');
       if(storedId) {
           console.log('>>> CartCheckout - handleStripeSuccess: Usando formId recuperado do localStorage:', storedId);
           formIdFromElement = storedId;
       } else {
          console.error('>>> CartCheckout - handleStripeSuccess ERRO FATAL: formId não encontrado nem no elemento nem no localStorage.');
          return; // Não pode navegar sem formId
       }
    }
    
    // NÃO persistir IDs aqui, pois a SuccessPage não será mais usada neste fluxo
    // localStorage.setItem('current_payment_id', paymentId);
    // localStorage.setItem('form_id', formIdFromElement);
    
    // NAVEGAR PARA A PÁGINA DE COLETA DE DADOS
    const targetUrl = `/coleta-dados?formId=${formIdFromElement}`;
    console.log(`>>> CartCheckout - handleStripeSuccess: Preparando para NAVEGAR para ${targetUrl}`);
    navigate(targetUrl);
    console.log(`>>> CartCheckout - handleStripeSuccess: NAVEGAÇÃO para ${targetUrl} INICIADA.`);
    
    // Chamar o callback onPaymentSuccess passado (se ainda for necessário)
    // Atualmente ele só loga no ContactForm, pode ser removido futuramente.
    if(onPaymentSuccess) {
        onPaymentSuccess(paymentId);
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
                    formId={currentFormId!}
                    plan={selectedPlan}
                    amount={price.totalPrice}
                    currency={effectivePricingConfig.currency}
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
