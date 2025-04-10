
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({
  title = "Algo deu errado",
  message = "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
  onRetry
}) => {
  
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6">{message}</p>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="bg-white border-gray-300 hover:bg-gray-50"
        >
          Tentar Novamente
        </Button>
      )}
    </div>
  );
};

export default ErrorView;
