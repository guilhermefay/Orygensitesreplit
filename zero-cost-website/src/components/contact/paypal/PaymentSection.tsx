
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import OrderSummary from './OrderSummary';
import PaymentSuccess from './PaymentSuccess';
import PayPalScriptLoader from './PayPalScriptLoader';

interface PaymentSectionProps {
  selectedPlan: "monthly" | "annual";
  onBack: (e: React.MouseEvent) => void;
  displayAmount: number;
  description: string;
  displayCurrencySymbol: string;
  displayCurrency: string;
  processingAmount: number;
  processingCurrency: string;
  isPaid: boolean;
  clientId: string | null;
  sdkError: string | null;
  isClientLoading: boolean;
  setOrderLoading: (loading: boolean) => void;
  createOrder: () => Promise<string | null>;
  onApprove: (data: { orderID: string }) => Promise<any>;
  isLoading: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  selectedPlan,
  onBack,
  displayAmount,
  description,
  displayCurrencySymbol,
  displayCurrency,
  processingAmount,
  processingCurrency,
  isPaid,
  clientId,
  sdkError,
  isClientLoading,
  setOrderLoading,
  createOrder,
  onApprove,
  isLoading
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`bg-white ${isMobile ? 'p-2' : 'p-6'} rounded-xl shadow-sm w-full max-w-md mx-auto`}>
      <div className="flex justify-between items-center">
        <h2 className={`font-bold ${isMobile ? 'text-lg mb-2' : 'text-xl mb-4'}`}>Finalizar Pagamento</h2>
      </div>
      
      {isPaid ? (
        <PaymentSuccess />
      ) : (
        <>
          <OrderSummary 
            selectedPlan={selectedPlan}
            amount={displayAmount}
            description={description}
            currencySymbol={displayCurrencySymbol}
            currency={displayCurrency}
            processingAmount={processingAmount}
            processingCurrency={processingCurrency}
            showProcessingInfo={false}
          />

          <div className="mb-4">
            {sdkError ? (
              <div className="p-3 text-red-500 border border-red-200 rounded-lg">
                Erro ao conectar com PayPal: {sdkError}
              </div>
            ) : (
              <PayPalScriptLoader 
                clientId={clientId}
                sdkError={sdkError}
                createOrder={createOrder}
                onApprove={onApprove}
                isLoading={isClientLoading}
                setIsLoading={setOrderLoading}
                currency={processingCurrency}
              />
            )}
          </div>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSection;
