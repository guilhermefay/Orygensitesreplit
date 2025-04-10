
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from 'lucide-react';

interface ErrorActionsProps {
  isTableStructureError: boolean;
  isRLSError: boolean;
  isPolicyExistsError: boolean;
  isMultipleAttemptsError: boolean;
  isRateLimitError: boolean;
  isApiKeyError: boolean;
  resetForm: () => void;
  copied: boolean;
  copySQLToClipboard: () => void;
  setShowSQLDialog: (show: boolean) => void;
  handleResetCounter?: () => void;
}

const ErrorActions: React.FC<ErrorActionsProps> = ({
  isTableStructureError,
  isRLSError,
  isPolicyExistsError,
  isMultipleAttemptsError,
  isRateLimitError,
  isApiKeyError,
  resetForm,
  copied,
  copySQLToClipboard,
  setShowSQLDialog,
  handleResetCounter
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        onClick={resetForm}
        className="bg-black text-white font-medium hover:bg-gray-800"
      >
        Tentar novamente
      </Button>
      
      {isRateLimitError && handleResetCounter && (
        <Button 
          onClick={handleResetCounter}
          variant="outline"
          className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Resetar contador
        </Button>
      )}
      
      {(isApiKeyError) && (
        <Button 
          onClick={() => window.open('https://platform.openai.com/account/api-keys', '_blank')}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Verificar chave API
        </Button>
      )}
      
      {isTableStructureError && (
        <Button 
          onClick={() => setShowSQLDialog(true)}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Ver SQL
        </Button>
      )}
      
      {isRLSError && (
        <Button 
          onClick={() => window.open('https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql', '_blank')}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Abrir Editor SQL
        </Button>
      )}

      {isPolicyExistsError && (
        <Button 
          onClick={resetForm}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Continuar mesmo assim
        </Button>
      )}
    </div>
  );
};

export default ErrorActions;
