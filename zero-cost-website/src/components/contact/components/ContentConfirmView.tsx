
import React, { useState, useEffect } from 'react';
import { Check, ArrowLeft, Edit, AlertTriangle, Info } from 'lucide-react';
import { GeneratedCopy } from '../types';
import ContentPreview from './ContentPreview';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContentConfirmViewProps {
  generatedCopy: GeneratedCopy;
  onBack?: (e?: React.MouseEvent) => void;
  onConfirm?: (e?: React.MouseEvent) => void;
  onEdit?: () => void;
  onContentRendered?: (renderedContent: string) => void;
  onBackConfirmed?: () => void;
}

const ContentConfirmView: React.FC<ContentConfirmViewProps> = ({ 
  generatedCopy, 
  onBack, 
  onConfirm,
  onEdit,
  onContentRendered,
  onBackConfirmed
}) => {
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [displayContent, setDisplayContent] = useState(generatedCopy.content || "");

  // Update the displayed content when generatedCopy changes
  useEffect(() => {
    if (generatedCopy.content) {
      console.log("ContentConfirmView - Updating displayed content, length:", generatedCopy.content.length);
      setDisplayContent(generatedCopy.content);
    }
  }, [generatedCopy.content]);

  // Notify parent component about content when rendered
  useEffect(() => {
    if (displayContent && onContentRendered) {
      console.log("ContentConfirmView - Notifying about rendered content:", 
                 displayContent.substring(0, 50) + "...");
      onContentRendered(displayContent);
    }
  }, [displayContent, onContentRendered]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Ensure content is passed to parent component
    if (onContentRendered && displayContent) {
      console.log("ContentConfirmView - handleConfirm - Confirming content:", 
                 displayContent.substring(0, 50) + "...");
      onContentRendered(displayContent);
    }
    
    if (onConfirm) {
      onConfirm(e);
    } else {
      toast.success("Conteúdo aprovado com sucesso!");
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowBackWarning(true);
  };

  const handleBackConfirm = () => {
    setShowBackWarning(false);
    if (onBackConfirmed) {
      onBackConfirmed();
    } else if (onBack) {
      onBack();
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit();
  };

  return (
    <div className="bg-white rounded-lg flex flex-col">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
          <Check className="mr-2 h-5 w-5" />
          <span className="font-medium">Texto gerado com sucesso!</span>
        </div>
        <h3 className="text-xl font-semibold">Revisar Conteúdo do Seu Site</h3>
        <p className="text-gray-600 mt-2">
          Confirme o texto ou edite o conteúdo manualmente.
        </p>
        
        <div className="mt-4 bg-blue-50 text-blue-700 p-3 rounded-lg flex items-start text-sm">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-left">
            <span className="font-semibold">Importante:</span> Este é apenas o conteúdo textual e estrutura do seu site, 
            com sugestões de conteúdo para cada página, seções e possíveis imagens. 
            Este não é o site final. Você pode editar livremente este texto antes de seguirmos 
            para as próximas etapas de design e desenvolvimento.
          </p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto mb-6 pr-2 custom-scrollbar max-h-[400px] border border-gray-100 p-4 rounded-lg bg-gray-50">
        <ContentPreview 
          content={displayContent} 
          onContentRendered={onContentRendered}
        />
      </div>

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={handleBackClick}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Editar conteúdo
          </Button>
          
          <Button
            variant="default"
            onClick={handleConfirm}
            className="bg-black text-highlight font-medium hover:bg-gray-900 transition-all duration-300 flex items-center gap-2"
          >
            <Check size={16} />
            Confirmar e Continuar
          </Button>
        </div>
      </div>

      <AlertDialog open={showBackWarning} onOpenChange={setShowBackWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Atenção! Você perderá o conteúdo atual
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ao voltar, você perderá todo o conteúdo gerado e não será possível recuperá-lo.
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBackConfirm} className="bg-amber-600 hover:bg-amber-700">
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContentConfirmView;
