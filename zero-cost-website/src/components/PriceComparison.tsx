
import { Info, Check, X, Shield, Sparkles, Lightbulb } from "lucide-react";
import { useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import PricingCSS from "./pricing/PricingCSS";
import { getPricingFromUrl } from "@/lib/config/getPricingFromUrl";
import { useLanguage } from "@/contexts/LanguageContext";

const PriceComparison = () => {
  // Get pricing configuration based on URL
  const pricingConfig = getPricingFromUrl();
  const { translate } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1
    });
    const elements = document.querySelectorAll(".reveal");
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  // Format price with two decimal places
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="reveal">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 inline-block relative">
              {translate('priceComparison.title')}
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {translate('priceComparison.description')}
            </p>
          </div>
          
          <div className="relative grid md:grid-cols-3 gap-6 mb-12">
            {/* Market price card */}
            <Card className="md:col-span-1 shadow-lg border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-100 text-red-600 font-semibold py-1 px-3 rounded-bl-lg text-sm">
                {translate('priceComparison.market')}
              </div>
              <CardContent className="pt-10">
                <div className="text-center mb-5">
                  <div className="text-2xl font-bold text-gray-900">
                    {pricingConfig.currencySymbol}{formatPrice(pricingConfig.marketPrice)}
                  </div>
                  <div className="text-gray-500 text-sm">{translate('priceComparison.perMonth')}</div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{translate('priceComparison.development')}</p>
                      <p className="text-sm text-red-500 font-semibold">
                        {pricingConfig.currencySymbol}416.67/{translate('month')}*
                      </p>
                      <p className="text-xs text-gray-500">
                        *{pricingConfig.currencySymbol}5,000.00 {translate('priceComparison.development')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{translate('priceComparison.domain')}</p>
                      <p className="text-sm text-red-500 font-semibold">
                        {pricingConfig.currencySymbol}7.42/{translate('month')}*
                      </p>
                      <p className="text-xs text-gray-500">
                        *{pricingConfig.currencySymbol}89.00
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{translate('priceComparison.hosting')}</p>
                      <p className="text-sm text-red-500 font-semibold">
                        {pricingConfig.currencySymbol}39.90
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{translate('priceComparison.maintenance')}</p>
                      <p className="text-sm text-red-500 font-semibold">
                        {pricingConfig.currencySymbol}150.00
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center font-bold text-xl text-red-600">
                    {translate('priceComparison.total')} 
                    {pricingConfig.currencySymbol}{formatPrice(pricingConfig.marketPrice)}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Orygen price card - MOVED to center position */}
            <Card className="md:col-span-1 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-600 text-white font-semibold py-1 px-3 rounded-bl-lg text-sm">
                Orygen
              </div>
              <CardContent className="pt-10">
                <div className="text-center mb-5">
                  <div className="text-2xl font-bold text-green-700">
                    {pricingConfig.currencySymbol}{formatPrice(pricingConfig.monthlyInAnnual)}
                  </div>
                  <div className="text-green-600 text-sm">{translate('priceComparison.perMonth')}</div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{translate('priceComparison.development')}</p>
                      <p className="text-sm text-green-700 font-semibold">{translate('priceComparison.free')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{translate('priceComparison.domain')}</p>
                      <p className="text-sm text-green-700 font-semibold">{translate('priceComparison.free')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{translate('priceComparison.hosting')}</p>
                      <p className="text-sm text-green-700 font-semibold">{translate('priceComparison.free')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{translate('priceComparison.maintenance')}</p>
                      <p className="text-sm text-green-700 font-semibold">
                        {pricingConfig.currencySymbol}{formatPrice(pricingConfig.monthlyInAnnual)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-green-200">
                  <div className="text-center font-bold text-xl text-green-700">
                    {translate('priceComparison.total')} 
                    {pricingConfig.currencySymbol}{formatPrice(pricingConfig.monthlyInAnnual)}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Central comparison card - MOVED to right position */}
            <Card className="md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl border-0 transform scale-105 z-20 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/5"></div>
              <div className="relative p-8">
                <div className="flex justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-yellow-300 animate-pulse" />
                </div>
                <h3 className="text-center text-xl font-bold mb-4">{translate('priceComparison.youSave')}</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-yellow-300">
                    {pricingConfig.savingsPercentage}%
                  </div>
                  <div className="text-white text-sm opacity-80">
                    {translate('priceComparison.marketValue')}
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="text-center py-4 px-6 bg-black/30 rounded-xl backdrop-blur-sm">
                    <div className="text-lg font-bold mb-1">
                      {pricingConfig.currencySymbol}{formatPrice(pricingConfig.savings)}
                    </div>
                    <div className="text-xs text-gray-300">
                      {translate('priceComparison.savedPerMonth')}
                    </div>
                  </div>
                </div>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-sm">
                      {translate('priceComparison.guarantee')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-start">
              <Lightbulb className="h-8 w-8 text-yellow-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {translate('priceComparison.whyAffordable')}
                </h3>
                <p className="text-gray-700">
                  {translate('priceComparison.explanation')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PricingCSS />
    </section>
  );
};

export default PriceComparison;
