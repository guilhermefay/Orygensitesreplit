import { useState, useCallback, useEffect, memo } from "react";
import { useFormData } from "./useFormData";
import { useFormNavigation } from "./useFormNavigation";
// import { useContentGeneration } from "./useContentGeneration"; // Remover - não usado neste fluxo
// import { useFormSubmission } from "./useFormSubmission"; // Remover - submissão será diferente
import { PricingConfiguration } from "@/lib/config/pricing";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { validateName, validateEmail, validatePhone } from '../utils/inputValidation';

// Define o tipo de dados para o formulário inicial simplificado
interface InitialFormData {
  name: string;
  email: string;
  phone: string;
  selectedPlan: 'monthly' | 'annual' | 'promotion' | 'promotion_usd' | 'test'; // Manter plano para cálculo
  // Remover outros campos: business, businessDetails
}

export const useContactForm = (
  onSuccess?: (businessName: string) => void, // Manter para callback final, se aplicável
  initialPlan: 'monthly' | 'annual' | 'promotion' | 'promotion_usd' | 'test' = "annual",
  pricingConfig?: PricingConfiguration
) => {
  // Adaptar useFormData para o formulário simplificado (pode precisar de ajustes internos se não for flexível)
  // Supõe que useFormData pode lidar com menos campos ou que ajustaremos lá depois.
  const {
    formData,
    // Remover files, colorPalette e suas funções associadas
    // files,
    // colorPalette,
    handleChange,
    // handleColorChange,
    // handleFileChange,
    // addColor,
    // removeColor,
    // setFiles,
    resetFormData
  } = useFormData(initialPlan, pricingConfig);

  // Usar apenas 2 passos
  const {
    step,
    totalSteps: originalTotalSteps, // Renomear para evitar conflito
    goToNextStep,
    goToPrevStep,
    setStep
  } = useFormNavigation();

  // Remover useFormSubmission e seus estados relacionados
  // const { ... } = useFormSubmission();

  const { language } = useLanguage();
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Renomear função e ajustar lógica
  const handleInitiateSubmission = useCallback(async () => {
    console.log('[useContactForm] Iniciando submissão e salvando dados iniciais...');
    setIsCreatingIntent(true); // Usar este estado para loading
    setApiError(null);
    // setClientSecret(null); // Limpar estado antigo
    // setCurrentFormId(null);

    // Validar campos iniciais
    if (!validateName(formData.name) || !validateEmail(formData.email) || !validatePhone(formData.phone) || !formData.selectedPlan) {
        toast.error(language === 'en' ? "Please fill in your name, email, and phone correctly." : "Por favor, preencha seu nome, email e telefone corretamente.");
        setIsCreatingIntent(false);
        return { success: false, formId: null }; // Retornar objeto
    }

    // Enviar os dados necessários para a API /api/store-form-data
    const requestBody = {
        plan: formData.selectedPlan,
        formData: { // Aninhar formData como a API espera
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            // Adicionar outros campos se a API os esperar
            business: formData.business,
            businessDetails: formData.businessDetails,
        },
    };

    try {
        // Mudar URL da API
        const response = await fetch('/api/store-form-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            let errorText = 'Failed to store initial data';
            try {
                const errorData = await response.json(); 
                errorText = errorData.error || JSON.stringify(errorData);
            } catch (jsonError) {
                 errorText = `Failed to store initial data. Status: ${response.status}`;
            }
            console.error('[useContactForm] Erro da API store-form-data:', errorText);
            throw new Error(errorText);
        }

        const data = await response.json();
        console.log('[useContactForm] Dados iniciais salvos:', data);
        
        // Verificar se retornou sucesso e o formId
        if (data.success && data.formId) {
            // setClientSecret(null); // Não precisamos mais de clientSecret
            setCurrentFormId(data.formId); // Armazena o formId retornado pela API
            setIsCreatingIntent(false);
            return { success: true, formId: data.formId }; // Sucesso, retornar formId
        } else {
             throw new Error(language === 'en' ? "API did not return success or formId" : "API não retornou sucesso ou formId");
        }

    } catch (err: any) {
        console.error('[useContactForm] Erro ao salvar dados iniciais:', err);
        setApiError(err.message || 'Failed to save initial data');
        toast.error(
            (language === 'en' ? 'Failed to save information: ' : 'Falha ao salvar informações: ') + 
            (err.message || (language === 'en' ? 'Please try again.' : 'Por favor, tente novamente.'))
        );
        setIsCreatingIntent(false);
        return { success: false, formId: null }; // Falha
    } finally {
      // Remover bloco if(isCreatingIntent) desnecessário
    }
  }, [formData, language, setCurrentFormId]); // Dependências ajustadas

  // useEffect para avançar para o passo 2 (Pagamento) APÓS SALVAR DADOS
  useEffect(() => {
    console.log(`[useContactForm useEffect] Verificando condições para avançar. Step: ${step}, CurrentFormId: ${!!currentFormId}`);
    // Avança para o passo 2 SOMENTE SE:
    // 1. Temos currentFormId (significa que os dados foram salvos)
    // 2. AINDA estamos no passo 1
    // REMOVER clientSecret da condição
    if (currentFormId && step === 1) { 
      console.log('[useContactForm useEffect] Condições atendidas! Chamando goToNextStep() para ir para a Etapa 2 (Pagamento).');
      goToNextStep();
    }
  }, [currentFormId, step, goToNextStep]); // Dependência de clientSecret removida

  // Função nextStep ajustada
  const nextStep = async (e: React.MouseEvent) => {
    console.log('>>> useContactForm - nextStep INICIADO para step:', step);
    e.preventDefault();

    if (step === 1) { // Saindo do passo 1 (Informações)
      if (isCreatingIntent) return false; // Evitar cliques múltiplos

      // Chama a função para salvar os dados iniciais
      const result = await handleInitiateSubmission();

      if (result.success && result.formId) {
        console.log('Dados iniciais salvos com formId:', result.formId, ', aguardando useEffect para avançar para Etapa 2.');
        // Não avançar aqui, o useEffect cuida disso
        return true;
      } else {
        console.log('Falha ao salvar dados iniciais. Não avançando.');
        return false;
      }
    }
    else {
        console.log(`useContactForm: Tentativa de avançar do passo ${step}, mas já estamos no último passo ou em estado inesperado.`);
        return false;
    }
  };

  // Função prevStep simplificada (só pode voltar do passo 2 para 1)
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 2) {
        // Limpar formId ao voltar? Importante se o usuário mudar dados e tentar de novo.
        setCurrentFormId(null); 
        return goToPrevStep();
    }
    return false; // Não pode voltar do passo 1
  };

  // Função reset simplificada
  const resetForm = () => {
    resetFormData();
    setClientSecret(null);
    setCurrentFormId(null);
    setApiError(null);
    setPaymentCompleted(false);
    setStep(1);
  };

  // Retornar apenas o necessário para as duas etapas
  return {
    formData: { // Retornar apenas os campos relevantes
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        selectedPlan: formData.selectedPlan,
        // Incluir business e businessDetails se ainda forem usados no formData
        business: formData.business, 
        businessDetails: formData.businessDetails,
    },
    isSubmitting: isCreatingIntent,
    step,
    // clientSecret, // REMOVER
    currentFormId,
    isCreatingIntent,
    apiError,
    handleChange,
    // Remover handleColorChange, handleFileChange, addColor, removeColor, setFiles, setFinalContent
    nextStep,
    prevStep,
    resetForm,
    // Remover setShowSuccessMessage, showSuccessMessage
    // Remover setInitialStep se não for mais usado
    totalSteps: 2,
    paymentCompleted,
    setPaymentCompleted
  };
};
