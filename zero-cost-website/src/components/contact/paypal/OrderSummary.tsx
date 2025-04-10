import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface OrderSummaryProps {
  selectedPlan: "monthly" | "annual";
  amount: number;
  description: string;
  currencySymbol?: string;
  currency?: string;
  processingAmount?: number;
  processingCurrency?: string;
  showProcessingInfo?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  selectedPlan, 
  amount, 
  description,
  currencySymbol = 'R$',
  currency = 'BRL',
  processingAmount,
  processingCurrency = 'BRL',
  showProcessingInfo = false
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`mb-4 p-3 bg-gray-50 rounded-lg ${isMobile ? 'text-sm' : 'text-base'}`}>
      <p className="font-medium mb-2">Resumo do pedido:</p>
      <div className="flex justify-between mb-1">
        <span>Plano {selectedPlan === "monthly" ? "Mensal" : "Anual"}</span>
        <span>{currencySymbol} {amount.toFixed(2)}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2">{description}</div>
      
      
      <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
        <span>Total:</span>
        <span>{currencySymbol} {amount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
