import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client'; // Importar cliente Supabase
import BusinessDetails from '@/components/contact/BusinessDetails'; // Ajustar caminho se necessário
import VisualIdentity from '@/components/contact/VisualIdentity'; // Ajustar caminho se necessário
import { ContactFormData, FileData } from '@/components/contact/types'; // Importar tipos
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import Container from '@/components/Container'; // Usar um container para layout

const ColetaDadosPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formId = searchParams.get('formId');
  const { language } = useLanguage();

  // Estado para os dados dos formulários secundários
  const [formData, setFormData] = useState<Partial<ContactFormData>>({}); // Usar Partial para dados incompletos inicialmente
  const [files, setFiles] = useState<FileData>({ logo: null, photos: [] });
  const [colorPalette, setColorPalette] = useState<string[]>(['#000000', '#ffffff']); // Paleta inicial

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) {
      toast.error(language === 'en' ? 'Form ID not found. Cannot load data collection.' : 'ID do formulário não encontrado. Não é possível carregar a coleta de dados.');
      navigate('/'); // Redireciona se não houver formId
    } else {
        console.log('[ColetaDadosPage] Carregada com formId:', formId);
        // Opcional: Buscar dados já existentes se necessário? Por ora, começamos vazio.
        setFormData(prev => ({ ...prev, id: formId })); // Adiciona o ID ao estado
    }
  }, [formId, navigate, language]);

  // Funções de manipulação (precisam ser adaptadas para o estado local)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (type: 'photos' | 'logo', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (type === 'logo') {
        setFiles(prev => ({ ...prev, logo: e.target.files![0] }));
      } else {
        setFiles(prev => ({ ...prev, photos: Array.from(e.target.files!) }));
      }
    }
  };

  const handleColorChange = (colorIndex: number, color: string) => {
    setColorPalette(prev => prev.map((c, i) => (i === colorIndex ? color : c)));
  };

  const addColor = () => {
    setColorPalette(prev => [...prev, '#cccccc']);
  };

  const removeColor = (index: number): boolean => {
     if (colorPalette.length > 1) { // Não permite remover a última cor
        setColorPalette(prev => prev.filter((_, i) => i !== index));
        return true;
     }
     return false;
  };

  // Função para submeter os dados adicionais
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formId) {
        toast.error("ID do formulário inválido.");
        setIsLoading(false);
        return;
    }

    // TODO: Adicionar validação para os campos de BusinessDetails e VisualIdentity se necessário

    // Dados a serem atualizados no Supabase
    // Ajustar tipo para incluir apenas chaves válidas de ContactFormData + colunas específicas
    const updateData: Partial<ContactFormData & { business_details?: string, colors?: string[], style?: string, additional?: string, content_preference?: string, target_audience?: string }> = {
        business: formData.business,
        industry: formData.industry,
        competitors: formData.competitors,
        goals: formData.goals,
        business_details: formData.businessDetails, // Nome da coluna no Supabase
        colors: colorPalette,
        // TODO: Lógica para upload de arquivos (logo, photos) para Supabase Storage
        style: formData.stylePreference,
        additional: formData.specificRequirements,
        content_preference: formData.contentPreference,
        target_audience: formData.targetAudience
    };

    // Remover chaves com valor undefined antes de enviar
    Object.keys(updateData).forEach(key => {
        const typedKey = key as keyof typeof updateData;
        if (updateData[typedKey] === undefined) {
            delete updateData[typedKey];
        }
    });

    console.log('[ColetaDadosPage] Atualizando Supabase com dados:', updateData);

    try {
      // Chamar Supabase para atualizar
      const { error: updateError } = await supabase
        .from('form_submissions') // Confirme o nome da tabela
        .update(updateData as any) // Usar 'as any' temporariamente
        .eq('id', formId);

      if (updateError) {
        throw updateError;
      }

      toast.success(language === 'en' ? 'Information submitted successfully!' : 'Informações enviadas com sucesso!');
      // Opcional: Navegar para uma página final de agradecimento ou home
      navigate('/?submission=success');

    } catch (err: any) {
      console.error('[ColetaDadosPage] Erro ao atualizar Supabase:', err);
      setError(err.message || 'Erro ao enviar informações.');
      toast.error(err.message || 'Erro ao enviar informações.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!formId) {
    return null; // Ou um loader/mensagem de erro enquanto redireciona
  }

  return (
    <Container className="py-12 md:py-20">
        <h1 className="text-3xl font-bold mb-4 text-center">
            {language === 'en' ? 'Tell Us More About Your Business' : 'Conte-nos Mais Sobre Seu Negócio'}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
            {language === 'en' ? 'Complete the following information so we can create the perfect website for you.' : 'Complete as informações a seguir para criarmos o site perfeito para você.'}
        </p>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
            {/* Seção Detalhes do Negócio */}
            <div className="p-6 border rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">{language === 'en' ? 'Business Details' : 'Detalhes do Negócio'}</h2>
                <BusinessDetails
                    formData={formData as ContactFormData} // Passar estado local
                    handleChange={handleChange}          // Passar handler local
                />
            </div>

            {/* Seção Identidade Visual */}
            <div className="p-6 border rounded-lg shadow-sm">
                 <h2 className="text-2xl font-semibold mb-4">{language === 'en' ? 'Visual Identity' : 'Identidade Visual'}</h2>
                 <VisualIdentity
                    formData={formData as ContactFormData} // Passar estado local
                    files={files}
                    colorPalette={colorPalette}
                    handleColorChange={handleColorChange}
                    handleFileChange={handleFileChange}
                    setFiles={setFiles} // Passar setter local
                    addColor={addColor}
                    removeColor={removeColor}
                 />
            </div>

            {error && <p className="text-red-600 text-center">{error}</p>}

            <Button type="submit" disabled={isLoading} className="w-full py-3">
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                {language === 'en' ? 'Submit Information' : 'Enviar Informações'}
            </Button>
        </form>
    </Container>
  );
};

export default ColetaDadosPage; 