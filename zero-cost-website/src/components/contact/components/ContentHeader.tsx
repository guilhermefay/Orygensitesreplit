
import React from 'react';
import { Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ContentHeader: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`sticky top-0 bg-white z-10 ${isMobile ? 'pb-2 mb-2' : 'pb-3 mb-4'} border-b border-gray-100`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold`}>Conteúdo gerado para o seu site</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className={`bg-gray-100 text-gray-700 ${isMobile ? 'text-[9px] px-1 py-0.5' : 'text-xs px-2 py-1'} rounded font-medium`}>
            Pronto para uso
          </div>
        </div>
      </div>
      
      {!isMobile && (
        <p className="text-sm text-gray-500 mb-2">
          Revise o conteúdo abaixo. Você pode editar manualmente ou com ajuda da IA antes de finalizar.
        </p>
      )}
      
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className="bg-highlight h-full w-3/4"></div>
      </div>
      
      <div className={`bg-blue-50 text-blue-700 ${isMobile ? 'p-1.5 text-[10px]' : 'p-2.5 text-xs'} rounded-md flex items-start mb-2`}>
        <Info className={`${isMobile ? 'h-3 w-3 mr-1 mt-0' : 'h-4 w-4 mr-1.5 mt-0.5'} flex-shrink-0`} />
        <p>
          {isMobile ? (
            <span>Este é apenas o <strong>conteúdo textual</strong> do seu site, não o design final.</span>
          ) : (
            <span>Este é apenas o <strong>conteúdo textual</strong> e estrutura do seu site. Não representa o design final.
              Aqui você encontrará o texto para cada página, seções e sugestões de imagens que serão implementadas posteriormente.</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ContentHeader;
