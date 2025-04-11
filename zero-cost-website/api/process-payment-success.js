const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { formDataStorage, saveStorage } = require('./shared-storage');

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
    console.log("[PAYMENT PROCESS] Query recebida:", req.query);
    const { sessionId, formId, plan, test } = req.query;
    
    console.log(`[PAYMENT PROCESS] Parâmetros: sessionId=${sessionId}, formId=${formId}, plan=${plan}, test=${test}`);
    
    if (!sessionId || !formId) {
      console.log("[PAYMENT PROCESS] ERRO: sessionId ou formId ausentes");
      return res.status(400).json({ error: 'sessionId e formId são obrigatórios' });
    }
    
    // Verificar status da sessão
    console.log('[STRIPE SESSION] Recuperando sessão ID:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('[STRIPE SESSION] Detalhes da sessão:', {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      amount_total: session.amount_total,
      customer: session.customer,
      metadata: session.metadata
    });
    
    if (session.payment_status === 'paid') {
      console.log(`[PAYMENT SUCCESS] Pagamento confirmado para a sessão ${sessionId}`);
      
      // NOVA ABORDAGEM: Atualizar registro existente no Supabase com o status de pagamento
      console.log("[SUPABASE UPDATE] Atualizando registro para formId:", formId);
      
      try {
        // Função para gerar UUID válido (caso precise para o registro de fallback)
        function uuidv4() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
        
        // Buscar o registro pelo formId original
        const { data: existingRecords, error: searchError } = await supabaseClient
          .from('form_submissions')
          .select('*')
          .eq('original_form_id', formId);
          
        console.log('[SUPABASE UPDATE] Registros encontrados:', existingRecords ? existingRecords.length : 0);
        
        if (searchError) {
          console.error('[SUPABASE UPDATE] Erro ao buscar registro:', searchError);
        } else if (existingRecords && existingRecords.length > 0) {
          // Encontrou o registro, atualizar status
          const existingRecord = existingRecords[0];
          console.log('[SUPABASE UPDATE] Registro encontrado:', existingRecord.id);
          
          const { data: updateData, error: updateError } = await supabaseClient
            .from('form_submissions')
            .update({
              payment_status: 'paid',
              payment_id: sessionId,
              payment_date: new Date().toISOString()
            })
            .eq('id', existingRecord.id)
            .select();
            
          if (updateError) {
            console.error('[SUPABASE UPDATE] Erro ao atualizar status:', updateError);
          } else {
            console.log('[SUPABASE UPDATE] Status atualizado com sucesso:', updateData);
          }
        } else {
          // Não encontrou o registro, verificar armazenamento local
          console.log('[SUPABASE UPDATE] Registro não encontrado no Supabase, verificando armazenamento local');
          
          if (formDataStorage[formId]) {
            // Tentar criar um novo registro a partir dos dados locais
            const storedData = formDataStorage[formId];
            const { formData } = storedData;
            
            const fallbackData = {
              id: uuidv4(),
              name: formData.name || 'Pagamento de recuperação',
              email: formData.email || 'recuperacao@pagamento.com',
              phone: formData.phone || '11999999999',
              business: formData.business || 'Empresa recuperada',
              business_details: formData.business_details || 'Detalhes recuperados',
              original_form_id: formId,
              payment_status: 'paid',
              payment_id: sessionId,
              payment_date: new Date().toISOString(),
              selected_plan: plan
            };
            
            const { data, error } = await supabaseClient
              .from('form_submissions')
              .insert(fallbackData)
              .select();
              
            if (error) {
              console.error('[SUPABASE UPDATE] Erro ao inserir dados de recuperação:', error);
            } else {
              console.log('[SUPABASE UPDATE] Dados de recuperação salvos com sucesso:', data);
            }
            
            // Limpar dados temporários
            delete formDataStorage[formId];
            saveStorage();
          } else {
            // Último recurso: criar um registro mínimo
            console.log('[SUPABASE UPDATE] Nenhum dado disponível, criando registro mínimo');
            
            const minimalData = {
              id: uuidv4(),
              name: 'Pagamento sem dados',
              email: 'pagamento@semformulario.com',
              phone: '11999999999',
              business: 'Pagamento direto',
              business_details: 'Pagamento direto sem formulário',
              payment_status: 'paid',
              payment_id: sessionId,
              payment_date: new Date().toISOString(),
              selected_plan: plan
            };
            
            const { data, error } = await supabaseClient
              .from('form_submissions')
              .insert(minimalData)
              .select();
              
            if (error) {
              console.error('[SUPABASE UPDATE] Erro ao salvar dados mínimos:', error);
            } else {
              console.log('[SUPABASE UPDATE] Dados mínimos salvos com sucesso:', data);
            }
          }
        }
      } catch (dbError) {
        console.error('[SUPABASE UPDATE] Erro ao processar atualização:', dbError);
      }
      
      // Redirecionar para página de sucesso com confetes e incluir todos os parâmetros importantes
      return res.redirect(`/success?plan=${plan}&sessionId=${sessionId}&formId=${formId}`);
    } else {
      console.log(`[PAYMENT SUCCESS] Pagamento não confirmado: ${session.payment_status}`);
      return res.redirect('/?success=false');
    }
  } catch (error) {
    console.error('[PAYMENT SUCCESS] Erro:', error);
    return res.redirect('/?success=false&error=processing');
  }
};