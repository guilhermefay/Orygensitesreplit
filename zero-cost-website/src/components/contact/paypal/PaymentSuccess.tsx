
import React from 'react';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  return (
    <div className="text-center py-6">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-green-700">Pagamento Confirmado!</h3>
      <p className="mt-2 text-gray-600">
        Seu site será criado em breve. Nossa equipe entrará em contato.
      </p>
    </div>
  );
};

export default PaymentSuccess;
