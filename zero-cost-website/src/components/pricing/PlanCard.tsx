import { Crown, Sparkles } from "lucide-react";
import React from "react";
import { getFeatureIcon } from "./featureIcons";
import { useFormContext } from "@/components/contact/FloatingContactForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { PricingConfiguration } from "@/lib/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from 'react-router-dom';

export interface PlanProps {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
  background: string;
  textColor: string;
  buttonClass: string;
  iconColor: string;
  oldPrice?: string;
  discount?: string;
  isSelected: boolean;
  onSelect: (planId: string) => void;
  bottomMessage?: string;
  domainExample?: string;
  pricingConfig?: PricingConfiguration;
}

const PlanCard: React.FC<PlanProps> = ({
  id,
  name,
  price,
  period,
  features,
  popular,
  background,
  textColor,
  buttonClass,
  iconColor,
  oldPrice,
  discount,
  isSelected,
  onSelect,
  domainExample,
  pricingConfig
}) => {
  // Import the form context
  const { setIsFormOpen } = useFormContext();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { translate, language } = useLanguage();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Let's create special highlights for the annual plan
  const annualBenefits = id === "annual" ? [
    translate('feature.freeCustomDomain'),
    translate('feature.vipSupport'),
    translate('feature.threeChanges')
  ] : [];
  
  // Translate features
  const translatedFeatures = features.map(feature => {
    if (feature === "Site totalmente personalizado") return translate('feature.customSite');
    if (feature === "Certificado de segurança SSL incluso") return translate('feature.sslCertificate');
    if (feature === "Sua identidade visual") return translate('feature.visualIdentity');
    if (feature === "Acessos ilimitados") return translate('feature.unlimitedAccess');
    if (feature === "Redação publicitária inclusa") return translate('feature.copywriting');
    if (feature === "Carregamento ultra rápido") return translate('feature.fastLoading');
    if (feature === "Visualizado corretamente em qualquer dispositivo") return translate('feature.responsive');
    if (feature === "Botão flutuante do WhatsApp") return translate('feature.whatsappButton');
    if (feature === "Servidor rápido, estável e seguro") return translate('feature.server');
    if (feature === "Domínio básico (suaempresa.orygensites.com)") return `${translate('feature.basicDomain')} (suaempresa.orygensites.com)`;
    if (feature === "Domínio personalizado gratuito (por 1 ano)") return translate('feature.freeCustomDomain');
    if (feature === "1 alteração por mês") return translate('feature.oneChange');
    if (feature === "Até 3 alterações por mês") return translate('feature.threeChanges');
    if (feature === "Suporte sempre que precisar") return translate('feature.basicSupport');
    if (feature === "Suporte VIP") return translate('feature.vipSupport');
    return feature;
  });
  
  // For annual plan, we don't want to duplicate features that might exist in both arrays
  // We'll filter out any annual benefits that already exist in the regular features
  const uniqueAnnualBenefits = annualBenefits.filter(
    benefit => !translatedFeatures.includes(benefit)
  );
  
  // Combine features with unique annual benefits
  const allFeatures = id === "annual" ? [...translatedFeatures, ...uniqueAnnualBenefits] : translatedFeatures;
  
  // Handle button click - open dialog and select plan
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // First select the plan
    onSelect(id);
    
    // Open the dialog
    setIsDialogOpen(true);
  };

  // Handle form success without closing the dialog
  const handleFormSuccess = (businessName: string) => {
    // Do not close the dialog here - this allows the success message to be displayed
    // in the dialog itself
    console.log("Form submitted successfully for:", businessName);
  };

  // Translate plan name and button text
  const translatedName = id === "monthly" ? translate('plan.monthly.name') : translate('plan.annual.name');
  const translatedButtonText = id === "monthly" ? translate('plan.monthly.cta') : translate('plan.annual.cta');
  const translatedValueLabel = id === "monthly" ? translate('plan.monthly.value') : translate('plan.annual.value');
  const translatedMonth = translate('month');

  // Determine price display based on route and plan ID
  let displayPrice: string;
  let displayPeriod: string = `/ ${translatedMonth}`;
  let showTestNote: boolean = false;

  if (currentPath === '/lp') {
    showTestNote = true;
    if (id === 'monthly') {
      displayPrice = "R$ 89,90";
    } else if (id === 'annual') {
      displayPrice = "R$ 49,90";
    } else {
      // Fallback for other potential plans on /lp? Use prop price.
      displayPrice = price; 
    }
  } else {
    // Not on /lp, use the price from props
    displayPrice = price;
  }

  return (
    <div className="relative">
      {id === "annual" && (
        <div className="absolute -z-10 w-full h-full bg-[#0EA5E9] rounded-lg transform rotate-3 translate-x-2 translate-y-2"></div>
      )}
      <div 
        className={`${
          id === "annual" ? "bg-gradient-to-br from-[#101622] to-[#1a2436]" : background
        } ${isMobile ? 'p-4 md:p-10' : 'p-8 md:p-10'} rounded-lg shadow-lg transform transition-all duration-300 ${
          isSelected
            ? "scale-105 border-2 border-green-500 shadow-xl"
            : id === "annual" 
              ? "border border-gray-200 hover:shadow-lg" 
              : "border border-gray-200"
        } ${
          popular 
            ? "relative md:-mt-12 z-10" 
            : ""
        } reveal flex flex-col h-full ${id === "annual" ? "min-h-[650px]" : "min-h-[600px]"}`}
      >
        {popular && (
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <div className="flex items-center space-x-1 bg-[#E7FF36] text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              <Crown size={16} />
              <span>{translate('plan.annual.badge')}</span>
              <Sparkles size={16} />
            </div>
          </div>
        )}
        
        {id === "annual" ? (
          <h3 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-extrabold mb-5 animated-gradient-text`}>{translatedName}</h3>
        ) : (
          <h3 className={`${textColor} ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-extrabold mb-5`}>{translatedName}</h3>
        )}
        
        <div className="grid grid-rows-[auto_1fr] h-full">
          {/* All features list (including special benefits for annual plan) */}
          <ul className="space-y-1.5 md:space-y-2 mb-6 md:mb-6 h-auto">
            {allFeatures.map((feature, index) => (
              <li key={index} className="flex items-start py-0.5 md:py-1">
                <span className={`${iconColor} mr-2 md:mr-3 mt-0.5 flex-shrink-0`}>
                  {getFeatureIcon(feature)}
                </span>
                <span className={`${textColor} ${id === "annual" ? "font-medium" : ""} text-xs md:text-base`}>
                  {feature.includes("Basic domain") || feature.includes("Domínio básico") ? (
                    <>
                      {language === 'en' ? 'Basic domain ' : 'Domínio básico '}
                      <strong className="text-gray-300">(suaempresa.orygensites.com)</strong>
                    </>
                  ) : feature.includes("Free custom domain") && domainExample ? (
                    <>
                      {feature}
                      <div className="mt-1 text-xs md:text-sm bg-gray-800/40 px-2 py-1 rounded inline-block">
                        {language === 'en' ? 'Example: ' : 'Exemplo: '}<strong>{domainExample}</strong>
                      </div>
                    </>
                  ) : (
                    feature.split(' ').map((word, i) => 
                      ['totalmente', 'personalizado', 'gratuito', 'ilimitados', 'VIP', 'fully', 'customized', 'free', 'unlimited', 'included'].includes(word) 
                        ? <strong key={i}>{word} </strong> 
                        : word + ' '
                    )
                  )}
                </span>
              </li>
            ))}
          </ul>
          
          {/* Price section and button combined together */}
          <div className="mt-3 self-end">
            {/* Price section */}
            {id === "annual" ? (
              <div className="flex flex-col items-start mb-5">
                {/* Render old price and discount only if NOT on /lp */} 
                {currentPath !== '/lp' && oldPrice && (
                  <div className="flex items-center">
                    <span className={`${textColor} text-lg line-through opacity-70`}>{oldPrice}</span>
                    <span className="ml-2 bg-[#E7FF36] text-black px-2 py-0.5 rounded-full text-xs font-bold">
                      {discount}
                    </span>
                  </div>
                )}
                <div className="flex flex-col my-2">
                  <span className={`${textColor} opacity-80 text-sm leading-none`}>{translatedValueLabel}</span>
                  <div className="flex items-baseline">
                    {/* Use determined displayPrice */} 
                    <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#E7FF36] to-[#B4FF85] bg-clip-text text-transparent leading-none">{displayPrice}</span>
                    <span className={`${textColor} ml-1 opacity-80`}>{displayPeriod}</span>
                  </div>
                  {/* Show test note if applicable */} 
                  {showTestNote && (
                    <span className="text-xs text-gray-400 mt-1">(Cobrança de teste: R$ 1,00)</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start mb-5">
                <span className={`${textColor} opacity-80 text-sm leading-none`}>{translatedValueLabel}</span>
                <div className="flex items-baseline my-2">
                  {/* Use determined displayPrice */} 
                  <span className={`${textColor} text-3xl md:text-4xl font-bold leading-none`}>{displayPrice}</span>
                  <span className={`${textColor} ml-1 opacity-80`}>{displayPeriod}</span>
                </div>
                {/* Show test note if applicable */} 
                {showTestNote && (
                  <span className="text-xs text-gray-400 mt-1">(Cobrança de teste: R$ 1,00)</span>
                )}
              </div>
            )}
            
            {/* Dialog for the popup form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  type="button"
                  onClick={handleButtonClick}
                  className={`block w-full py-3 md:py-4 text-center font-semibold rounded-lg transition-all duration-300 ${buttonClass} ${id === "annual" ? "pulse-button text-sm md:text-lg" : ""}`}
                >
                  {translatedButtonText}
                </button>
              </DialogTrigger>
              <DialogContent className={`${isMobile ? 'max-w-[98%] p-0' : 'max-w-4xl p-0'} max-h-[95vh] overflow-y-auto`}>
                <div className={`${isMobile ? 'p-2.5' : 'p-4'} border-b sticky top-0 bg-white z-10`}>
                  <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{translate('contact.requestSite')}</h2>
                </div>
                <div className={`${isMobile ? 'p-2' : 'p-6'}`}>
                  <ContactForm initialPlan={id as "monthly" | "annual"} onSuccess={handleFormSuccess} pricingConfig={pricingConfig} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
