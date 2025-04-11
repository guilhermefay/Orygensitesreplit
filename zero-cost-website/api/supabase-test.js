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

    // Dados de teste - simplificados para corresponder à estrutura da tabela
    const testData = {
      id: `test-${Date.now()}`, 
      name: 'Teste Supabase',
      email: 'teste@supabase.com',
      business_name: 'Empresa de Teste',
      stripe_session_id: `test-payment-${Date.now()}`,
      created_at: new Date().toISOString()
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