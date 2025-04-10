
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

interface ManualEditorViewProps {
  content: string;
  onContentChange?: (newContent: string) => void;
  onSave: (newContent: string) => void;
  onBack: () => void;
}

const ManualEditorView: React.FC<ManualEditorViewProps> = ({ 
  content, 
  onContentChange,
  onSave,
  onBack
}) => {
  const [editedContent, setEditedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Set focus to the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      // Auto-resize textarea to fit content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, []);

  // Update local state when the prop changes
  useEffect(() => {
    if (content !== editedContent) {
      console.log("ManualEditorView - Updating local content from prop, length:", content.length);
      setEditedContent(content);
    }
  }, [content]);

  const handleSave = () => {
    console.log("ManualEditorView - Salvando conteúdo editado", editedContent.substring(0, 50) + "...");
    
    if (!editedContent || editedContent.trim() === '') {
      console.warn("ManualEditorView - Attempted to save empty content");
      toast.error("Não é possível salvar conteúdo vazio");
      return;
    }
    
    try {
      // Important: Call the onSave callback with the edited content
      console.log("ManualEditorView - Calling onSave with edited content length:", editedContent.length);
      onSave(editedContent);
      toast.success("Conteúdo salvo com sucesso!");
    } catch (error) {
      console.error("ManualEditorView - Error saving content:", error);
      toast.error("Erro ao salvar o conteúdo");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    
    // Call the onContentChange callback if provided
    if (onContentChange) {
      console.log("ManualEditorView - Notifying parent about content change, length:", newContent.length);
      onContentChange(newContent);
    }
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // Adding handler for keydown event to save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save with Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent default browser behavior
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editedContent]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="bg-gray-50 border border-gray-200 p-4 mb-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Dicas de edição:</h4>
        <ul className="text-xs text-gray-600 space-y-1.5">
          <li>• Mantenha os marcadores de página: <code>==== PÁGINA: NOME ====</code></li>
          <li>• Mantenha os marcadores de seção: <code>- SEÇÃO: NOME</code></li>
          <li>• Use * para marcar tópicos e elementos de lista</li>
          <li>• Crie frases de impacto curtas para maior destaque visual</li>
          <li>• Pressione Ctrl+S ou Cmd+S para salvar rapidamente</li>
        </ul>
      </div>
      
      <textarea 
        ref={textareaRef}
        value={editedContent}
        onChange={handleChange}
        className="w-full flex-grow min-h-[calc(65vh-200px)] p-4 border-2 border-gray-200 rounded-lg focus:ring-highlight focus:border-highlight font-mono text-sm resize-none"
        style={{ lineHeight: '1.6' }}
      />
      
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 pt-4 pb-2 mt-6 flex gap-3 justify-end z-10">
        <Button 
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <ArrowLeft size={16} />
          Voltar
        </Button>
        
        <Button 
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4 py-2.5 text-sm"
          type="button"
        >
          <Save size={16} />
          Salvar alterações
        </Button>
      </div>
    </div>
  );
};

export default ManualEditorView;
