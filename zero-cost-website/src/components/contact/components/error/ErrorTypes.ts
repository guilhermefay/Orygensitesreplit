
import { ReactNode } from 'react';

// Main props for ErrorView component
export interface ErrorViewProps {
  error: string;
  resetForm: () => void;
}

// Props for specific error type displays
export interface ErrorMessageProps {
  error: string;
  errorCodeValue: string | null;
  missingColumnsText?: string | null;
  sqlCommandText?: string | null;
}

// Props for error actions
export interface ErrorActionsProps {
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
}

// Props for SQL dialog
export interface SQLDialogProps {
  showSQLDialog: boolean;
  setShowSQLDialog: (show: boolean) => void;
  copied: boolean;
  copySQLToClipboard: () => void;
}

// Error type detection utility
export const getErrorType = (error: string): {
  errorCodeValue: string | null;
  isRateLimitError: boolean;
  isApiKeyError: boolean;
  isFileUploadError: boolean;
  isRLSError: boolean;
  isPolicyExistsError: boolean;
  isTableStructureError: boolean;
  isMultipleAttemptsError: boolean;
  sqlCommandText: string | null;
  missingColumnsText: string | null;
} => {
  // Extract error code if present (format: "Error 429: Rate limit exceeded")
  const errorCode = error.match(/Error (\d+):|erro de permissão \((\d+)\):|ERROR:\s*(\d+):/i);
  const errorCodeValue = errorCode ? (errorCode[1] || errorCode[2] || errorCode[3]) : null;
  
  // Determine error types
  const isRateLimitError = errorCodeValue === '429' || 
    error.toLowerCase().includes('rate limit') || 
    error.toLowerCase().includes('limite de taxa') ||
    error.toLowerCase().includes('limite diário');

  const isApiKeyError = errorCodeValue === '401' || 
    error.toLowerCase().includes('api key') || 
    error.toLowerCase().includes('chave api');
    
  const isFileUploadError = error.toLowerCase().includes('upload') ||
    error.toLowerCase().includes('arquivo') ||
    error.toLowerCase().includes('file');
    
  const isRLSError = errorCodeValue === '42501' || 
    error.toLowerCase().includes('permission denied') || 
    error.toLowerCase().includes('permissão') ||
    error.toLowerCase().includes('violates row-level security') ||
    error.toLowerCase().includes('política rls');
    
  const isPolicyExistsError = errorCodeValue === '42710' || 
    error.toLowerCase().includes('42710') || 
    (error.toLowerCase().includes('policy') && error.toLowerCase().includes('already exists'));
    
  const isTableStructureError = error.toLowerCase().includes('faltando') || 
    error.toLowerCase().includes('missing') || 
    error.toLowerCase().includes('does not exist') ||
    error.toLowerCase().includes('não existe');
    
  const isMultipleAttemptsError = error.toLowerCase().includes('após') && 
    error.toLowerCase().includes('tentativas');
    
  // Extract SQL command if present in the error message
  const sqlCommand = error.match(/SQL:\s*(CREATE POLICY[^;]+;)/i);
  const sqlCommandText = sqlCommand ? sqlCommand[1] : null;
  
  // Extract missing columns if present
  const missingColumns = error.match(/colunas: ([a-z0-9_,\s]+)\./i);
  const missingColumnsText = missingColumns ? missingColumns[1] : null;

  return {
    errorCodeValue,
    isRateLimitError,
    isApiKeyError,
    isFileUploadError,
    isRLSError,
    isPolicyExistsError,
    isTableStructureError,
    isMultipleAttemptsError,
    sqlCommandText,
    missingColumnsText
  };
};
