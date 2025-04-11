const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('[SUPABASE TEST] URL:', supabaseUrl);
console.log('[SUPABASE TEST] Key length:', supabaseKey ? supabaseKey.length : 'não definida');

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Gerar um UUID válido para o ID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testInsert() {
  try {
    console.log('[SUPABASE TEST] Iniciando teste de inserção direta');
    
    // Dados de teste com todos os campos obrigatórios
    const testData = {
      id: uuidv4(), 
      name: 'Teste Supabase Direto',
      email: 'teste@supabase.com',
      phone: '11999999999', // Campo obrigatório
      business: 'Teste Empresa Direto', // Campo obrigatório
      business_details: 'Detalhes da empresa de teste direto' // Campo obrigatório
    };

    console.log('[SUPABASE TEST] Dados a inserir:', JSON.stringify(testData));

    // Tentativa de inserção
    const { data, error } = await supabaseClient
      .from('form_submissions')
      .insert(testData)
      .select();

    if (error) {
      console.error('[SUPABASE TEST] Erro ao inserir:', error);
      return;
    }

    console.log('[SUPABASE TEST] Inserção bem-sucedida:', data);
  } catch (err) {
    console.error('[SUPABASE TEST] Exceção:', err);
  }
}

testInsert();