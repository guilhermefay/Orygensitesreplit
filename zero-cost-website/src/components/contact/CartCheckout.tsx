import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ContactFormData } from "./types";
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Chave pública do Stripe (deve vir das variáveis de ambiente)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CartCheckoutProps {
  formData: ContactFormData;
  onBack: (e: React.MouseEvent) => void;
  pricingConfig?: PricingConfiguration;
  currentFormId: string | null;
}

const CartCheckout: React.FC<CartCheckoutProps> = ({
  formData,
  onBack,
  pricingConfig,
  currentFormId
}) => {
  const selectedPlan = formData.selectedPlan as "monthly" | "annual" | "promotion" | "promotion_usd" | "test";
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  console.log("[CartCheckout] Recebeu currentFormId:", currentFormId);

  // Carrega a instância do Stripe
  useEffect(() => {
    stripePromise.then(stripeInstance => {
      if (stripeInstance) {
        setStripe(stripeInstance);
        console.log('[CartCheckout] Instância do Stripe carregada.');
      } else {
        console.error('[CartCheckout] Falha ao carregar instância do Stripe.');
        toast.error(language === 'en' ? 'Failed to load payment system. Please try again.' : 'Falha ao carregar sistema de pagamento. Tente novamente.');
      }
    });
  }, [language]);

  // --- REMOVER LÓGICA DE PREÇO SE NÃO FOR EXIBIR ---
  // (Mantido por enquanto caso queira exibir o valor no botão ou em outro lugar)
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
  const price = {
    plan: selectedPlan,
    totalPrice:
      selectedPlan === "monthly"
        ? effectivePricingConfig.monthly * 100 // Enviar em centavos para API se necessário
        : effectivePricingConfig.annual * 100, // Enviar em centavos
    currency: effectivePricingConfig.currency,
  };
   // --- FIM LÓGICA DE PREÇO ---

  console.log("CartCheckout (Checkout Mode) - Renderizando");
  console.log("CartCheckout (Checkout Mode) - Form ID:", currentFormId);
  console.log("CartCheckout (Checkout Mode) - Plano Selecionado:", selectedPlan);

  // --- ADICIONAR handleCheckout ---
  const handleCheckout = async () => {
    if (!stripe) {
      console.error('[handleCheckout] Stripe não carregado.');
      toast.error(language === 'en' ? 'Payment system not ready. Please wait.' : 'Sistema de pagamento não está pronto. Aguarde.');
      return;
    }
    if (!currentFormId) {
      console.error('[handleCheckout] currentFormId é nulo.');
      toast.error(language === 'en' ? 'Form session error. Please go back and try again.' : 'Erro na sessão do formulário. Volte e tente novamente.');
      return;
    }

    setIsLoading(true);
    
    // --- Determinar o contexto --- 
    let contextToSend: 'default' | 'variant2' | 'lp' = 'default';
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    if (currentPath === '/lp') {
        contextToSend = 'lp';
    } else if (searchParams.get('variant') === 'variant2') {
        contextToSend = 'variant2';
    } // else: continua 'default'

    console.log('[handleCheckout] Contexto determinado:', contextToSend);
    console.log('[handleCheckout] Iniciando checkout para:', { plan: selectedPlan, formId: currentFormId, context: contextToSend });

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          formId: currentFormId,
          context: contextToSend,
          // amount: price.totalPrice,
          // currency: price.currency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[handleCheckout] Erro da API:', errorData);
        throw new Error(errorData.error?.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      if (!sessionId) {
         throw new Error('Session ID not received from API');
      }

      console.log('[handleCheckout] Session ID recebido:', sessionId);
      console.log('[handleCheckout] Redirecionando para Stripe...');

      // Redirecionar para o checkout da Stripe
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('[handleCheckout] Erro ao redirecionar para Stripe:', error);
        toast.error(error.message || (language === 'en' ? 'Failed to redirect to payment.' : 'Falha ao redirecionar para pagamento.'));
      }
      // Se o redirecionamento for bem-sucedido, o usuário não verá o código abaixo.
      // Se falhar, o erro será mostrado e o loading resetado.

    } catch (error) {
      console.error('[handleCheckout] Erro ao criar sessão de checkout:', error);
      toast.error(error instanceof Error ? error.message : (language === 'en' ? 'An unexpected error occurred.' : 'Ocorreu um erro inesperado.'));
    } finally {
      setIsLoading(false); // Reseta o loading em caso de erro antes do redirect
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6 hover:bg-gray-100"
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {language === 'en' ? 'Back' : 'Voltar'}
      </Button>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-4 text-center">
            {language === 'en' ? 'Proceed to Payment' : 'Prosseguir para Pagamento'}
        </h3>

        <div className="text-center mb-6">
          <p className="text-gray-600">
            {language === 'en' ? 'Plan' : 'Plano'}:{' '}
            <span className="font-medium">
              {selectedPlan === 'annual' ? (language === 'en' ? 'Annual' : 'Anual') : (language === 'en' ? 'Monthly' : 'Mensal')}
            </span>
          </p>
           <p className="text-lg font-semibold mt-1">
             {effectivePricingConfig.currencySymbol}
             {selectedPlan === 'annual'
               ? effectivePricingConfig.annual.toFixed(2).replace('.', ',')
               : effectivePricingConfig.monthly.toFixed(2).replace('.', ',')}
             {selectedPlan === 'annual' ? '' : (language === 'en' ? '/month' : '/mês')}
           </p>
           {selectedPlan === 'annual' && (
              <p className="text-sm text-gray-500">
                ({effectivePricingConfig.currencySymbol}{effectivePricingConfig.monthlyInAnnual.toFixed(2).replace('.', ',')}/{language === 'en' ? 'month' : 'mês'})
              </p>
           )}
        </div>

        {/* Botão de Checkout */}
        <Button
            onClick={handleCheckout}
            disabled={isLoading || !stripe}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading
              ? (language === 'en' ? 'Redirecting...' : 'Redirecionando...')
              : (language === 'en' ? 'Pay Securely with Stripe' : 'Pagar com Segurança via Stripe')}
         </Button>
         <p className="text-xs text-gray-500 mt-2 text-center">
            {language === 'en' ? 'You will be redirected to Stripe\'s secure platform.' : 'Você será redirecionado para a plataforma segura da Stripe.'}
         </p>
      </div>
    </div>
  );
};

export default CartCheckout;
