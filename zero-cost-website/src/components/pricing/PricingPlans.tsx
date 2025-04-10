
import React, { useState, useEffect } from "react";
import PlanCard from "./PlanCard";
import { useIsMobile } from "../../hooks/use-mobile";
import { useFormContext } from "@/components/contact/FloatingContactForm";
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";

interface PricingPlansProps {
  pricingConfig?: PricingConfiguration;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ 
  pricingConfig = {
    monthly: 89.9,
    annual: 599.0,
    monthlyInAnnual: 49.9,
    currency: 'BRL',
    currencySymbol: 'R$',
    discount: 44,
    marketPrice: 530.65,
    savings: 480.75,
    savingsPercentage: 91
  }
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("annual");
  const isMobile = useIsMobile();
  const { setIsFormOpen } = useFormContext();
  const { translate, language } = useLanguage();

  useEffect(() => {
    // Intersection Observer to pause/resume animations when not visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target.classList.contains('annual-plan-card')) {
          const blobs = entry.target.querySelectorAll('.premium-blob');
          blobs.forEach(blob => {
            if (entry.isIntersecting) {
              (blob as HTMLElement).style.animationPlayState = 'running';
            } else {
              (blob as HTMLElement).style.animationPlayState = 'paused';
            }
          });
        }
      });
    }, { threshold: 0.2 });

    const elements = document.querySelectorAll('.annual-plan-card');
    elements.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  // Format price with two decimal places
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  // Create feature maps that will ensure proper translations
  const getFeatures = (planType: 'monthly' | 'annual') => {
    const basicFeatures = [
      translate('feature.customSite'),
      translate('feature.sslCertificate'),
      translate('feature.visualIdentity'),
      translate('feature.unlimitedAccess'),
      translate('feature.copywriting'),
      translate('feature.fastLoading'),
      translate('feature.responsive'),
      translate('feature.whatsappButton'),
      translate('feature.server')
    ];

    if (planType === 'monthly') {
      return [
        language === 'en' ? 'Basic domain (yourbusiness.orygensites.com)' : 'Domínio básico (suaempresa.orygensites.com)',
        translate('feature.oneChange'),
        translate('feature.basicSupport'),
        ...basicFeatures
      ];
    } else {
      return [
        translate('feature.freeCustomDomain'),
        translate('feature.threeChanges'),
        translate('feature.vipSupport'),
        ...basicFeatures
      ];
    }
  };
  
  const plans = [
    {
      id: "monthly",
      name: translate('plan.monthly.name'),
      price: `${pricingConfig.currencySymbol}${formatPrice(pricingConfig.monthly)}`,
      period: translate('month'),
      features: getFeatures('monthly'),
      popular: false,
      background: "bg-white",
      textColor: "text-gray-800",
      buttonClass: "border-2 border-green-600 text-green-600 hover:bg-green-50 shadow hover:shadow-lg font-bold",
      iconColor: "text-green-500",
      bottomMessage: translate('plan.monthly.bottomMessage')
    },
    {
      id: "annual",
      name: translate('plan.annual.name'),
      price: `${pricingConfig.currencySymbol}${formatPrice(pricingConfig.monthlyInAnnual)}`,
      oldPrice: pricingConfig.discount > 0 ? `${pricingConfig.currencySymbol}${formatPrice(pricingConfig.monthly)}` : undefined,
      discount: pricingConfig.discount > 0 ? `${pricingConfig.discount}% ${translate('off')}` : undefined,
      period: translate('month'),
      features: getFeatures('annual'),
      popular: true,
      background: "bg-[#101622]",
      textColor: "text-white",
      buttonClass: "bg-[#E7FF36] text-black hover:bg-[#d8f02a] shadow-lg hover:shadow-xl font-bold",
      iconColor: "text-[#E7FF36]",
      domainExample: language === 'en' ? "yourbusiness.com" : "suaempresa.com.br"
    },
  ];
  
  // Reorder plans for mobile so annual appears first
  const displayPlans = isMobile 
    ? [plans.find(plan => plan.id === "annual")!, plans.find(plan => plan.id === "monthly")!]
    : plans;
  
  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    // This callback will only be called when the button is clicked
    // no longer when the entire card is clicked
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-col md:flex-row items-stretch gap-6 justify-center max-w-6xl mx-auto px-1 md:px-4">
        {displayPlans.map((plan) => (
          <div className={`md:w-1/2 max-w-full md:max-w-[480px] mx-auto ${plan.id === "annual" ? "annual-plan-card" : ""}`} key={plan.id}>
            <PlanCard
              {...plan}
              isSelected={selectedPlanId === plan.id}
              onSelect={handleSelectPlan}
              pricingConfig={pricingConfig}
            />
          </div>
        ))}
      </div>

      {/* Styles for the blob animations */}
      <style>
        {`
        /* Premium blob animations */
        .premium-blob-container {
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          transform: translateZ(0);
          background: rgba(0,0,0,0.01);
        }
        
        .premium-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(12px);
          transform-origin: center center;
          mix-blend-mode: screen;
        }
        
        .blob-1 {
          width: 80px;
          height: 80px;
          animation: move1 15s infinite alternate;
          left: 30px;
          top: 20px;
        }
        
        .blob-2 {
          width: 80px;
          height: 80px;
          animation: move2 12s infinite alternate;
          left: 50px;
          top: 50px;
        }
        
        .blob-3 {
          width: 80px;
          height: 80px;
          animation: move3 14s infinite alternate;
          left: 40px;
          top: 40px;
        }
        
        .blob-4 {
          width: 70px;
          height: 70px;
          animation: move4 13s infinite alternate;
          left: 35px;
          top: 30px;
        }
        
        /* Particle animations */
        .premium-particle {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0;
        }
        
        .particle-1 {
          width: 6px;
          height: 6px;
          animation: particle1 8s infinite;
        }
        
        .particle-2 {
          width: 4px;
          height: 4px;
          animation: particle2 12s infinite;
        }
        
        .particle-3 {
          width: 5px;
          height: 5px;
          animation: particle3 10s infinite;
        }
        
        @keyframes move1 {
          0%, 100% { transform: translate(10px, 10px) scale(1.2); }
          25% { transform: translate(40px, 20px) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.5); }
          75% { transform: translate(10px, 30px) scale(0.8); }
        }
        
        @keyframes move2 {
          0%, 100% { transform: translate(30px, 30px) scale(1.1); }
          25% { transform: translate(10px, 40px) scale(1.4); }
          50% { transform: translate(40px, 10px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.3); }
        }
        
        @keyframes move3 {
          0%, 100% { transform: translate(20px, 40px) scale(1.2); }
          33% { transform: translate(40px, 30px) scale(0.8); }
          66% { transform: translate(10px, 20px) scale(1.5); }
        }
        
        @keyframes move4 {
          0%, 100% { transform: translate(30px, 20px) scale(1.3); }
          33% { transform: translate(20px, 10px) scale(0.9); }
          66% { transform: translate(40px, 40px) scale(1.1); }
        }
        
        @keyframes particle1 {
          0%, 100% { opacity: 0; transform: translate(30px, 30px) scale(0); }
          10%, 90% { opacity: 0; }
          50% { opacity: 0.8; transform: translate(70px, 50px) scale(1); }
        }
        
        @keyframes particle2 {
          0%, 100% { opacity: 0; transform: translate(60px, 60px) scale(0); }
          10%, 90% { opacity: 0; }
          50% { opacity: 0.6; transform: translate(90px, 40px) scale(1); }
        }
        
        @keyframes particle3 {
          0%, 100% { opacity: 0; transform: translate(40px, 80px) scale(0); }
          10%, 90% { opacity: 0; }
          50% { opacity: 0.7; transform: translate(20px, 30px) scale(1); }
        }
        `}
      </style>
    </div>
  );
};

export default PricingPlans;
