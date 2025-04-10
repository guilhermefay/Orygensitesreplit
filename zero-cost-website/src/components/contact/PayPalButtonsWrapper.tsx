
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
  console.log("PayPalButtonsWrapper renderizado");
  
  return (
    <PayPalButtons
      style={{ 
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "pay"
      }}
      createOrder={(data, actions) => {
        console.log("PayPalButtons createOrder chamado");
        return createOrder()
          .then(orderId => {
            if (!orderId) {
              throw new Error("Falha ao criar pedido");
            }
            console.log("Order ID obtido:", orderId);
            return orderId;
          })
          .catch(err => {
            console.error("Erro ao criar pedido:", err);
            toast.error("Erro ao criar pedido no PayPal");
            throw err;
          });
      }}
      onApprove={(data, actions) => {
        console.log("PayPalButtons onApprove chamado:", data);
        return onApprove(data)
          .then(() => {
            console.log("Pagamento aprovado com sucesso");
          })
          .catch(err => {
            console.error("Erro ao aprovar pagamento:", err);
            toast.error("Erro ao processar pagamento");
            throw err;
          });
      }}
      onError={(err) => {
        console.error("PayPal error:", err);
        toast.error("Erro no processamento do PayPal. Tente novamente.");
      }}
      onCancel={() => {
        console.log("Pagamento cancelado pelo usuário");
        toast.info("Pagamento cancelado");
      }}
    />
  );
};

export default PayPalButtonsWrapper;
