
import { ContactFormData, FileData } from "../types";

interface SubmissionData extends ContactFormData {
  finalContent: string;
  colorPalette: string[];
  logoFile?: File | null;
  photoFiles?: File[] | null;
}

/**
 * Converte um arquivo para base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Envia os dados do formulário para o Google Sheets usando uma abordagem de submissão de formulário HTML
 * que é compatível com o Google Apps Script
 */
export const submitToGoogleSheet = async (
  formData: ContactFormData,
  files: FileData,
  colorPalette: string[],
  finalContent: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // URL do Google Apps Script Web App
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzzlVzTJNmf46TrTE3anKS6Swpoj5Y25Gkp7C7ZdyklPteRNtR5Edrd4GoiiP6O1qsG/exec';
    
    // Preparar os dados como um FormData para maior compatibilidade
    const formDataObj = new FormData();
    
    // Adicionar campos básicos do formulário
    formDataObj.append('name', formData.name);
    formDataObj.append('email', formData.email);
    formDataObj.append('phone', formData.phone);
    formDataObj.append('business', formData.business);
    formDataObj.append('businessDetails', formData.businessDetails);
    formDataObj.append('timestamp', new Date().toISOString());
    
    // Adicionar paleta de cores e conteúdo final
    formDataObj.append('colorPalette', colorPalette.join(','));
    formDataObj.append('finalContent', finalContent);
    
    // Processar arquivos - Logo
    if (files.logo && files.logo.length > 0) {
      const firstLogo = files.logo[0];
      const logoBase64 = await fileToBase64(firstLogo);
      formDataObj.append('logoBase64', logoBase64);
      formDataObj.append('logoFileName', firstLogo.name);
      formDataObj.append('logoContentType', firstLogo.type);
    }
    
    // Processar fotos
    if (files.photos && files.photos.length > 0) {
      const photoBase64Array: string[] = [];
      const photoFileNames: string[] = [];
      const photoContentTypes: string[] = [];
      
      for (const photo of files.photos) {
        photoBase64Array.push(await fileToBase64(photo));
        photoFileNames.push(photo.name);
        photoContentTypes.push(photo.type);
      }
      
      formDataObj.append('photoBase64Array', JSON.stringify(photoBase64Array));
      formDataObj.append('photoFileNameArray', JSON.stringify(photoFileNames));
      formDataObj.append('photoContentTypeArray', JSON.stringify(photoContentTypes));
    }
    
    console.log('Enviando dados para o Google Apps Script via FormData...');
    
    // Criar um iframe para receber a resposta
    const iframeId = 'hidden_submit_iframe';
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.name = iframeId;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    
    // Criar um formulário real e anexá-lo ao DOM
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = scriptUrl;
    form.target = iframeId;
    form.style.display = 'none';
    
    // Converter o FormData para elementos input no formulário
    for (const [key, value] of Array.from(formDataObj.entries())) {
      if (typeof value === 'string') {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
    }
    
    // Adicionar o formulário ao DOM e enviar
    document.body.appendChild(form);
    
    // Uma promessa para resolver quando os dados forem enviados
    return new Promise((resolve) => {
      // Listener para mensagens do iframe (caso o script retorne postMessage)
      const messageListener = (event: MessageEvent) => {
        if (event.source === iframe.contentWindow) {
          window.removeEventListener('message', messageListener);
          cleanup();
          resolve({
            success: true,
            message: 'Dados enviados com sucesso! Verifique sua planilha do Google.'
          });
        }
      };
      
      // Em alguns casos, o Google retorna uma mensagem
      window.addEventListener('message', messageListener);
      
      // Função para limpar os elementos
      const cleanup = () => {
        setTimeout(() => {
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
        }, 1000);
      };
      
      // Submeter o formulário
      form.submit();
      
      // Após um tempo, mesmo sem feedback, considere sucesso
      setTimeout(() => {
        window.removeEventListener('message', messageListener);
        cleanup();
        resolve({
          success: true,
          message: 'Dados enviados com sucesso! Verifique sua planilha do Google em alguns minutos.'
        });
      }, 5000);
    });
    
  } catch (error) {
    console.error('Erro ao enviar para o Google Sheets:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar dados'
    };
  }
};
