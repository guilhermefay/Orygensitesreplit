
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorViewProps {
  error: string;
  resetForm: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ error, resetForm }) => {
  // Extract error code if present (format: "Error 429: Rate limit exceeded")
  const errorCode = error.match(/Error (\d+):|(\d+):/);
  const errorCodeValue = errorCode ? (errorCode[1] || errorCode[2]) : null;
  
  // Determine if this is a rate limiting error
  const isRateLimitError = errorCodeValue === '429' || 
    error.toLowerCase().includes('rate limit') || 
    error.toLowerCase().includes('limite de taxa');

  // Determine if this is an API key error
  const isApiKeyError = errorCodeValue === '401' || 
    error.toLowerCase().includes('api key') || 
    error.toLowerCase().includes('chave api');
    
  // Determine if this is a file upload error
  const isFileUploadError = error.toLowerCase().includes('upload') ||
    error.toLowerCase().includes('arquivo') ||
    error.toLowerCase().includes('file');
    
  // Determine if this is a Supabase RLS error
  const isRLSError = errorCodeValue === '42501' || 
    error.toLowerCase().includes('rls') || 
    (error.toLowerCase().includes('permissão') && error.toLowerCase().includes('form_submissions'));

  return (
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
          {isRLSError ? "Erro de permissão no Supabase" : "Erro ao gerar conteúdo"}
        </h3>
      </div>
      
      <div className="mb-5 space-y-2">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        
        {isRateLimitError && (
          <p className="text-sm text-muted-foreground">
            Você atingiu o limite de requisições. Tente novamente mais tarde ou use uma chave API diferente.
          </p>
        )}
        
        {isApiKeyError && (
          <p className="text-sm text-muted-foreground">
            A chave API fornecida é inválida ou expirou. Por favor, verifique sua chave API e tente novamente.
          </p>
        )}
        
        {isFileUploadError && (
          <p className="text-sm text-muted-foreground">
            Ocorreu um erro ao fazer upload dos arquivos. Verifique o tamanho e formato dos arquivos e tente novamente.
          </p>
        )}
        
        {isRLSError && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>É necessário configurar uma política RLS para permitir inserções anônimas na tabela <code>form_submissions</code>.</p>
            <p className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto text-xs">
              <code>
                CREATE POLICY "Enable anonymous inserts for form_submissions"<br />
                ON public.form_submissions<br />
                FOR INSERT<br /> 
                TO anon<br />
                WITH CHECK (true);
              </code>
            </p>
            <p>Execute esse código SQL no Editor SQL do Supabase para corrigir o problema.</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={resetForm}
          className="bg-black text-highlight font-medium hover:bg-gray-800"
        >
          Tentar novamente
        </Button>
        
        {(isRateLimitError || isApiKeyError) && (
          <Button 
            onClick={() => window.open('https://platform.openai.com/account/api-keys', '_blank')}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Verificar chave API
          </Button>
        )}
        
        {isRLSError && (
          <Button 
            onClick={() => window.open('https://supabase.com/dashboard/project/gltluwhobeprwfzzcmzw/sql', '_blank')}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Abrir Editor SQL
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorView;
