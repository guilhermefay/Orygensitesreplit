/**
 * Middleware de compatibilidade para redirecionar chamadas antigas
 * da rota /api/checkout/store-form-data para o endpoint novo /api/create-payment-intent
 */

const createPaymentIntent = require('../create-payment-intent');

module.exports = async (req, res) => {
  console.log('[COMPATIBILITY] Recebida chamada para rota legada: /api/checkout/store-form-data');
  
  try {
    // Extrair os dados do formulário da requisição original
    const { formId, formData, files, colorPalette, finalContent, plan } = req.body;

    console.log('[COMPATIBILITY] Dados recebidos para formId:', formId);
    console.log('[COMPATIBILITY] Redirecionando para endpoint /api/create-payment-intent');
    
    // Criar objeto com estrutura compatível com o novo endpoint
    const newRequestBody = {
      plan: plan || formData?.selectedPlan || 'monthly',
      formData: formData || {},
      formId: formId || null,
      files: files || {},
      colorPalette: colorPalette || [],
      finalContent: finalContent || ''
    };
    
    // Modificar a requisição para que ela seja passada para a implementação do create-payment-intent
    req.body = newRequestBody;
    
    // Chamar o handler do novo endpoint
    return createPaymentIntent(req, res);
  } catch (error) {
    console.error('[COMPATIBILITY] Erro ao processar redirecionamento:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar requisição',
      message: error.message,
      compatibilityLayer: true
    });
  }
};