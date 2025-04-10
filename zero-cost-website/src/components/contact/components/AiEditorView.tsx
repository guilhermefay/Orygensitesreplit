
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Edit, Save, X } from 'lucide-react';
import ContentPreview from './ContentPreview';
import { Button } from "@/components/ui/button";

interface AiEditorViewProps {
  content: string;
  onSave: (newContent: string) => void;
  onCancel?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const AiEditorView: React.FC<AiEditorViewProps> = ({ 
  content, 
  onSave,
  onCancel,
  onBack,
  isLoading = false
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isDirectEditMode, setIsDirectEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSubmit = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Por favor, forneça instruções para a edição.");
      return;
    }
    
    console.log("Submitting AI edit instructions:", aiPrompt.substring(0, 100) + "...");
    // When submitting via AI instructions, we'll use the format:
    // "INSTRUCTION: actual instruction text"
    onSave(`INSTRUCTION: ${aiPrompt}`);
  };

  const toggleDirectEdit = () => {
    setIsDirectEditMode(!isDirectEditMode);
    // Reset edited content to original when entering edit mode
    if (!isDirectEditMode) {
      setEditedContent(content);
    }
  };

  const handleDirectEdit = () => {
    // Use a special instruction format that tells the backend to use this exact text
    // "DIRECT_EDIT: actual text content"
    onSave(`DIRECT_EDIT: ${editedContent}`);
  };

  // Use onBack if provided, otherwise use onCancel
  const handleBack = () => {
    if (onBack) onBack();
    else if (onCancel) onCancel();
  };

  return (
    <div className="space-y-5">
      {!isDirectEditMode ? (
        <>
          <div className="p-5 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                O que você gostaria de mudar no conteúdo?
              </label>
              <Button 
                onClick={toggleDirectEdit}
                variant="outline"
                className="flex items-center gap-2 text-xs"
                size="sm"
              >
                <Edit size={14} />
                Editar texto diretamente
              </Button>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: Torne o tom mais informal, adicione mais detalhes sobre os serviços, etc."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 min-h-[120px] text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Seja específico para obter melhores resultados.
            </p>
            
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleBack}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2.5 text-sm"
              >
                <X size={16} />
                Cancelar
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={!aiPrompt.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-4 py-2.5 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Aplicar edições da IA</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none opacity-50 min-h-[50vh]">
            <ContentPreview content={content} />
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="bg-gray-50 border border-gray-200 p-4 mb-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Modo de edição direta:</h4>
            <p className="text-xs text-gray-600">
              Você está editando o texto diretamente. Mantenha os marcadores de página (==== PÁGINA:) e seções para preservar a estrutura.
            </p>
          </div>
          
          <textarea 
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[65vh] p-4 border-2 border-gray-200 rounded-lg focus:ring-highlight focus:border-highlight font-mono text-sm"
            style={{ lineHeight: '1.6' }}
          />
          
          <div className="flex gap-3 mt-6 justify-end">
            <Button 
              onClick={toggleDirectEdit}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              <X size={16} />
              Cancelar
            </Button>
            
            <Button 
              onClick={handleDirectEdit}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Salvar alterações</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiEditorView;
