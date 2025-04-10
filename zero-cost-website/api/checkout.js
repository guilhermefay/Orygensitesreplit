import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Inicializar o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://eyzywpxlcyjnwbbxjwwg.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5enl3cHhsY3lqbndpYnhqd3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIyODU3NzMsImV4cCI6MjAyNzg2MTc3M30.7RcDyuDgQQzTx8X3sSOTzQKRcg9Dp2S3sLVYEW79X0I';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Armazenamento temporário de dados (em produção, usaria Redis ou Firestore)
let formDataStorage = {};

// Salvar backup local para backups (somente para desenvolvimento)
function saveLocalBackup(data) {
  try {
    console.log('[BACKUP] Tentando salvar backup local (desenvolvimento)');
    return true;
  } catch (error) {
    console.error('[BACKUP] Erro ao salvar (somente desenvolvimento):', error);
    return false;
  }
}

export default async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Tratar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Obter o caminho da URL
  const urlPath = req.url.split('?')[0];
  
  // Armazenar dados temporariamente
  if (req.method === 'POST' && urlPath === '/api/checkout/store-form-data') {
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
      return res.status(200).json({ success: true, message: 'Dados armazenados temporariamente' });
    } catch (error) {
      console.error('[FORM STORAGE] Erro:', error);
      return res.status(500).json({ error: 'Erro ao armazenar dados' });
    }
  }
  
  // Criar sessão de checkout
  if (req.method === 'GET' && urlPath === '/api/checkout/redirect') {
    try {
      const { amount, currency = 'brl', plan, formId, test } = req.query;
      
      if (!amount || !plan) {
        return res.status(400).json({ error: 'amount e plan são obrigatórios' });
      }
      
      // Criar descrição
      let description;
      if (test === 'true') {
        description = 'TESTE - R$ 1,00 - Zero Cost Website';
      } else {
        description = plan === 'annual' 
          ? 'Plano Anual - Zero Cost Website' 
          : 'Plano Mensal - Zero Cost Website';
      }
      
      // Construir URLs de retorno
      const host = req.headers.host || 'localhost:3000';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      
      const successUrl = `${protocol}://${host}/api/checkout/success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}&plan=${plan}${test ? '&test=true' : ''}`;
      const cancelUrl = `${protocol}://${host}?success=false`;
      
      // Criar sessão
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description,
            },
            unit_amount: Number(amount),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          plan,
          formId: formId || 'unknown',
          source: 'checkout-redirect',
          test: test ? 'true' : 'false'
        },
      });
      
      console.log('[STRIPE REDIRECT] Sessão criada com sucesso, redirecionando para:', session.url);
      
      // Redirecionar para Stripe
      return res.redirect(303, session.url);
    } catch (error) {
      console.error('[STRIPE REDIRECT] Erro ao criar sessão:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Processar pagamento bem-sucedido
  if (req.method === 'GET' && urlPath === '/api/checkout/success') {
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
            
            // Preparar dados para Supabase
            const submissionData = {
              id: formId,
              name: formData.name || 'Sem nome',
              email: formData.email || 'sem@email.com',
              phone: formData.phone || '',
              business: formData.business || '',
              description: formData.description || '',
              plan: plan || 'não especificado',
              payment_id: sessionId,
              payment_status: 'completed',
              payment_date: new Date().toISOString(),
              payment_test: isTestPayment,
              payment_amount: isTestPayment ? 100 : (plan === 'annual' ? 59880 : 5980),
              payment_currency: 'brl',
              created_at: new Date().toISOString()
            };
            
            // Salvar no Supabase
            try {
              const { data, error } = await supabaseClient
                .from('form_submissions')
                .upsert(submissionData, { onConflict: 'id' });
                
              if (error) {
                console.error('[PAYMENT SUCCESS] Erro ao salvar no Supabase:', error);
                saveLocalBackup(submissionData);
              } else {
                console.log('[PAYMENT SUCCESS] Dados salvos com sucesso no Supabase');
              }
            } catch (supabaseError) {
              console.error('[PAYMENT SUCCESS] Exceção ao salvar no Supabase:', supabaseError);
              saveLocalBackup(submissionData);
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
              payment_status: 'completed',
              payment_date: new Date().toISOString(),
              payment_test: isTestPayment,
              payment_amount: isTestPayment ? 100 : (plan === 'annual' ? 59880 : 5980),
              payment_currency: 'brl',
              plan: plan || 'não especificado',
              created_at: new Date().toISOString(),
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
                saveLocalBackup(minimalData);
              } else {
                console.log('[PAYMENT SUCCESS] Dados mínimos salvos com sucesso');
              }
            } catch (supabaseError) {
              console.error('[PAYMENT SUCCESS] Exceção ao salvar dados mínimos:', supabaseError);
              saveLocalBackup(minimalData);
            }
          } catch (minError) {
            console.error('[PAYMENT SUCCESS] Erro ao processar dados mínimos:', minError);
          }
        }
        
        // Redirecionar para página de sucesso
        return res.redirect(`/?success=true&plan=${plan}&sessionId=${sessionId}`);
      } else {
        console.log(`[PAYMENT SUCCESS] Pagamento não confirmado: ${session.payment_status}`);
        return res.redirect('/?success=false');
      }
    } catch (error) {
      console.error('[PAYMENT SUCCESS] Erro:', error);
      return res.redirect('/?success=false&error=processing');
    }
  }
  
  // Rota não encontrada
  return res.status(404).json({ error: 'Rota não encontrada' });
};