
import React from 'react';
import { ErrorMessageProps, getErrorType } from './ErrorTypes';

// Table structure error message
export const TableStructureError: React.FC<{ missingColumnsText: string | null }> = ({ missingColumnsText }) => (
  <div className="mt-2 space-y-3">
    <p className="text-sm text-muted-foreground">
      A tabela <code>form_submissions</code> não está configurada corretamente. Você precisa criar a tabela com 
      todas as colunas necessárias ou atualizar a estrutura existente.
    </p>
    
    {missingColumnsText && (
      <div className="bg-red-50 border border-red-200 p-3 rounded-md">
        <p className="text-sm font-medium text-red-800 mb-2">Colunas faltando:</p>
        <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
          {missingColumnsText.split(', ').map((col, index) => (
            <li key={index}><code>{col.trim()}</code></li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Policy exists error message
export const PolicyExistsError: React.FC = () => (
  <div className="mt-2 space-y-3">
    <p className="text-sm text-muted-foreground">
      A política RLS já existe na tabela <code>form_submissions</code>. Isso é bom! Significa que as inserções 
      anônimas já estão permitidas. Tente enviar o formulário novamente, pois o erro pode ter ocorrido apenas ao 
      tentar criar a política.
    </p>
  </div>
);

// RLS error message
export const RLSError: React.FC<{ sqlCommandText: string | null }> = ({ sqlCommandText }) => (
  <div className="mt-2 space-y-3">
    <p className="text-sm text-muted-foreground">
      É necessário configurar uma política RLS (Row Level Security) na tabela <code>form_submissions</code> para permitir inserções anônimas.
    </p>
    
    {sqlCommandText && (
      <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs overflow-x-auto">
        <pre>{sqlCommandText}</pre>
      </div>
    )}
  </div>
);

// Multiple attempts error message
export const MultipleAttemptsError: React.FC = () => (
  <div className="mt-2 space-y-3">
    <p className="text-sm text-muted-foreground">
      Mesmo após várias tentativas, não foi possível enviar os dados para o Supabase. Verifique se:
    </p>
    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
      <li>A tabela <code>form_submissions</code> existe no seu projeto</li>
      <li>A tabela possui as colunas corretas (name, email, phone, etc.)</li>
      <li>A política RLS está configurada corretamente</li>
      <li>Seu projeto Supabase está online e funcionando</li>
    </ul>
  </div>
);

// Rate limit error message
export const RateLimitError: React.FC = () => (
  <div className="mt-2 space-y-3">
    <p className="text-sm text-muted-foreground">
      Você atingiu o limite de requisições à API da OpenAI. Isto pode acontecer por:
    </p>
    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
      <li>Muitas solicitações feitas em pouco tempo</li>
      <li>O contador de requisições pode estar incorreto</li>
      <li>Problemas com a API da OpenAI</li>
    </ul>
    <p className="text-sm font-medium mt-2">
      Você pode resetar o contador de requisições para tentar novamente.
    </p>
  </div>
);

// API key error message
export const ApiKeyError: React.FC = () => (
  <p className="text-sm text-muted-foreground">
    A chave API fornecida é inválida ou expirou. Por favor, verifique sua chave API e tente novamente.
  </p>
);

// File upload error message
export const FileUploadError: React.FC = () => (
  <p className="text-sm text-muted-foreground">
    Ocorreu um erro ao fazer upload dos arquivos. Verifique o tamanho e formato dos arquivos e tente novamente.
  </p>
);

// Combined error messages component
export const ErrorMessages: React.FC<ErrorMessageProps> = ({ 
  error, 
  errorCodeValue,
  missingColumnsText,
  sqlCommandText
}) => {
  const {
    isTableStructureError,
    isPolicyExistsError,
    isRLSError,
    isMultipleAttemptsError,
    isRateLimitError,
    isApiKeyError,
    isFileUploadError
  } = getErrorType(error);

  return (
    <div className="mb-5 space-y-3">
      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      
      {isTableStructureError && <TableStructureError missingColumnsText={missingColumnsText} />}
      {isPolicyExistsError && <PolicyExistsError />}
      {isRLSError && !isPolicyExistsError && <RLSError sqlCommandText={sqlCommandText} />}
      {isMultipleAttemptsError && <MultipleAttemptsError />}
      {isRateLimitError && <RateLimitError />}
      {isApiKeyError && <ApiKeyError />}
      {isFileUploadError && <FileUploadError />}
    </div>
  );
};
