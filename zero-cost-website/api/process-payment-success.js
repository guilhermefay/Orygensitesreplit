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
          
          // Função para gerar UUID válido
          function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          }
          
          // Preparar dados para Supabase (com campos obrigatórios)
          const submissionData = {
            id: uuidv4(), // Usar UUID em vez do formId
            name: formData.name || 'Sem nome',
            email: formData.email || 'sem@email.com',
            phone: formData.phone || '11999999999', // Campo obrigatório
            business: formData.business || 'Pagamento via site' // Campo obrigatório (não business_name)
          };
          
          // Salvar no Supabase
          try {
            console.log('[SUPABASE DEBUG] Tentando salvar dados:', JSON.stringify(submissionData));
            console.log('[SUPABASE DEBUG] URL Supabase:', process.env.SUPABASE_URL);
            console.log('[SUPABASE DEBUG] Comprimento da chave:', process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 'não definida');
            console.log('[SUPABASE DEBUG] Tabela alvo:', 'form_submissions');
            
            const { data, error } = await supabaseClient
              .from('form_submissions')
              .upsert(submissionData, { onConflict: 'id' });
              
            if (error) {
              console.error('[PAYMENT SUCCESS] Erro ao salvar no Supabase:', error);
            } else {
              console.log('[PAYMENT SUCCESS] Dados salvos com sucesso no Supabase:', data);
            }
          } catch (supabaseError) {
            console.error('[PAYMENT SUCCESS] Exceção ao salvar no Supabase:', supabaseError);
            console.error('[PAYMENT SUCCESS] Detalhes do erro:', supabaseError.message);
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
          
          // Reuse function uuidv4 from above
          const minimalData = {
            id: uuidv4(), // Usando UUID para garantir compatibilidade
            name: 'Pagamento sem dados', 
            email: 'pagamento@semformulario.com',
            phone: '11999999999', // Campo obrigatório
            business: 'Pagamento direto' // Campo obrigatório
          };
          
          // Tentar salvar dados mínimos
          try {
            console.log('[SUPABASE DEBUG MINIMALDATA] Tentando salvar dados mínimos:', JSON.stringify(minimalData));
            
            const { data, error } = await supabaseClient
              .from('form_submissions')
              .upsert(minimalData, { onConflict: 'id' });
              
            if (error) {
              console.error('[PAYMENT SUCCESS] Erro ao salvar dados mínimos:', error);
            } else {
              console.log('[PAYMENT SUCCESS] Dados mínimos salvos com sucesso:', data);
            }
          } catch (supabaseError) {
            console.error('[PAYMENT SUCCESS] Exceção ao salvar dados mínimos:', supabaseError);
            console.error('[PAYMENT SUCCESS] Detalhes do erro mínimo:', supabaseError.message);
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