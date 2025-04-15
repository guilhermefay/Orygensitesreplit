import { useState, useCallback, useEffect } from "react";
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

  // Função para criar Payment Intent (simplificada)
  const handleCreatePaymentIntent = useCallback(async () => {
    console.log('[useContactForm] Tentando criar Payment Intent (simplificado)...');
    setIsCreatingIntent(true);
    setApiError(null);

    // Validar apenas os campos iniciais
    if (!validateName(formData.name) || !validateEmail(formData.email) || !validatePhone(formData.phone) || !formData.selectedPlan) {
        toast.error(language === 'en' ? "Please fill in your name, email, and phone correctly." : "Por favor, preencha seu nome, email e telefone corretamente.");
        setIsCreatingIntent(false);
        return false;
    }

    // Enviar apenas os dados necessários para a API
    const requestBody = {
        plan: formData.selectedPlan,
        // Passar apenas os campos iniciais para formData
        formData: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            // Não incluir business, businessDetails aqui
        },
    };

    try {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            // ... (tratamento de erro da API permanece o mesmo)
            let errorText = 'Failed to create payment intent';
            try {
                const errorData = await response.json(); 
                errorText = errorData.error || JSON.stringify(errorData);
            } catch (jsonError) {
                try {
                    errorText = await response.text();
                } catch (textError) {
                    errorText = `Failed to create payment intent. Status: ${response.status}`;
                }
            }
            console.error('[useContactForm] Erro da API create-payment-intent:', errorText);
            throw new Error(errorText);
        }

        const data = await response.json();
        console.log('[useContactForm] Payment Intent criado:', data);
        if (data.clientSecret && data.formId) {
            setClientSecret(data.clientSecret);
            setCurrentFormId(data.formId); // Armazena o formId retornado pela API
            setIsCreatingIntent(false);
            return true; // Sucesso
        } else {
             throw new Error(language === 'en' ? "API did not return clientSecret or formId" : "API não retornou clientSecret ou formId");
        }

    } catch (err: any) {
        console.error('[useContactForm] Erro ao criar payment intent:', err);
        setApiError(err.message || 'Failed to create payment intent');
        toast.error(
            (language === 'en' ? 'Failed to initialize payment: ' : 'Falha ao inicializar pagamento: ') + 
            (err.message || (language === 'en' ? 'Please try again.' : 'Por favor, tente novamente.'))
        );
        setIsCreatingIntent(false);
        return false; // Falha
    } finally {
      if (isCreatingIntent) { // Garantir que o loading pare
           setIsCreatingIntent(false);
      }
    }
  // Atualizar dependências se necessário (formData simplificado)
}, [formData.name, formData.email, formData.phone, formData.selectedPlan, language, setClientSecret, setCurrentFormId]);

  // useEffect para avançar para o passo 2 (Pagamento) após criar intent
  useEffect(() => {
    console.log(`[useContactForm useEffect] Verificando condições para avançar. Step: ${step}, ClientSecret: ${!!clientSecret}, CurrentFormId: ${!!currentFormId}`);
    // Avança para o passo 2 SOMENTE SE:
    // 1. Temos clientSecret e currentFormId
    // 2. AINDA estamos no passo 1
    if (clientSecret && currentFormId && step === 1) { // <<< MUDAR step para 1 >>>
      console.log('[useContactForm useEffect] Condições atendidas! Chamando goToNextStep() para ir para a Etapa 2 (Pagamento).');
      goToNextStep();
    }
  }, [clientSecret, currentFormId, step, goToNextStep]);

  // Função nextStep simplificada
  const nextStep = async (e: React.MouseEvent) => {
    console.log('>>> useContactForm - nextStep INICIADO para step:', step);
    e.preventDefault();

    if (step === 1) { // Saindo do passo 1 (Informações)
      if (isCreatingIntent) return false;

      // Validação já ocorre dentro de handleCreatePaymentIntent
      const intentCreated = await handleCreatePaymentIntent();

      if (intentCreated) {
        console.log('Intenção de pagamento criada, aguardando useEffect para avançar para Etapa 2.');
        // Não avançar aqui, o useEffect cuida disso
        return true;
      } else {
        console.log('Falha ao criar intenção de pagamento. Não avançando.');
        return false;
      }
    }
    // Não há mais passos para avançar a partir daqui neste formulário inicial
    else {
        console.log(`useContactForm: Tentativa de avançar do passo ${step}, mas já estamos no último passo ou em estado inesperado.`);
        return false;
    }
  };

  // Função prevStep simplificada (só pode voltar do passo 2 para 1)
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 2) {
        // Opcional: limpar clientSecret/formId ao voltar?
        // setClientSecret(null);
        // setCurrentFormId(null);
        return goToPrevStep();
    }
    return false; // Não pode voltar do passo 1
  };

  // Remover handleSubmit, pois não há submissão final aqui
  // const handleSubmit = ...

  // Função reset simplificada
  const resetForm = () => {
    resetFormData();
    setClientSecret(null); // Limpar estado do pagamento
    setCurrentFormId(null);
    setApiError(null);
    setStep(1); // Voltar para o passo inicial
  };

  // Retornar apenas o necessário para as duas etapas
  return {
    formData: { // Retornar apenas os campos relevantes
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        selectedPlan: formData.selectedPlan,
    },
    // Remover files, colorPalette, etc.
    isSubmitting: isCreatingIntent, // Usar isCreatingIntent como indicador de submissão/loading
    step,
    clientSecret,
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
    totalSteps: 2 // <<< CORREÇÃO: Sobrescrever totalSteps aqui >>>
  };
};
