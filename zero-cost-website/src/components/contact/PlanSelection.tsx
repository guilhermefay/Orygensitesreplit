
import React, { useState, useEffect } from "react";
import { 
  Check, Sparkles, Shield, Award, Zap, 
  Users, Globe, Star, Lock, Clock, Calendar,
  CheckCircle2, ThumbsUp
} from "lucide-react";

interface PlanSelectionProps {
  selectedPlan: "monthly" | "annual" | null;
  handlePlanChange: (plan: "monthly" | "annual") => void;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({ selectedPlan, handlePlanChange }) => {
  const [recentUsers] = useState(Math.floor(Math.random() * 10) + 8);
  
  useEffect(() => {
    // Intersection Observer to pause/resume animations when not visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target.classList.contains('premium-card')) {
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

    const elements = document.querySelectorAll('.annual-card, .monthly-card');
    elements.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-lg font-bold">Escolha o plano ideal para seu site</h2>
        <p className="text-sm text-gray-600">Economize até R$5.000 em desenvolvimento e até 44% na manutenção anual</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* PLANO MENSAL */}
        <div 
          className={`monthly-card relative flex flex-col border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg group min-h-[580px] ${
            selectedPlan === "monthly" 
              ? "border-green-500 bg-green-50/30 shadow-md" 
              : "border-gray-200 hover:border-green-400"
          }`}
          onClick={() => handlePlanChange("monthly")}
        >
          {/* Monthly plan sphere - static gradient */}
          <div className="monthly-sphere-container w-[120px] h-[120px] mx-auto mt-[80px] mb-6 relative overflow-hidden rounded-full">
            <div className="monthly-sphere absolute inset-0 rounded-full shadow-lg"
                 style={{
                   background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
                   boxShadow: "inset 2px 2px 10px rgba(255,255,255,0.3), inset -2px -2px 10px rgba(0,0,0,0.2)"
                 }}
            />
            <div className="sphere-highlight absolute w-[30%] h-[30%] rounded-full top-[15%] left-[15%] opacity-40"
                 style={{
                   background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%)"
                 }}
            />
          </div>
          
          <div className="mb-2">
            <div className={`w-4 h-4 rounded-full border-2 inline-flex items-center justify-center ${
              selectedPlan === "monthly" 
                ? "border-green-500 bg-green-500" 
                : "border-gray-300"
            }`}>
              {selectedPlan === "monthly" && <Check className="text-white w-2 h-2 animate-[scale-in_0.2s_ease-out]" />}
            </div>
          </div>
          
          {/* Monthly plan content */}
          <div className="flex-grow">
            <h3 className="text-sm font-bold mb-1">PLANO MENSAL</h3>
            <p className="text-[10px] text-gray-500 mb-4">Flexibilidade para você</p>
            
            <div className="space-y-1 text-xs">
              <div className="mb-5">
                <div className="text-2xl font-bold mb-1">R$89,90</div>
                <div className="text-[10px] text-gray-500">por mês</div>
              </div>
              
              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-600 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Domínio suaempresa.orygensites.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-600 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>1 alteração por mês</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-600 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Suporte sempre que precisar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="text-green-600 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Sem compromisso de longo prazo</span>
                </li>
              </ul>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => handlePlanChange("monthly")}
            className="w-full py-2 text-xs border-2 border-green-600 text-green-600 bg-transparent font-medium rounded-md transition-all hover:bg-green-50 hover:shadow-md mt-4"
          >
            Escolher plano mensal
          </button>
          <p className="text-center text-xs mt-2 text-gray-500">
            Você poderá mudar para o plano anual quando quiser
          </p>
        </div>
        
        {/* PLANO ANUAL */}
        <div 
          className={`annual-card premium-card relative flex flex-col border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl group min-h-[580px] ${
            selectedPlan === "annual" 
              ? "border-[#E7FF36] bg-[#101622] shadow-md" 
              : "border-[#E7FF36]/50 bg-[#101622] hover:border-[#E7FF36]"
          }`}
          onClick={() => handlePlanChange("annual")}
        >
          {/* Premium plan animated blob sphere */}
          <div className="premium-blob-container w-[140px] h-[140px] mx-auto mt-[80px] mb-6 relative overflow-hidden rounded-full">
            <div className="premium-blob blob-1 absolute w-[80px] h-[80px] rounded-full" 
                 style={{ 
                   background: "#E7FF36",
                   filter: "blur(12px)",
                   mixBlendMode: "screen" 
                 }}>
            </div>
            <div className="premium-blob blob-2 absolute w-[80px] h-[80px] rounded-full" 
                 style={{ 
                   background: "#FFFFFF",
                   filter: "blur(12px)",
                   mixBlendMode: "screen" 
                 }}>
            </div>
            <div className="premium-blob blob-3 absolute w-[80px] h-[80px] rounded-full" 
                 style={{ 
                   background: "#E7FF36",
                   filter: "blur(12px)",
                   mixBlendMode: "screen" 
                 }}>
            </div>
            <div className="premium-blob blob-4 absolute w-[70px] h-[70px] rounded-full" 
                 style={{ 
                   background: "#FFFFFF",
                   filter: "blur(12px)",
                   mixBlendMode: "screen" 
                 }}>
            </div>
            
