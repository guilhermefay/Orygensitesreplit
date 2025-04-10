
import { useEffect, useState } from "react";
import PricingHeader from "./pricing/PricingHeader";
import PricingPlans from "./pricing/PricingPlans";
import PricingCSS from "./pricing/PricingCSS";
import { useFormContext } from "./contact/FloatingContactForm";
import FloatingContactForm from "./contact/FloatingContactForm";
import { getPricingFromUrl } from "@/lib/config/getPricingFromUrl";
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";

interface PricingProps {
  pricingConfig?: PricingConfiguration;
}

const Pricing: React.FC<PricingProps> = ({ pricingConfig }) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | null>("annual");
  const { setIsFormOpen } = useFormContext();
  const { language } = useLanguage();
  
  // Use provided pricingConfig or get it from URL
  const effectivePricingConfig = pricingConfig || getPricingFromUrl();

  const handlePlanChange = (plan: "monthly" | "annual") => {
    setSelectedPlan(plan);
    // Direct connection to open form when plan changes
    setTimeout(() => {
      setIsFormOpen(true);
    }, 300); // Increased timeout for more reliability
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="planos" className="pt-16 pb-20 bg-white w-full">
      <div className="container w-full max-w-[99%] md:max-w-[90%] mx-auto px-1 md:px-6 lg:px-8">
        <PricingHeader />
        
        <div className="max-w-5xl mx-auto mt-12 mb-12">
          <PricingPlans pricingConfig={effectivePricingConfig} />
        </div>
      </div>
      
      {/* Add hidden form trigger that can be programmatically clicked */}
      <div className="hidden">
        <FloatingContactForm buttonClassName="hidden" pricingConfig={effectivePricingConfig}>
          {language === 'en' ? 'Contact' : 'Contatar'}
        </FloatingContactForm>
      </div>
      
      <PricingCSS />
    </section>
  );
};

export default Pricing;
