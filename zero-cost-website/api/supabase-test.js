const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Log para depuração
console.log('[SUPABASE TEST] URL:', supabaseUrl);
console.log('[SUPABASE TEST] Key length:', supabaseKey ? supabaseKey.length : 'não definida');

const supabaseClient = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  try {
    console.log('[SUPABASE TEST] Iniciando teste de inserção');

    // Gerar um UUID válido para o ID
    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    // Dados de teste com todos os campos obrigatórios
    const testData = {
      id: uuidv4(), 
      name: 'Teste Supabase',
      email: 'teste@supabase.com',
      phone: '11999999999', // Campo obrigatório
      business: 'Teste Empresa' // Campo obrigatório
    };

    console.log('[SUPABASE TEST] Dados a inserir:', JSON.stringify(testData));

    // Tentativa de inserção
    const { data, error } = await supabaseClient
      .from('form_submissions')
      .insert(testData)
      .select();

    if (error) {
      console.error('[SUPABASE TEST] Erro ao inserir:', error);
      return res.status(500).json({
        success: false, 
        error: error,
        message: 'Falha ao inserir no Supabase'
      });
    }

    console.log('[SUPABASE TEST] Inserção bem-sucedida:', data);
    return res.status(200).json({
      success: true,
      data: data,
      message: 'Dados inseridos com sucesso'
    });
  } catch (err) {
    console.error('[SUPABASE TEST] Exceção:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
      message: 'Erro ao testar Supabase'
    });
  }
};