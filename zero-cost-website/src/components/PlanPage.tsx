
import React from 'react';
import { getPricingConfig } from '@/lib/config/pricing';
import Index from '@/pages/Index';

interface PlanPageProps {
  variant: string;
}

const PlanPage: React.FC<PlanPageProps> = ({ variant }) => {
  const pricingConfig = getPricingConfig(variant);
  
  // We'll reuse the Index page component but with the specific pricing config
  return <Index pricingConfig={pricingConfig} />;
};

export default PlanPage;
