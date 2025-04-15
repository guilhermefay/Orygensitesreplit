import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlanBenefitsProps {
  currentPlan: "monthly" | "annual" | "promotion" | "promotion_usd" | "test" | string;
}

const PlanBenefits: React.FC<PlanBenefitsProps> = ({ currentPlan }) => {
  const { language } = useLanguage();
  const isAnnual = currentPlan === 'annual';
  
  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm">
      <p className="font-medium text-green-800">
        {language === 'en' ? 'Great news!' : 'Ótimas notícias!'}
      </p>
      {isAnnual ? (
        <div>
          <p>
            {language === 'en' 
              ? 'You get a FREE custom domain for 1 year with this order.' 
              : 'Você ganha um domínio personalizado GRÁTIS por 1 ano com esse pedido.'}
          </p>
          <p className="mt-1">
            {language === 'en' 
              ? 'Example: ' 
              : 'Exemplo: '}<strong>yourbusiness.com</strong>
          </p>
          <p className="mt-1">
            {language === 'en' 
              ? 'Up to ' 
              : 'Direito a até '}<strong>
                {language === 'en' ? '3 changes per month' : '3 alterações por mês'}
              </strong>
          </p>
        </div>
      ) : (
        <div>
          <p>
            {language === 'en'
              ? 'Your site will have the domain yourbusiness.orygensites.com included.'
              : 'Seu site terá o domínio suaempresa.orygensites.com incluso.'}
          </p>
          <p className="mt-1">
            <strong>
              {language === 'en' ? '1 change per month' : '1 alteração por mês'}
            </strong>
          </p>
          <p className="mt-1 text-xs text-green-700">
            {language === 'en'
              ? 'You can switch to the annual plan anytime to receive all benefits.'
              : 'Você poderá mudar para o plano anual quando quiser e receber todos os benefícios dele.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlanBenefits;
