
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GeneratedCopy } from '../types';
import { toast } from "sonner";

interface ContentContextProps {
  isEditing: boolean;
  isAiEditView: boolean;
  editedContent: string;
  setEditedContent: (content: string) => void;
  setIsEditing: (value: boolean) => void;
  setIsAiEditView: (value: boolean) => void;
  handleContentSave: (newContent: string) => void;
  handleAiEdit: (instructions: string) => Promise<void>;
  contentToDisplay: string;
  generatedCopy: GeneratedCopy;
  editContent: (content: string, instructions: string) => Promise<boolean>;
  isAiEditing: boolean;
  onContentRendered?: (renderedContent: string) => void;
  onSaveContent?: (content: string) => void;
}

interface ContentProviderProps {
  children: React.ReactNode;
  generatedCopy: GeneratedCopy;
  onContentRendered?: (renderedContent: string) => void;
  onSaveContent?: (content: string) => void;
  editContent: (content: string, instructions: string) => Promise<boolean>;
  isAiEditing: boolean;
  aiEditedContent: GeneratedCopy;
}

const ContentContext = createContext<ContentContextProps | undefined>(undefined);

export const ContentProvider: React.FC<ContentProviderProps> = ({
  children,
  generatedCopy,
  onContentRendered,
  onSaveContent,
  editContent,
  isAiEditing,
  aiEditedContent
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAiEditView, setIsAiEditView] = useState(false);
  const [editedContent, setEditedContent] = useState(generatedCopy.content || "");
  const [lastSavedContent, setLastSavedContent] = useState<string | null>(null);
  
  // Update editedContent when generatedCopy changes (only if not already edited)
  useEffect(() => {
    if (generatedCopy.content && !lastSavedContent) {
      console.log("ContentContext - Initializing editedContent from generatedCopy, length:", generatedCopy.content.length);
      setEditedContent(generatedCopy.content);
      
      // Notify parent component about initial content
      if (onContentRendered) {
        console.log("ContentContext - Notifying about initial rendered content, length:", 
                 generatedCopy.content.length);
        onContentRendered(generatedCopy.content);
      }
    }
  }, [generatedCopy.content, onContentRendered, lastSavedContent]);

  // Update from AI edited content
  useEffect(() => {
    if (aiEditedContent?.content) {
      console.log("ContentContext - Updating from aiEditedContent, length:", 
               aiEditedContent.content.length);
      setEditedContent(aiEditedContent.content);
      setLastSavedContent(aiEditedContent.content);
      
      // Notify parent component about updated content
      if (onContentRendered) {
        console.log("ContentContext - Notifying about AI edited content, length:", 
                 aiEditedContent.content.length);
        onContentRendered(aiEditedContent.content);
      }
    }
  }, [aiEditedContent?.content, onContentRendered]);

  const handleContentSave = (newContent: string) => {
    console.log("ContentContext - handleContentSave - New content length:", newContent.length);
    
    if (!newContent || newContent.trim() === '') {
      console.warn("ContentContext - Attempted to save empty content");
      toast.error("Não é possível salvar conteúdo vazio");
      return;
    }
    
    // Update the local state
    setEditedContent(newContent);
    setLastSavedContent(newContent);
    
    // Update parent component if callback exists
    if (onSaveContent) {
      console.log("ContentContext - calling onSaveContent callback with saved content");
      onSaveContent(newContent);
    }
    
    // Notify parent component about rendered content
    if (onContentRendered) {
      console.log("ContentContext - calling onContentRendered callback with saved content");
      onContentRendered(newContent);
    }
    
    toast.success("Conteúdo atualizado com sucesso!");
    setIsEditing(false);
  };

  const handleAiEdit = async (instructions: string) => {
    console.log("ContentContext - handleAiEdit with instructions length:", instructions.length);
    try {
      // Use the most recent content as the base for AI edits
      const currentContent = lastSavedContent || editedContent || generatedCopy.content;
      console.log("ContentContext - Using current content for AI edit, length:", currentContent?.length);
      
      const success = await editContent(currentContent, instructions);
      console.log("AI edit result:", { success, newContent: !!aiEditedContent?.content });
      
      if (success && aiEditedContent?.content) {
        const newContent = aiEditedContent.content;
        setEditedContent(newContent);
        setLastSavedContent(newContent);
        
        // Also update the parent component if callback exists
        if (onSaveContent) {
          console.log("ContentContext - Notifying parent about AI edited content");
          onSaveContent(newContent);
        }
        
        // Notify parent component about rendered content
        if (onContentRendered) {
          console.log("ContentContext - Notifying about rendered AI content");
          onContentRendered(newContent);
        }
        
        toast.success("Edições da IA aplicadas com sucesso!");
        setIsAiEditView(false);
      }
    } catch (error) {
      console.error("Error in handleAiEdit:", error);
      toast.error("Erro ao aplicar edições da IA.");
    }
  };

  // Always use the last saved or edited content
  const contentToDisplay = lastSavedContent || editedContent || generatedCopy.content || "";

  const value = {
    isEditing,
    isAiEditView,
    editedContent,
    setEditedContent,
    setIsEditing,
    setIsAiEditView,
    handleContentSave,
    handleAiEdit,
    contentToDisplay,
    generatedCopy,
    editContent,
    isAiEditing,
    onContentRendered,
    onSaveContent,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContentContext = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContentContext must be used within a ContentProvider");
  }
  return context;
};
