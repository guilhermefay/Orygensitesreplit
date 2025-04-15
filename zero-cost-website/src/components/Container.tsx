import React from 'react';
import { cn } from '@/lib/utils'; // Importar utilitário cn para mesclar classes

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', // Classes padrão do container
        className // Permite adicionar classes extras via props
      )}
    >
      {children}
    </div>
  );
};

export default Container; 