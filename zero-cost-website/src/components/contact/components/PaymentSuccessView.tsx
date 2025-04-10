
import React from "react";
import InFormSuccessMessage from "./InFormSuccessMessage";

interface PaymentSuccessViewProps {
  businessName: string;
}

const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({ businessName }) => {
  return <InFormSuccessMessage businessName={businessName} />;
};

export default PaymentSuccessView;
