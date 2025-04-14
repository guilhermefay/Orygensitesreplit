import { useState, useCallback } from "react";
import { useFormData } from "./useFormData";
import { useFormNavigation } from "./useFormNavigation";
import { useContentGeneration } from "./useContentGeneration"; // Mantido caso precise dos dados
import { useFormSubmission } from "./useFormSubmission";
import { PricingConfiguration } from "@/lib/config/pricing";
import { toast } from "sonner"; // Import toast for validation messages
import { useLanguage } from "@/contexts/LanguageContext"; // Import useLanguage
import { validateName, validateEmail, validatePhone } from '../utils/inputValidation'; // Import validation functions

export const useContactForm = (
  onSuccess?: (businessName: string) => void,
  initialPlan: "monthly" | "annual" = "annual",
  pricingConfig?: PricingConfiguration
) => {
  const {
    formData,
    files,
    colorPalette,
    handleChange,
    handleColorChange,
    handleFileChange,
    handlePlanChange,
    setInitialPlan,
    addColor,
    removeColor,
    setFiles,
    resetFormData
  } = useFormData(initialPlan, pricingConfig);

  const {
    step,
    totalSteps,
    // navIsSubmitting, // Redundant now
    // setNavIsSubmitting, // Redundant now
    goToNextStep,
    goToPrevStep,
    setStep
  } = useFormNavigation();

  const {
    generatedCopy, // Mantido
    finalContent, // Mantido para passar adiante
    setFinalContent, // Mantido
    resetGeneratedContent, // Mantido
    submitForm, // Mantido, mas não será chamado ao sair do Step 3
    formId, // Mantido
    isSubmitting, // Mantido
    setShowSuccessMessage, // Mantido
    showSuccessMessage // Mantido
  } = useFormSubmission();

  const { language } = useLanguage(); // Get language context
  
  // >>> NOVO ESTADO para clientSecret e formId da API <<<
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false); // Estado de loading para a API
  const [apiError, setApiError] = useState<string | null>(null); // <<< NOVO ESTADO para erro da API >>>

  // >>> NOVA FUNÇÃO para chamar a API create-payment-intent <<<
  const handleCreatePaymentIntent = useCallback(async () => {
    console.log('[useContactForm] Tentando criar Payment Intent...');
    setIsCreatingIntent(true);
    setApiError(null); // <<< Usar setApiError >>> // Limpar erros anteriores

    // Garantir que temos dados essenciais (pode adicionar mais validações se necessário)
    if (!formData.name || !formData.email || !formData.phone || !formData.business || !formData.businessDetails || !formData.selectedPlan) {
        toast.error(language === 'en' ? "Incomplete form data. Cannot create payment intent." : "Dados do formulário incompletos. Não é possível criar a intenção de pagamento.");
        setIsCreatingIntent(false);
        return false;
    }

    const requestBody = {
        plan: formData.selectedPlan,
        formData: formData, // Enviar todos os dados do formulário
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
        setApiError(err.message || 'Failed to create payment intent'); // <<< Usar setApiError >>>
        toast.error(
            (language === 'en' ? 'Failed to initialize payment: ' : 'Falha ao inicializar pagamento: ') + 
            (err.message || (language === 'en' ? 'Please try again.' : 'Por favor, tente novamente.'))
        );
        setIsCreatingIntent(false);
        return false; // Falha
    } finally {
      // Certifique-se que o loading é desativado em caso de erro inesperado não pego no catch
      // Embora o catch deva pegar a maioria dos casos.
      if (isCreatingIntent) {
           setIsCreatingIntent(false);
      }
    }
}, [formData, language, setClientSecret, setCurrentFormId]); // Dependências necessárias

  // Function to move to next step - CORRECTED LOGIC
  const nextStep = async (e: React.MouseEvent) => { // <<< Tornar async >>>
    console.log('>>> useContactForm - nextStep INICIADO para step:', step);
    e.preventDefault();

    // --- VALIDATION BEFORE ADVANCING ---
    if (step === 1) {
        if (!validateName(formData.name) || !validateEmail(formData.email) || !validatePhone(formData.phone)) {
            toast.error(language === 'en' ? "Please fill in all required fields correctly." : "Por favor, preencha todos os campos obrigatórios corretamente.");
            return false; // Stop advancement
        }
    }
    if (step === 2) {
        if (!formData.business || !formData.businessDetails || formData.businessDetails.length < 20) {
            toast.error(language === 'en' ? "Please provide complete business details." : "Por favor, forneça detalhes completos sobre seu negócio.");
            return false; // Stop advancement
        }
    }
    // Add validation for step 3 if needed (e.g., require logo or colors)

    // --- ADVANCE STEP ---
    if (step === 3) { // <<< LÓGICA ESPECIAL PARA SAIR DO PASSO 3 >>>
        console.log('Tentando avançar do passo 3 para o 4...');
        if (isCreatingIntent) return false; // Não permite cliques múltiplos enquanto cria
        
        const intentCreated = await handleCreatePaymentIntent(); // Tenta criar a intenção
        
        if (intentCreated) {
            console.log('Intenção de pagamento criada, avançando para o passo 4.');
            goToNextStep(); // Avança SOMENTE se a intenção foi criada
            return true;
        } else {
            console.log('Falha ao criar intenção de pagamento. Não avançando.');
            return false; // Permanece no passo 3 se falhar
        }
    }
     // <<< LÓGICA NORMAL PARA OUTROS PASSOS >>>
    else if (step < totalSteps) {
      console.log(`useContactForm: Avançando do passo ${step} para ${step + 1}`);
      goToNextStep();
      return true;
    }
    
    // Se já está no último passo ou outra condição não tratada
    console.log(`useContactForm: Já está no último passo (${step}) ou condição não prevista.`);
    return false;
  };

  // Function to move to previous step (remains the same)
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    return goToPrevStep();
  };

  // Function to handle FINAL form submission (e.g., if needed AFTER payment)
  // This function is NOT called when moving from step 3 to 4 anymore.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("useContactForm: handleSubmit - Esta função não deveria ser chamada no fluxo atual antes do pagamento.");
    // Potentially call submitForm here AFTER successful payment if needed,
    // but currently the webhook handles the final database update.
  };

  // Function to reset the form
  const resetForm = () => {
    resetFormData();
    resetGeneratedContent();
    setStep(1);
  };

  // Function to set initial step (remains the same)
  const setInitialStep = (newStep: number) => {
    setStep(newStep);
  };

  return {
    formData,
    files,
    colorPalette,
    isSubmitting, // Still reflects submission state if used elsewhere
    step,
    totalSteps,
    generatedCopy, // Pass through
    finalContent, // Pass through
    formId, // Pass through (ID original, talvez não seja mais necessário passar)
    clientSecret, // <<< Passar o clientSecret para o componente >>>
    currentFormId, // <<< Passar o formId retornado pela API >>>
    isCreatingIntent, // <<< Passar estado de loading da API >>>
    apiError, // <<< Passar estado de erro da API >>>
    handleChange,
    handleColorChange,
    handleFileChange,
    nextStep, // Use the corrected nextStep
    prevStep,
    handleSubmit, // Keep for potential future use
    resetForm,
    setFiles,
    addColor,
    removeColor,
    setFinalContent, // Pass through
    setInitialStep,
    showSuccessMessage,
    setShowSuccessMessage
    // isAiEditing and editContent are removed as content generation was disabled
  };
};
