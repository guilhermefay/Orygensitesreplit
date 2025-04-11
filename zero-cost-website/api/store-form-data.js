// Importar armazenamento compartilhado
const { formDataStorage, saveStorage } = require('./shared-storage');

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Tratar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { formId, formData, files, colorPalette, finalContent, plan } = req.body;
    
    if (!formId) {
      return res.status(400).json({ error: 'formId é obrigatório' });
    }
    
    // Armazenar temporariamente
    formDataStorage[formId] = {
      formData,
      files,
      colorPalette,
      finalContent,
      plan,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[FORM STORAGE] Dados temporários armazenados para formId: ${formId}`);
    
    // Salvar no arquivo
    saveStorage();
    
    return res.status(200).json({ success: true, message: 'Dados armazenados temporariamente' });
  } catch (error) {
    console.error('[FORM STORAGE] Erro:', error);
    return res.status(500).json({ error: 'Erro ao armazenar dados' });
  }
};