            {/* Particle effects */}
            <div className="premium-particle particle-1"></div>
            <div className="premium-particle particle-2"></div>
            <div className="premium-particle particle-3"></div>
          </div>
          
          <div className="mb-2">
            <div className={`w-4 h-4 rounded-full border-2 inline-flex items-center justify-center ${
              selectedPlan === "annual" 
                ? "border-[#E7FF36] bg-[#E7FF36]" 
                : "border-[#E7FF36]/50"
            }`}>
              {selectedPlan === "annual" && <Check className="text-black w-2 h-2 animate-[scale-in_0.2s_ease-out]" />}
            </div>
          </div>
          
          {/* Annual plan content */}
          <div className="flex-grow">
            <div className="flex items-center mb-1">
              <h3 className="text-sm font-bold text-white">PLANO ANUAL</h3>
              <Sparkles className="ml-1 text-[#E7FF36] w-3 h-3" />
            </div>
            <p className="text-[10px] text-gray-400 mb-4">Mais economia</p>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="line-through text-gray-400 text-sm">R$89,90</span>
                <span className="bg-[#E7FF36] text-black px-2 py-0.5 rounded-full text-[10px] font-bold">
                  ECONOMIZE 44%
                </span>
              </div>
              
              <div className="bg-gradient-to-r from-[#E7FF36]/20 to-[#E7FF36]/10 p-3 rounded-md mb-2">
                <div className="text-white">
                  <div className="text-3xl font-bold">R$49,90</div>
                  <div className="text-[10px] opacity-90">/mês</div>
                </div>
              </div>
              
              <div className="bg-[#E7FF36] text-black px-2 py-1 rounded-full text-[10px] font-bold inline-block mb-4">
                Domínio personalizado grátis por 1 ano
              </div>
              
              <div className="px-3 py-2 bg-gray-800/50 rounded-md text-center mb-3">
                <p className="text-white text-sm">Exemplo: <strong>suaempresa.com.br</strong></p>
              </div>
              
              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-[#E7FF36] w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-white">Domínio personalizado gratuito</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-[#E7FF36] w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-white">Até 3 alterações por mês inclusas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-[#E7FF36] w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-white">Suporte VIP</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="text-[#E7FF36] w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-bold text-white">Economize 44% em relação ao plano mensal</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <button
              type="button"
              onClick={() => handlePlanChange("annual")}
              className="w-full py-2.5 text-sm bg-[#E7FF36] text-black font-bold rounded-md transition-all hover:bg-[#d8f02a] hover:shadow-lg group-hover:translate-y-[-2px]"
            >
              Escolher plano anual
            </button>
          </div>
        </div>
      </div>
      
      {/* Contador de pessoas */}
      <div className="text-center text-xs text-gray-600 mt-4">
        <span className="flex items-center justify-center gap-2">
          <Users className="w-3 h-3 text-green-500" />
          <span><strong>{recentUsers}</strong> pessoas escolheram recentemente</span>
        </span>
      </div>
      
      {/* CSS for animations */}
      <style>
        {`
        /* Monthly sphere styles */
        .monthly-sphere-container {
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transform: translateZ(0);
        }
        
        .monthly-sphere {
          transform: translateZ(0);
        }
        
        /* Premium blob animations */
        .premium-blob-container {
          position: relative;
          width: 140px;
          height: 140px;
          overflow: hidden;
          margin: 0 auto;
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
        
        /* Hover effects */
        .annual-card:hover .premium-blob-container {
          transform: scale(1.02);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .annual-card:hover .premium-blob {
          filter: blur(10px) contrast(150%);
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .monthly-sphere-container, 
          .premium-blob-container {
            width: 100px;
            height: 100px;
            margin-top: 60px;
          }
          
          .premium-blob {
            width: 50px;
            height: 50px;
            filter: blur(8px);
          }
        }
        
        /* Accessibility - reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .premium-blob,
          .premium-particle {
            animation: none;
            transition: none;
          }
          
          .premium-blob {
            opacity: 0.8;
          }
          
          .premium-blob-container {
            background: linear-gradient(135deg, #7B2CBF, #03DAC5, #50E682);
          }
        }
        `}
      </style>
    </div>
  );
};

export default PlanSelection;
