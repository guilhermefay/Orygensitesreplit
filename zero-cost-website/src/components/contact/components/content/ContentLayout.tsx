
import React, { useEffect } from 'react';
import { useContentContext } from '../../context/ContentContext';
import ContentHeader from '../ContentHeader';
import ManualEditorView from '../ManualEditorView';
import AiEditorView from '../AiEditorView';
import ContentPreview from '../ContentPreview';
import ContentActions from '../ContentActions';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContentLayoutProps {
  resetForm: () => void;
  onBack?: (e?: React.MouseEvent) => void;
  onConfirm?: (e?: React.MouseEvent) => void;
}

const ContentLayout: React.FC<ContentLayoutProps> = ({ 
  resetForm, 
  onBack,
  onConfirm 
}) => {
  const isMobile = useIsMobile();
  const {
    isEditing,
    isAiEditView,
    contentToDisplay,
    setIsEditing,
    setIsAiEditView,
    handleContentSave,
    handleAiEdit,
    isAiEditing,
    onContentRendered,
    editedContent,
    setEditedContent
  } = useContentContext();

  // Effect to sync contentToDisplay with editedContent when not in editing mode
  useEffect(() => {
    if (!isEditing && contentToDisplay && contentToDisplay !== editedContent) {
      console.log("ContentLayout - Syncing editedContent with contentToDisplay, length:", contentToDisplay.length);
      setEditedContent(contentToDisplay);
    }
  }, [contentToDisplay, isEditing, editedContent, setEditedContent]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsAiEditView(false);
  };

  const handleAiEditToggle = () => {
    setIsAiEditView(!isAiEditView);
    setIsEditing(false);
  };

  // Track manual edits in the editor
  const handleContentChange = (newContent: string) => {
    console.log("ContentLayout - Manual content changed, length:", newContent.length);
    setEditedContent(newContent);
  };

  const handleSaveEditedVersion = (newContent: string) => {
    console.log("ContentLayout - handleSaveEditedVersion called with content length:", newContent.length);
    
    // Make sure we have content to save
    if (!newContent || newContent.trim() === '') {
      console.warn("ContentLayout - Attempted to save empty content");
      toast.error("Não é possível salvar conteúdo vazio");
      return;
    }
    
    try {
      console.log("ContentLayout - Calling handleContentSave with edited content");
      handleContentSave(newContent);
      
      // Exit editing mode after saving
      setIsEditing(false);
    } catch (error) {
      console.error("ContentLayout - Error in handleSaveEditedVersion:", error);
      toast.error("Erro ao salvar conteúdo");
    }
  };

  const handleFinalize = (e: React.MouseEvent) => {
    // Prevent default to avoid form submission
    e.preventDefault();
    
    // Ensure content is passed
    if (onContentRendered && contentToDisplay) {
      console.log("ContentLayout - handleFinalize - Notifying about content length:", contentToDisplay.length);
      onContentRendered(contentToDisplay);
    }
    
    if (onConfirm) {
      // Pass the event to onConfirm
      console.log("ContentLayout - handleFinalize - Calling onConfirm");
      onConfirm(e);
    }
  };

  // Function to handle back button - use onBack if provided, otherwise resetForm
  const handleBack = (e?: React.MouseEvent) => {
    if (onBack) {
      onBack(e);
    } else {
      resetForm();
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-2' : 'p-6'} shadow-md flex flex-col ${isMobile ? 'h-[80vh]' : 'h-[85vh]'}`}>
      <ContentHeader />
      
      {isEditing ? (
        <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
          <ManualEditorView 
            content={editedContent} 
            onContentChange={handleContentChange}
            onSave={handleSaveEditedVersion} 
            onBack={() => setIsEditing(false)} 
          />
        </div>
      ) : isAiEditView ? (
        <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
          <AiEditorView 
            content={contentToDisplay}
            onSave={handleAiEdit}
            onBack={() => setIsAiEditView(false)}
            isLoading={isAiEditing}
          />
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
            <div className={`prose ${isMobile ? 'prose-xs' : 'prose-sm'} max-w-none ${isMobile ? 'min-h-[50vh]' : 'min-h-[65vh]'}`}>
              <ContentPreview 
                content={contentToDisplay} 
                onContentRendered={onContentRendered}
              />
            </div>
          </div>
          
          <ContentActions 
            contentToDisplay={contentToDisplay}
            isEditing={isEditing}
            isAiEditView={isAiEditView}
            resetForm={handleBack}
            handleEditToggle={handleEditToggle}
            handleAiEditToggle={handleAiEditToggle}
            handleFinalize={handleFinalize}
            handleSaveEditedVersion={() => {}}
            showSaveEditedVersion={false}
          />
        </>
      )}
    </div>
  );
};

export default ContentLayout;
