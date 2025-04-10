
import { useState, useEffect } from "react";
import ContactFooter from "./contact/ContactFooter";
import { AlertTriangle } from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "./ui/button";
import { supabase } from "../lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { language } = useLanguage();

  /**
   * Verifica a conexão com o Supabase
   */
  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Verificar buckets e criar se necessário
      try {
        await supabase.storage.createBucket('logos', {
          public: true
        });
        console.log('Bucket logos verificado/criado');
      } catch (error) {
        console.warn('Aviso ao verificar bucket logos:', error);
      }
      try {
        await supabase.storage.createBucket('photos', {
          public: true
        });
        console.log('Bucket photos verificado/criado');
      } catch (error) {
        console.warn('Aviso ao verificar bucket photos:', error);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao testar conexão com Supabase:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Erro de conexão desconhecido');
      setIsLoading(false);
    }
  };

  // Verifica a conexão com o Supabase quando o componente for montado
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  // Tratamento de erros gerais
  if (hasError) {
    return <section id="contato" className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="bg-red-50 text-red-800 p-4 md:p-6 rounded-lg border border-red-200 mx-auto max-w-md">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 md:h-12 md:w-12 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'en' ? 'Connection Error' : 'Erro de conexão'}
            </h3>
            <p className="text-sm">
              {errorMessage || (language === 'en' 
                ? "An error occurred while connecting to Supabase. Please try again later." 
                : "Ocorreu um erro ao se conectar ao Supabase. Por favor, tente novamente mais tarde.")}
            </p>
            <Button onClick={() => {
              setHasError(false);
              testSupabaseConnection();
            }} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              {language === 'en' ? 'Try again' : 'Tentar novamente'}
            </Button>
          </div>
        </div>
      </section>;
  }

  return (
    <section id="contato" className="py-16 md:py-24 bg-black relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-gray-900 to-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <Toaster position="top-center" />
        
        {/* Empty content - FAQ has been removed */}
      </div>
      
      <ContactFooter />
    </section>
  );
};

export default Contact;
