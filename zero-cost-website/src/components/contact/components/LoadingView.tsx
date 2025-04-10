
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const professionalMessages = [
  "Aguarde um instante...",
  "Carregando informações...",
  "Só mais um momento...",
  "Quase lá...",
  "Processando suas informações..."
];

const LoadingView: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(professionalMessages[0]);
  
  useEffect(() => {
    console.log("LoadingView mounted - Showing loading animation");
    
    // Troca a mensagem a cada 3 segundos
    const interval = setInterval(() => {
      setCurrentMessage(prevMessage => {
        const currentIndex = professionalMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % professionalMessages.length;
        return professionalMessages[nextIndex];
      });
    }, 3000);
    
    return () => {
      console.log("LoadingView unmounted");
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "h-8 w-8 rounded-full",
            "bg-highlight",
            "opacity-70"
          )} />
        </div>
      </div>
      <p className="text-lg font-medium mt-6 text-foreground animate-pulse">{currentMessage}</p>
      <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos.</p>
    </div>
  );
};

export default LoadingView;
