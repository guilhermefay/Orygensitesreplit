const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Tratar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { sessionId, formId } = req.query;
    
    console.log('[SUPABASE CHECK] Parâmetros recebidos:', { sessionId, formId });
    
    let query = supabaseClient.from('form_submissions').select('*');
    
    if (sessionId) {
      console.log('[SUPABASE CHECK] Buscando por sessionId:', sessionId);
      query = query.eq('payment_id', sessionId);
    } else if (formId) {
      console.log('[SUPABASE CHECK] Buscando por formId:', formId);
      query = query.eq('original_form_id', formId);
    } else {
      // Se não temos ID específico, buscar os últimos 5 registros
      query = query.order('created_at', { ascending: false }).limit(5);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[SUPABASE CHECK] Erro ao buscar dados:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('[SUPABASE CHECK] Registros encontrados:', data ? data.length : 0);
    
    // Retornar dados sanitizados (sem informações sensíveis)
    return res.json({ 
      success: true, 
      count: data ? data.length : 0,
      data: data?.map(item => ({
        id: item.id,
        business: item.business,
        created_at: item.created_at,
        payment_status: item.payment_status,
        payment_id: item.payment_id,
        payment_date: item.payment_date,
        original_form_id: item.original_form_id,
        selected_plan: item.selected_plan
      }))
    });
  } catch (error) {
    console.error('[SUPABASE CHECK] Erro inesperado:', error);
    return res.status(500).json({ error: error.message });
  }
};