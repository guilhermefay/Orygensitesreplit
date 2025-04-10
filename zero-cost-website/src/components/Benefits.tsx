
import React from "react";
import {
  Diamond,
  Monitor,
  Rocket,
  Smartphone,
  Clock,
  Zap,
  CheckCircle2,
  Globe,
  Code,
} from "lucide-react";
import ClientLogos from "./ClientLogos";
import TestimonialsCarousel from "./TestimonialsCarousel";
import { useLanguage } from "@/contexts/LanguageContext";

const Benefits = () => {
  const { translate } = useLanguage();
  
  const benefits = [
    {
      icon: <Monitor className="h-12 w-12 text-highlight" />,
      title: translate('benefit.modernDesign.title'),
      description: translate('benefit.modernDesign.description'),
    },
    {
      icon: <Smartphone className="h-12 w-12 text-highlight" />,
      title: translate('benefit.responsive.title'),
      description: translate('benefit.responsive.description'),
    },
    {
      icon: <Zap className="h-12 w-12 text-highlight" />,
      title: translate('benefit.fast.title'),
      description: translate('benefit.fast.description'),
    },
    {
      icon: <Diamond className="h-12 w-12 text-highlight" />,
      title: translate('benefit.conversion.title'),
      description: translate('benefit.conversion.description'),
    },
    {
      icon: <Rocket className="h-12 w-12 text-highlight" />,
      title: translate('benefit.seo.title'),
      description: translate('benefit.seo.description'),
    },
    {
      icon: <Clock className="h-12 w-12 text-highlight" />,
      title: translate('benefit.quick.title'),
      description: translate('benefit.quick.description'),
    },
  ];

  return (
    <section id="beneficios" className="py-20 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-2/5 h-2/5 bg-highlight/5 rounded-bl-[100px] blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-2/5 h-2/5 bg-highlight/5 rounded-tr-[100px] blur-3xl"></div>
      
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-center mb-16 reveal">
          <div className="inline-block px-4 py-1 bg-black rounded-full">
            <p className="text-highlight text-sm font-medium tracking-wider uppercase">
              {translate('benefits.tag')}
            </p>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 reveal">
          <span className="bg-highlight text-black px-2 py-1 rounded">{translate('benefits.heading').split(' ')[0]}</span> {translate('benefits.heading').split(' ').slice(1).join(' ')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] border border-gray-100"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Testimonials Section with Black Background */}
      <div className="mt-24 py-24 bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-center mb-16 reveal">
            <div className="inline-block px-4 py-1 bg-highlight/10 rounded-full">
              <p className="text-highlight text-sm font-medium tracking-wider uppercase">
                {translate('testimonials.tag')}
              </p>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white reveal">
            {translate('testimonials.heading').split(',')[0]} <span className="text-highlight">{translate('testimonials.heading').split(',')[1] || 'aprova'}</span>
          </h2>
          
          <div className="reveal">
            <TestimonialsCarousel />
          </div>
          
          {/* Client logos below testimonials - modified spacing and text */}
          <div className="mt-12 reveal">
            <p className="text-center text-gray-300 max-w-2xl mx-auto mb-6 text-lg">
              {translate('testimonials.clientsIntro')}
            </p>
            
            <ClientLogos />
            
            <div className="mt-6 text-center">
              <div className="flex justify-center gap-4 flex-wrap md:flex-nowrap">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 rounded-full text-white">
                  <CheckCircle2 className="h-5 w-5 text-highlight" />
                  <span className="font-medium">{translate('stats.sitesDeveloped')}</span>
                </div>
                
                <div className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 rounded-full text-white">
                  <Code className="h-5 w-5 text-highlight" />
                  <span className="font-medium">{translate('stats.experience')}</span>
                </div>
                
                <div className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 rounded-full text-white">
                  <Globe className="h-5 w-5 text-highlight" />
                  <span className="font-medium">{translate('stats.countries')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
