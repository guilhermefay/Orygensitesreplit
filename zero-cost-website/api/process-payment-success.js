const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { formDataStorage } = require('./store-form-data');

// Inicializar o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Log para depuração
console.log(`[SUPABASE CONFIG] URL configurada: ${supabaseUrl ? 'Sim' : 'Não'}`);
console.log(`[SUPABASE CONFIG] Key configurada: ${supabaseKey ? 'Sim' : 'Não'}`);
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
    const { sessionId, formId, plan, test } = req.query;
    
    if (!sessionId || !formId) {
      return res.status(400).json({ error: 'sessionId e formId são obrigatórios' });
    }
    
    // Verificar status da sessão
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      console.log(`[PAYMENT SUCCESS] Pagamento confirmado para a sessão ${sessionId}`);
      
      // Verificar dados armazenados
      if (formDataStorage[formId]) {
        const storedData = formDataStorage[formId];
        
        try {
          // Extrair dados
          const { formData } = storedData;
          const isTestPayment = test === 'true';
          
          // Preparar dados para Supabase (campos simplificados)
          const submissionData = {
            id: formId,
            name: formData.name || 'Sem nome',
            email: formData.email || 'sem@email.com',
            business: formData.business || '',
            payment_id: sessionId,
            payment_date: new Date().toISOString(),
            payment_test: isTestPayment,
            payment_amount: isTestPayment ? 100 : (plan === 'annual' ? 59880 : 5980),
            payment_currency: 'brl'
          };
          
          // Salvar no Supabase
          try {
            const { data, error } = await supabaseClient
              .from('form_submissions')
              .upsert(submissionData, { onConflict: 'id' });
              
            if (error) {
              console.error('[PAYMENT SUCCESS] Erro ao salvar no Supabase:', error);
            } else {
              console.log('[PAYMENT SUCCESS] Dados salvos com sucesso no Supabase');
            }
          } catch (supabaseError) {
            console.error('[PAYMENT SUCCESS] Exceção ao salvar no Supabase:', supabaseError);
          }
          
          // Limpar dados temporários
          delete formDataStorage[formId];
        } catch (dbError) {
          console.error('[PAYMENT SUCCESS] Erro ao processar dados:', dbError);
        }
      } else {
        // Caso de pagamento sem dados temporários
        console.log(`[PAYMENT SUCCESS] Nenhum dado temporário para formId: ${formId}`);
        
        try {
          const isTestPayment = test === 'true';
          
          const minimalData = {
            id: formId, 
            payment_id: sessionId,
            payment_date: new Date().toISOString(),
            payment_test: isTestPayment,
            payment_amount: isTestPayment ? 100 : (plan === 'annual' ? 59880 : 5980),
            payment_currency: 'brl',
            name: 'Pagamento sem dados', 
            email: 'pagamento@semformulario.com'
          };
          
          // Tentar salvar dados mínimos
          try {
            const { error } = await supabaseClient
              .from('form_submissions')
              .upsert(minimalData, { onConflict: 'id' });
              
            if (error) {
              console.error('[PAYMENT SUCCESS] Erro ao salvar dados mínimos:', error);
            } else {
              console.log('[PAYMENT SUCCESS] Dados mínimos salvos com sucesso');
            }
          } catch (supabaseError) {
            console.error('[PAYMENT SUCCESS] Exceção ao salvar dados mínimos:', supabaseError);
          }
        } catch (minError) {
          console.error('[PAYMENT SUCCESS] Erro ao processar dados mínimos:', minError);
        }
      }
      
      // Redirecionar para página de sucesso com confetes
      return res.redirect(`/success?plan=${plan}&sessionId=${sessionId}`);
    } else {
      console.log(`[PAYMENT SUCCESS] Pagamento não confirmado: ${session.payment_status}`);
      return res.redirect('/?success=false');
    }
  } catch (error) {
    console.error('[PAYMENT SUCCESS] Erro:', error);
    return res.redirect('/?success=false&error=processing');
  }
};