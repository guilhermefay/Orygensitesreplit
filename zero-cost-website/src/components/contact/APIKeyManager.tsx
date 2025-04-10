
import React from 'react';
import { Key, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const APIKeyManager: React.FC = () => {
  return (
    <div className="mb-4 border-l-4 border-green-500 pl-2">
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
        <Key size={16} className="text-green-600" />
        <span className="text-sm">
          A API da OpenAI está configurada de forma segura no servidor
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={14} className="text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>As chaves de API agora são gerenciadas de forma segura no servidor, não sendo mais necessário configurá-las manualmente.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default APIKeyManager;
