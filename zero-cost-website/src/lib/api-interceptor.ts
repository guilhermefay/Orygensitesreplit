/**
 * API Request Interceptor
 * Este arquivo intercepta todas as chamadas fetch() para logar detalhes
 * e nos ajudar a depurar problemas com chamadas de API
 */

// Armazenar a referência original do fetch
const originalFetch = window.fetch;

// Substituir o fetch global com nossa versão instrumentada
window.fetch = async function interceptedFetch(input: RequestInfo | URL, init?: RequestInit) {
  // Extrair a URL e método para logging
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method || 'GET';
  
  // Capturar informações sobre o stack trace
  const stackError = new Error();
  const stack = stackError.stack || '';
  
  // Log detalhado da chamada de API
  console.log(`🔍 [API INTERCEPTOR] ${method} ${url}`, {
    timestamp: new Date().toISOString(),
    headers: init?.headers,
    body: init?.body ? (
      typeof init.body === 'string' ? JSON.parse(init.body) : init.body
    ) : null,
    stack: stack.split('\n').slice(2, 8).join('\n')  // Mostrar apenas parte relevante do stack
  });

  // Processar a chamada real
  try {
    const response = await originalFetch(input, init);
    
    // Clone a resposta para não consumir o body
    const clonedResponse = response.clone();
    
    // Tentativa de extrair o corpo da resposta para logar
    let responseBody = null;
    try {
      if (clonedResponse.headers.get('content-type')?.includes('application/json')) {
        responseBody = await clonedResponse.json();
      }
    } catch (e) {
      console.log(`[API INTERCEPTOR] Não foi possível ler o corpo da resposta: ${e}`);
    }

    // Log da resposta
    console.log(`✅ [API INTERCEPTOR] Resposta ${response.status} para ${method} ${url}`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()]),
      body: responseBody
    });

    return response;
  } catch (error) {
    // Log de erros
    console.error(`❌ [API INTERCEPTOR] Erro em ${method} ${url}:`, error);
    throw error;
  }
};

export default {}; // Exportar um valor padrão para poder importar este arquivo