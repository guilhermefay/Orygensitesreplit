/**
 * API Request Interceptor
 * Este arquivo intercepta todas as chamadas fetch() para logar detalhes
 * e nos ajudar a depurar problemas com chamadas de API
 * 
 * Também inclui um mecanismo de redirecionamento para redirecionar rotas antigas
 * para novas rotas, garantindo compatibilidade e evitando erros 404.
 */

// Sinalizar que o interceptor está ativo
console.log('🚀 INTERCEPTOR: Inicializado e ativo');

// Armazenar a referência original do fetch
const originalFetch = window.fetch;

// Mapa de redirecionamento de URLs - adicionar aqui qualquer URL antiga que deve ser redirecionada
const URL_REDIRECTS = {
  '/api/checkout/store-form-data': '/api/store-form-data'
};

// Testar o interceptor imediatamente
console.log('🧪 INTERCEPTOR: Teste de correspondência: ', {
  '/api/checkout/store-form-data': URL_REDIRECTS['/api/checkout/store-form-data'] || 'Não mapeado',
  '/api/checkout/store-form-data/': URL_REDIRECTS['/api/checkout/store-form-data/'] || 'Não mapeado',
  '/api/store-form-data': URL_REDIRECTS['/api/store-form-data'] || 'Não mapeado',
});

// Substituir o fetch global com nossa versão instrumentada
window.fetch = async function interceptedFetch(input: RequestInfo | URL, init?: RequestInit) {
  // Extrair a URL original para logging e possível redirecionamento
  let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method || 'GET';
  
  // Verificar se esta URL precisa ser redirecionada
  const originalUrl = url;
  
  // Primeiro verificar correspondência exata
  let needsRedirect = false;
  let newUrl = '';
  
  // Verificar se a URL está no mapa de redirecionamentos
  if (URL_REDIRECTS[url]) {
    needsRedirect = true;
    newUrl = URL_REDIRECTS[url];
  } 
  // Checar também com uma barra no final (alguns navegadores/frameworks adicionam automaticamente)
  else if (url.endsWith('/') && URL_REDIRECTS[url.slice(0, -1)]) {
    needsRedirect = true;
    newUrl = URL_REDIRECTS[url.slice(0, -1)];
  }
  // Ou sem barra no final
  else if (!url.endsWith('/') && URL_REDIRECTS[url + '/']) {
    needsRedirect = true;
    newUrl = URL_REDIRECTS[url + '/'];
  }
  
  console.log(`🔎 [API INTERCEPTOR] Checagem de URL: ${url} - Precisa redirecionar: ${needsRedirect ? 'SIM' : 'NÃO'}`);
  
  if (needsRedirect) {
    console.log(`⚠️ [API INTERCEPTOR] Redirecionando chamada de ${url} para ${newUrl}`);
    
    // Atualizar a URL de entrada com base no tipo
    if (typeof input === 'string') {
      input = newUrl;
    } else if (input instanceof URL) {
      input = new URL(newUrl, input.origin);
    } else {
      input = new Request(newUrl, input);
    }
    
    // Atualizar a URL para logging
    url = newUrl;
  }
  
  // Capturar informações sobre o stack trace
  const stackError = new Error();
  const stack = stackError.stack || '';
  
  // Log detalhado da chamada de API
  console.log(`🔍 [API INTERCEPTOR] ${method} ${url}${originalUrl !== url ? ` (redirecionado de ${originalUrl})` : ''}`, {
    timestamp: new Date().toISOString(),
    headers: init?.headers,
    body: init?.body ? (
      typeof init.body === 'string' ? 
        (init.body.startsWith('{') ? JSON.parse(init.body) : init.body) : 
        init.body
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