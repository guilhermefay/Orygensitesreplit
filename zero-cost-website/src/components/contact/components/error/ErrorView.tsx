
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useClipboard } from '@/hooks/useClipboard';
import { createTableSQL } from '@/lib/supabase';
import { ErrorViewProps, getErrorType } from './ErrorTypes';
import { ErrorMessages } from './ErrorMessages';
import ErrorActions from './ErrorActions';
import SQLDialog from './SQLDialog';

const ErrorView: React.FC<ErrorViewProps> = ({ error, resetForm }) => {
  const [showSQLDialog, setShowSQLDialog] = useState(false);
  const { copied, copyToClipboard } = useClipboard();

  // Get error details
  const {
    errorCodeValue,
    isTableStructureError,
    isPolicyExistsError,
    isRLSError,
    isMultipleAttemptsError,
    sqlCommandText,
    missingColumnsText
  } = getErrorType(error);
  
  // Function to copy SQL to clipboard
  const copySQLToClipboard = () => {
    copyToClipboard(createTableSQL);
  };
  
  // Determine error title
  const getErrorTitle = () => {
    if (isTableStructureError) return "Problema na estrutura da tabela";
    if (isPolicyExistsError) return "Política RLS já existe";
    if (isRLSError) return "Erro de permissão no Supabase";
    if (isMultipleAttemptsError) return "Problema persistente no Supabase";
    return "Erro ao enviar dados";
  };
  
  return (
    <>
      <div className={cn(
        "border rounded-md p-6",
        "bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900/50"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            "bg-red-100 dark:bg-red-900/20"
          )}>
            <AlertTriangle className="text-red-600 dark:text-red-500" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-500">
            {getErrorTitle()}
          </h3>
        </div>
        
        <ErrorMessages 
          error={error}
          errorCodeValue={errorCodeValue}
          missingColumnsText={missingColumnsText}
          sqlCommandText={sqlCommandText}
        />
        
        <ErrorActions 
          isTableStructureError={isTableStructureError}
          isRLSError={isRLSError}
          isPolicyExistsError={isPolicyExistsError}
          isMultipleAttemptsError={isMultipleAttemptsError}
          isRateLimitError={getErrorType(error).isRateLimitError}
          isApiKeyError={getErrorType(error).isApiKeyError}
          resetForm={resetForm}
          copied={copied}
          copySQLToClipboard={copySQLToClipboard}
          setShowSQLDialog={setShowSQLDialog}
        />
      </div>

      <SQLDialog
        showSQLDialog={showSQLDialog}
        setShowSQLDialog={setShowSQLDialog}
        copied={copied}
        copySQLToClipboard={copySQLToClipboard}
      />
    </>
  );
};

export default ErrorView;
