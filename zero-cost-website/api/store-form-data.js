// Importar armazenamento compartilhado e Supabase
const { formDataStorage, saveStorage } = require('./shared-storage');
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Função para gerar UUID válido
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
    
    // SOLUÇÃO MAIS ROBUSTA: Salvar diretamente no Supabase
    try {
      console.log('[SUPABASE DIRECT] Salvando dados diretamente no Supabase');
      
      // Gerar ID único para o registro
      const recordId = uuidv4();
      
      // Preparar dados para Supabase (com todos os campos obrigatórios)
      const submissionData = {
        id: recordId,
        name: formData.name || 'Sem nome',
        email: formData.email || 'sem@email.com',
        phone: formData.phone || '11999999999', // Campo obrigatório
        business: formData.business || 'Pagamento via site', // Campo obrigatório
        business_details: formData.business_details || 'Empresa do site', // Campo obrigatório
        original_form_id: formId, // Armazenar o ID original do formulário
        payment_status: 'pending', // Iniciar como pendente
        selected_plan: plan || 'monthly'
      };
      
      console.log('[SUPABASE DIRECT] Dados a inserir:', JSON.stringify(submissionData));
      
      const { data, error } = await supabaseClient
        .from('form_submissions')
        .insert(submissionData)
        .select();
        
      if (error) {
        console.error('[SUPABASE DIRECT] Erro ao salvar direto no Supabase:', error);
      } else {
        console.log('[SUPABASE DIRECT] Dados salvos com sucesso direto no Supabase:', data);
      }
    } catch (supabaseError) {
      console.error('[SUPABASE DIRECT] Exceção ao salvar direto no Supabase:', supabaseError);
    }
    
    return res.status(200).json({ success: true, message: 'Dados armazenados temporariamente' });
  } catch (error) {
    console.error('[FORM STORAGE] Erro:', error);
    return res.status(500).json({ error: 'Erro ao armazenar dados' });
  }
};