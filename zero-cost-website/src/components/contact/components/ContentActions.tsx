
import React from 'react';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ContentActionsProps {
  contentToDisplay: string;
  isEditing: boolean;
  isAiEditView: boolean;
  resetForm: () => void;
  handleEditToggle: () => void;
  handleAiEditToggle: () => void;
  handleFinalize: (e: React.MouseEvent) => void;
  handleSaveEditedVersion?: () => void;
  showSaveEditedVersion?: boolean;
}

const ContentActions: React.FC<ContentActionsProps> = ({
  contentToDisplay,
  isEditing,
  isAiEditView,
  resetForm,
  handleEditToggle,
  handleAiEditToggle,
  handleFinalize,
  handleSaveEditedVersion,
  showSaveEditedVersion = false
}) => {
  return (
    <div className="border-t border-gray-100 pt-4 sticky bottom-0 bg-white">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={resetForm} variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Voltar
          </Button>
          
          {!isEditing && !isAiEditView && (
            <Button 
              onClick={handleEditToggle} 
              variant="outline" 
              className="flex items-center gap-2 border-amber-500 text-amber-600 hover:bg-amber-50" 
              type="button"
            >
              <Edit size={16} />
              Editar manualmente
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {isEditing && handleSaveEditedVersion && (
            <Button 
              onClick={handleSaveEditedVersion} 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" 
              type="button"
            >
              <Save size={16} />
              Salvar alterações
            </Button>
          )}
          
          {!isEditing && !isAiEditView && (
            <Button 
              onClick={handleFinalize} 
              className="bg-black text-highlight hover:bg-gray-900 flex items-center gap-2" 
              type="button"
            >
              Confirmar e continuar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentActions;
