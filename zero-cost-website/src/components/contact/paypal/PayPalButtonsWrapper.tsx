
import React from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from 'sonner';

interface PayPalButtonsWrapperProps {
  createOrder: () => Promise<string | null>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PayPalButtonsWrapper: React.FC<PayPalButtonsWrapperProps> = ({ 
  createOrder, 
  onApprove, 
  isLoading, 
  setIsLoading 
}) => {
  return (
    <PayPalButtons
      style={{ 
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "pay"
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={(err) => {
        console.error("PayPal error:", err);
        toast.error("Erro no processamento do PayPal. Tente novamente.");
      }}
    />
  );
};

export default PayPalButtonsWrapper;
