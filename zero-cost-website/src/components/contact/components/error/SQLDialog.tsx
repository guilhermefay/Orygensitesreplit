
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Database, FileText } from "lucide-react";
import { createTableSQL } from '@/lib/supabase';
import { SQLDialogProps } from './ErrorTypes';

export const SQLDialog: React.FC<SQLDialogProps> = ({ 
  showSQLDialog, 
  setShowSQLDialog, 
  copied, 
  copySQLToClipboard 
}) => {
  // Function to open Supabase SQL Editor
  const openSupabaseSQL = () => {
    window.open('https://supabase.com/dashboard/project/_/sql/new', '_blank');
  };

  return (
    <Dialog open={showSQLDialog} onOpenChange={setShowSQLDialog}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SQL para criar a tabela form_submissions</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Execute este código SQL no Editor SQL do Supabase para criar a tabela <code>form_submissions</code> com 
            todas as colunas necessárias e configurar a política de segurança RLS:
          </p>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-x-auto">
            <pre className="whitespace-pre-wrap">{createTableSQL}</pre>
          </div>
          
          <div className="flex justify-between">
            <Button 
              onClick={openSupabaseSQL}
              className="bg-black text-highlight font-medium hover:bg-gray-800"
            >
              <Database className="mr-2 h-4 w-4" />
              Abrir Editor SQL
            </Button>
            
            <Button 
              onClick={copySQLToClipboard}
              variant="outline"
            >
              {copied ? "Copiado!" : "Copiar SQL"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SQLDialog;
