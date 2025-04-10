
import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const FloatingChat: React.FC = () => {
  const [showHint, setShowHint] = useState(false);
  const { translate, language } = useLanguage();
  
  useEffect(() => {
    // Show the hint message after 3 seconds
    const timeout = setTimeout(() => {
      setShowHint(true);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  const handleWhatsAppRedirect = () => {
    window.open("https://wa.me/5534991533667?text=Ol%C3%A1%20%2C%20tenho%20uma%20d%C3%BAvida%20sobre%20os%20sites%20da%20Orygen%20Sites.%20", "_blank");
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {showHint && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg animate-fade-in flex items-center max-w-[200px]">
            <div className="text-center w-full">
              <p className="text-xs font-medium">{translate('chat.help')}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-0 right-0 h-4 w-4" 
              onClick={() => setShowHint(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleWhatsAppRedirect}
            className="bg-[#e7ff36] hover:bg-[#d8f02a] w-16 h-16 rounded-full shadow-md flex items-center justify-center hover:shadow-lg hover:shadow-black/30 transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="h-8 w-8 text-black" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
};

export default FloatingChat;
