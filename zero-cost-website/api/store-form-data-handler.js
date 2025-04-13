// Este é um manipulador especial que captura todas as chamadas de armazenamento de dados do formulário,
// independentemente do prefixo da URL (/api/checkout/store-form-data ou /api/store-form-data).

const storeFormDataModule = require('./store-form-data');

// Exportar um middleware que encaminha a solicitação para o módulo store-form-data
module.exports = (req, res) => {
  console.log('[STORE-FORM-DATA-HANDLER] Interceptando chamada de formulário:', req.path);
  
  // Simplesmente chamar o manipulador original
  storeFormDataModule(req, res);
};