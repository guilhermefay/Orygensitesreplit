const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// --- Configuração do Stripe ---
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe;
if (stripeSecretKey) {
    stripe = require('stripe')(stripeSecretKey);
    console.log('[verify-payment] Cliente Stripe inicializado.');
} else {
    console.error('[verify-payment FATAL] STRIPE_SECRET_KEY não configurada.');
    // Considerar lançar erro ou impedir inicialização se Stripe for essencial
}

// --- Configuração do Supabase (reutilizando lógica de store-form-data) ---
let supabaseClient;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_KEY; // Renomeado para consistência
const supabaseUrl = process.env.SUPABASE_URL;

if (supabaseServiceKey && supabaseUrl) {
    console.log('[verify-payment] Usando Supabase Service Role Key.');
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
} else if (supabaseAnonKey && supabaseUrl) {
    console.warn('[verify-payment] ATENÇÃO: SUPABASE_SERVICE_KEY não encontrada. Usando SUPABASE_KEY (Anon Key). Permissões de atualização podem ser insuficientes!');
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.error('[verify-payment FATAL] Variáveis SUPABASE_URL e (SUPABASE_SERVICE_KEY ou SUPABASE_KEY) não configuradas.');
    // Considerar lançar erro ou impedir inicialização
}

if (supabaseClient) {
    console.log('[verify-payment] Cliente Supabase inicializado.');
}

const router = express.Router();

router.post('/', async (req, res) => {
    // Habilitar CORS para esta rota específica também
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (!stripe || !supabaseClient) {
        console.error('[verify-payment] Stripe ou Supabase não inicializado corretamente.');
        return res.status(500).json({ error: 'Configuração interna do servidor incompleta.' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        console.warn('[verify-payment] Tentativa de verificação sem sessionId.');
        return res.status(400).json({ error: 'sessionId é obrigatório.' });
    }

    console.log(`[verify-payment] Recebido pedido para verificar sessionId: ${sessionId}`);

    try {
        // 1. Buscar a sessão do Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log(`[verify-payment] Sessão Stripe recuperada: Status=${session.status}, PaymentStatus=${session.payment_status}`);

        // 2. Verificar o status do pagamento
        if (session.status === 'complete' && session.payment_status === 'paid') {
            console.log(`[verify-payment] Pagamento confirmado para sessionId: ${sessionId}`);

            // 3. Obter o formId dos metadados (ASSUMINDO que foi adicionado na criação da sessão)
            const formId = session.metadata?.formId;
            if (!formId) {
                console.error(`[verify-payment] ERRO CRÍTICO: formId não encontrado nos metadados da sessão Stripe ${sessionId}. Não é possível atualizar o Supabase.`);
                // Retornar sucesso para o frontend (pois o pagamento Stripe está OK), mas logar o erro gravemente.
                // Opcionalmente, pode retornar um erro específico se o frontend precisar saber disso.
                return res.status(200).json({ success: true, message: 'Pagamento confirmado, mas falha ao vincular ao formulário.' });
            }

            console.log(`[verify-payment] formId encontrado nos metadados: ${formId}. Atualizando Supabase...`);

            // 4. Atualizar o status no Supabase
            const { data, error } = await supabaseClient
                .from('form_submissions') // Certifique-se que 'form_submissions' é o nome correto da tabela
                .update({ payment_status: 'paid' }) // Atualizar o status para 'paid'
                .eq('id', formId); // Onde o ID corresponde ao formId

            if (error) {
                console.error(`[verify-payment] Erro ao atualizar status no SupABASE para formId ${formId} (Session: ${sessionId}):`, error);
                // Novamente, pagamento Stripe está OK, mas houve falha no nosso DB.
                return res.status(500).json({ error: 'Pagamento confirmado, mas falha ao atualizar registro interno.', details: error.message });
            }

            console.log(`[verify-payment] Status atualizado com sucesso no Supabase para formId: ${formId}`);
            return res.status(200).json({ success: true, message: 'Pagamento verificado e status atualizado.' });

        } else {
            // Se o status não for 'complete' ou 'paid', informar o frontend.
            console.log(`[verify-payment] Pagamento NÃO confirmado para sessionId: ${sessionId}. Status=${session.status}, PaymentStatus=${session.payment_status}`);
            return res.status(402).json({ success: false, message: 'Pagamento não confirmado ou pendente.', status: session.status, payment_status: session.payment_status });
        }

    } catch (error) {
        console.error(`[verify-payment] Erro ao verificar sessão Stripe ${sessionId}:`, error);
        // Distinguir erros (ex: sessão não encontrada vs erro genérico)
        if (error.type === 'StripeInvalidRequestError') {
             return res.status(404).json({ error: 'Sessão de pagamento não encontrada.', details: error.message });
        }
        return res.status(500).json({ error: 'Erro interno ao verificar pagamento.', details: error.message });
    }
});

module.exports = router; // Exportar o router para ser usado em server.js 