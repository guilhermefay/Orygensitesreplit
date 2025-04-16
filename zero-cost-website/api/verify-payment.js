const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe'); // Apenas requerir, não inicializar aqui

// --- NÃO inicializar clientes aqui no escopo global ---
// let stripe;
// let supabaseClient;

const router = express.Router();

router.post('/', async (req, res) => {
    // Habilitar CORS para esta rota específica também
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Função auxiliar para enviar resposta JSON de erro
    const sendErrorResponse = (statusCode, internalMessage, userMessage, errorDetails = null) => {
        console.error(`[verify-payment] Erro ${statusCode}: ${internalMessage}`, errorDetails || '');
        res.status(statusCode).json({ success: false, error: userMessage, details: errorDetails?.message || errorDetails });
    };

    // --- INÍCIO: Inicialização dos clientes DENTRO do handler ---
    let stripe;
    let supabaseClient;

    try {
        // Log para verificar se as env vars estão acessíveis AQUI
        console.log('[verify-payment handler] Verificando env vars:', {
             STRIPE_SECRET_KEY_PRESENT: !!process.env.STRIPE_SECRET_KEY,
             SUPABASE_URL_PRESENT: !!process.env.SUPABASE_URL,
             SUPABASE_SERVICE_KEY_PRESENT: !!process.env.SUPABASE_SERVICE_KEY,
             SUPABASE_KEY_PRESENT: !!process.env.SUPABASE_KEY
         });

        // Inicializar Stripe
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY não está configurada no ambiente.');
        }
        stripe = new Stripe(stripeSecretKey);
        console.log('[verify-payment handler] Cliente Stripe inicializado.');

        // Inicializar Supabase
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        const supabaseAnonKey = process.env.SUPABASE_KEY;

        if (supabaseServiceKey && supabaseUrl) {
            console.log('[verify-payment handler] Usando Supabase Service Role Key.');
            supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
        } else if (supabaseAnonKey && supabaseUrl) {
            console.warn('[verify-payment handler] ATENÇÃO: SUPABASE_SERVICE_KEY não encontrada. Usando SUPABASE_KEY (Anon Key).');
            supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        } else {
            throw new Error('Variáveis SUPABASE_URL e (SUPABASE_SERVICE_KEY ou SUPABASE_KEY) não configuradas.');
        }
        console.log('[verify-payment handler] Cliente Supabase inicializado.');

    } catch (initError) {
        return sendErrorResponse(500, 'Falha na inicialização de cliente (Stripe/Supabase)', 'Erro interno de configuração do servidor.', initError);
    }
    // --- FIM: Inicialização dos clientes DENTRO do handler ---


    // --- Lógica da Rota (continua como antes, mas usa stripe/supabaseClient definidos acima) ---
    const { sessionId } = req.body;

    if (!sessionId) {
        console.warn('[verify-payment] Tentativa de verificação sem sessionId.');
        return res.status(400).json({ success: false, error: 'sessionId é obrigatório.' });
    }

    console.log(`[verify-payment] Recebido pedido para verificar sessionId: ${sessionId}`);

    try {
        // 1. Buscar a sessão do Stripe
        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId);
            console.log(`[verify-payment] Sessão Stripe recuperada: Status=${session.status}, PaymentStatus=${session.payment_status}, Metadata=${JSON.stringify(session.metadata)}`);
        } catch (stripeError) {
            if (stripeError.type === 'StripeInvalidRequestError') {
                return sendErrorResponse(404, `Sessão Stripe não encontrada: ${sessionId}`, 'Sessão de pagamento não encontrada.', stripeError);
            }
            return sendErrorResponse(500, `Erro ao buscar sessão Stripe ${sessionId}`, 'Erro ao comunicar com o sistema de pagamento.', stripeError);
        }

        // 2. Verificar o status do pagamento
        if (session.status === 'complete' && session.payment_status === 'paid') {
            console.log(`[verify-payment] Pagamento confirmado para sessionId: ${sessionId}`);

            const formId = session.metadata?.formId;
            if (!formId) {
                console.error(`[verify-payment] ERRO CRÍTICO: formId não encontrado nos metadados da sessão Stripe ${sessionId}.`);
                return res.status(200).json({ success: true, warning: 'Pagamento confirmado, mas falha ao vincular ao formulário. Metadados ausentes.', formId: null });
            }

            console.log(`[verify-payment] formId encontrado nos metadados: ${formId}. Atualizando Supabase...`);

            let updateResult;
            try {
                updateResult = await supabaseClient
                    .from('form_submissions')
                    .update({ payment_status: 'paid' })
                    .eq('id', formId)
                    .select('id');

                if (updateResult.error) {
                    return sendErrorResponse(500, `Erro ao atualizar status no Supabase para formId ${formId}`, 'Pagamento confirmado, mas falha ao atualizar registro interno.', updateResult.error);
                }

                if (!updateResult.data || updateResult.data.length === 0) {
                    console.warn(`[verify-payment] Supabase update para formId ${formId} não encontrou/atualizou registros.`);
                    return res.status(200).json({ success: true, warning: 'Pagamento confirmado, mas registro do formulário não encontrado para atualização.', formId: formId });
                }

            } catch (supabaseUpdateError) {
                return sendErrorResponse(500, `Erro inesperado durante atualização do Supabase para formId ${formId}`, 'Erro interno ao atualizar status do pagamento.', supabaseUpdateError);
            }

            console.log(`[verify-payment] Status atualizado com sucesso no Supabase para formId: ${formId}.`);
            return res.status(200).json({ success: true, message: 'Pagamento verificado e status atualizado.', formId: formId });

        } else {
            console.log(`[verify-payment] Pagamento NÃO confirmado para sessionId: ${sessionId}. Status=${session.status}, PaymentStatus=${session.payment_status}`);
            return res.status(200).json({
                success: false,
                status: 'pending_confirmation',
                message: 'Pagamento ainda não confirmado ou pendente.',
                stripe_status: session.status,
                stripe_payment_status: session.payment_status
            });
        }

    } catch (error) {
        return sendErrorResponse(500, 'Erro geral inesperado no handler /api/verify-payment', 'Ocorreu um erro inesperado ao processar sua solicitação.', error);
    }
});

module.exports = router; 