
import React from 'react';
import { formatPrice } from '../utils/formatPrice';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderSummaryProps {
  business: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  business
}) => {
  const { language } = useLanguage();
  
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-md">
      <h4 className="font-bold mb-3">
        {language === 'en' ? 'Order Summary' : 'Resumo do pedido'}
      </h4>
      
      <div className="mb-2">
        <span className="font-medium">{business}</span>
        <p className="text-sm text-gray-600">
          {language === 'en' 
            ? 'Website development and hosting' 
            : 'Desenvolvimento de site e hospedagem'}
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
