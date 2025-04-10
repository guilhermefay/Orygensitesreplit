
import { useEffect, useState, useRef } from "react";
import { Star, Zap, Award, Sparkles, X, ShieldCheck, FileText, Edit, Laptop, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Offer = () => {
  const [showAd, setShowAd] = useState(true);
  const [counter, setCounter] = useState(0);
  const counterRef = useRef(null);
  const { translate, language } = useLanguage();
  
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
  
  useEffect(() => {
    const priceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounterAnimation();
        }
      });
    }, {
      threshold: 0.3
    });
    if (counterRef.current) {
      priceObserver.observe(counterRef.current);
    }
    return () => priceObserver.disconnect();
  }, []);
  
  const startCounterAnimation = () => {
    const targetValue = 5000;
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    const valueIncrement = targetValue / totalFrames;
    let currentFrame = 0;
    const animate = () => {
      currentFrame++;
      const value = Math.min(Math.floor(valueIncrement * currentFrame), targetValue);
      setCounter(value);
      if (currentFrame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };
  
  const steps = [
    {
      icon: <div className="bg-highlight p-3 rounded-full shadow-[0_0_15px_rgba(231,255,54,0.3)]"><Edit className="h-6 w-6 text-black" /></div>,
      title: translate('offer.step1.title'),
      description: translate('offer.step1.description')
    }, 
    {
      icon: <div className="bg-highlight p-3 rounded-full shadow-[0_0_15px_rgba(231,255,54,0.3)]"><FileText className="h-6 w-6 text-black" /></div>,
      title: translate('offer.step2.title'),
      description: translate('offer.step2.description')
    }, 
    {
      icon: <div className="bg-highlight p-3 rounded-full shadow-[0_0_15px_rgba(231,255,54,0.3)]"><Laptop className="h-6 w-6 text-black" /></div>,
      title: translate('offer.step3.title'),
      description: translate('offer.step3.description')
    }, 
    {
      icon: <div className="bg-highlight p-3 rounded-full shadow-[0_0_15px_rgba(231,255,54,0.3)]"><CheckCircle className="h-6 w-6 text-black" /></div>,
      title: translate('offer.step4.title'),
      description: translate('offer.step4.description')
    }
  ];
  
  return <>
      <section id="oferta" className="py-20 bg-black relative">
        {showAd}
      </section>
      
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 reveal">
        <div className="container mx-auto px-6">
          {/* Decorative elements */}
          <div className="absolute left-0 top-1/4 w-32 h-32 bg-highlight rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute right-0 bottom-1/4 w-40 h-40 bg-sky-400 rounded-full blur-[120px] opacity-10"></div>
          
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm mb-6 reveal">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 pb-4">
                {translate('offer.freeVsPaid')} 
                <span className="relative inline-block">
                  <span ref={counterRef} className="bg-highlight text-black px-4 py-3 rounded-lg inline-block">
                    {language === 'en' 
                      ? `$${counter.toLocaleString('en-US')}`
                      : `R$${counter.toLocaleString('pt-BR')}`}
                  </span>
                  <svg className="absolute -bottom-3 -right-3 w-6 h-6 text-highlight" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 16L6 10H18L12 16Z" />
                  </svg>
                </span>
                <br />
                {translate('offer.weDo')} 
                <span className="italic">
                  {translate('offer.forFree')}
                </span>
              </h2>
            </div>
            
            <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-gray-700 leading-relaxed">
              <strong>{translate('offer.how')}</strong> 
              {translate('offer.technology')}
              <span className="px-2 py-1 bg-gray-100 rounded-md">
                {translate('offer.ai')}
              </span>
              {translate('offer.aiHelps')}
            </p>
          </div>
        
          <div className="text-center mb-12 reveal">
            <div className="relative inline-block">
              <h3 className="text-3xl md:text-4xl font-bold">
                {translate('offer.howItWorks')} 
                <span className="bg-highlight text-black px-2 py-1 rounded-lg">
                  {translate('offer.steps')}
                </span>
              </h3>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-highlight to-transparent"></div>
            
            {steps.map((step, index) => (
              <div key={index} className="reveal group" style={{
                animationDelay: `${index * 150}ms`
              }}>
                <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group-hover:border-highlight h-full flex flex-col">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    {step.icon}
                  </div>
                  <div className="mt-8 text-center">
                    <h4 className="text-lg font-bold mb-3 group-hover:text-gray-900">{step.title}</h4>
                    <p className="text-gray-600 group-hover:text-gray-700">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center reveal">
            <a href="#planos" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-highlight rounded-full overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <span className="relative z-10 flex items-center">
                {translate('offer.cta')}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-white/20 translate-y-32 group-hover:translate-y-0 transition-transform duration-300"></span>
            </a>
          </div>
        </div>
      </section>
    </>;
};
export default Offer;
