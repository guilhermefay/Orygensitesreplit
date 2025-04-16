// Importar createClient
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid'); // Importar uuid

// --- REMOVER ARMAZENAMENTO TEMPORÁRIO ---
// const { formDataStorage, saveStorage } = require('./shared-storage');

// Configurar cliente Supabase (usando Service Key)
let supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
let supabaseAnonKey = process.env.SUPABASE_KEY;
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseClient;

if (supabaseServiceKey && supabaseUrl) {
    console.log('[store-form-data] Usando Service Role Key.');
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
} else if (supabaseAnonKey && supabaseUrl) {
    console.warn('[store-form-data] ATENÇÃO: SUPABASE_SERVICE_KEY não encontrada. Usando SUPABASE_KEY (Anon Key). Permissões podem ser insuficientes!');
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.error('[store-form-data FATAL] Variáveis SUPABASE_URL e (SUPABASE_SERVICE_KEY ou SUPABASE_KEY) não configuradas.');
    throw new Error('Configuração inválida do Supabase para store-form-data.'); 
}

console.log('[store-form-data] Cliente Supabase inicializado.');

// --- REMOVER FUNÇÃO UUID ANTIGA (usar import) ---
/*
function uuidv4() {
  // ...
}
*/

module.exports = async (req, res) => {
  // Habilitar CORS (manter)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Tratar preflight request (manter)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar POST (manter)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extrair apenas os dados necessários do body
    const { formData, plan } = req.body;

    // Validar dados básicos recebidos (opcional mas recomendado)
    if (!formData || !formData.name || !formData.email || !formData.phone || !plan) {
        console.warn('[store-form-data] Dados incompletos recebidos:', req.body);
        return res.status(400).json({ error: 'Dados incompletos: nome, email, telefone e plano são obrigatórios.' });
    }
    
    // --- REMOVER LÓGICA DE ARMAZENAMENTO TEMPORÁRIO ---
    /*
    const { formId, files, colorPalette, finalContent } = req.body;
    if (!formId) { ... }
    formDataStorage[formId] = { ... };
    console.log(`[FORM STORAGE] Dados temporários armazenados para formId: ${formId}`);
    saveStorage();
    */
    
    // Gerar ID único para o registro ANTES de inserir
    const newRecordId = uuidv4();

    // Salvar diretamente no Supabase
    console.log('[store-form-data] Tentando inserir no Supabase com ID:', newRecordId);
    
    // Preparar dados para Supabase
    const submissionData = {
      id: newRecordId, // Usar o UUID gerado como ID primário
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      business: formData.business || 'Não informado', // Adicionar fallbacks se necessário
      business_details: formData.businessDetails || 'Não informado',
      // original_form_id: formId, // Remover se não estiver mais usando o formId pré-gerado
      payment_status: 'pending_payment', // Status inicial claro
      selected_plan: plan
      // Adicionar created_at automaticamente pelo Supabase se a coluna tiver default value
    };
    
    console.log('[store-form-data] Dados a inserir:', JSON.stringify(submissionData));
    
    const { data, error } = await supabaseClient
      .from('form_submissions')
      .insert(submissionData)
      .select('id'); // Selecionar apenas o ID para confirmar
      
    if (error) {
      console.error('[store-form-data] Erro ao inserir no Supabase:', error);
      // Retornar erro 500 para o frontend saber que falhou
      return res.status(500).json({ error: 'Falha ao salvar dados iniciais.', details: error.message });
    } else {
      console.log('[store-form-data] Dados inseridos com sucesso no Supabase. ID:', newRecordId);
      // Retornar sucesso e o ID do registro criado
      return res.status(200).json({ success: true, formId: newRecordId });
    }

  } catch (error) {
    console.error('[store-form-data] Erro inesperado:', error);
    return res.status(500).json({ error: 'Erro interno ao processar dados.' });
  }
};