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

    // Função auxiliar para enviar resposta JSON de erro
    const sendErrorResponse = (statusCode, internalMessage, userMessage, errorDetails = null) => {
        console.error(`[verify-payment] Erro ${statusCode}: ${internalMessage}`, errorDetails || '');
        res.status(statusCode).json({ success: false, error: userMessage, details: errorDetails?.message || errorDetails });
    };

    if (!stripe || !supabaseClient) {
        return sendErrorResponse(500, 'Stripe ou Supabase não inicializado corretamente.', 'Configuração interna do servidor incompleta.');
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        console.warn('[verify-payment] Tentativa de verificação sem sessionId.');
        // Não usar sendErrorResponse aqui pois é erro do cliente (400)
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
            // Outro erro do Stripe
            return sendErrorResponse(500, `Erro ao buscar sessão Stripe ${sessionId}`, 'Erro ao comunicar com o sistema de pagamento.', stripeError);
        }

        // 2. Verificar o status do pagamento
        if (session.status === 'complete' && session.payment_status === 'paid') {
            console.log(`[verify-payment] Pagamento confirmado para sessionId: ${sessionId}`);

            // 3. Obter o formId dos metadados
            const formId = session.metadata?.formId;
            if (!formId) {
                // Erro LÓGICO grave, mas pagamento está OK. Não retornar 500.
                console.error(`[verify-payment] ERRO CRÍTICO: formId não encontrado nos metadados da sessão Stripe ${sessionId}.`);
                return res.status(200).json({ success: true, warning: 'Pagamento confirmado, mas falha ao vincular ao formulário. Metadados ausentes.', formId: null });
            }

            console.log(`[verify-payment] formId encontrado nos metadados: ${formId}. Atualizando Supabase...`);

            // 4. Atualizar o status no Supabase
            let updateResult;
            try {
                updateResult = await supabaseClient
                    .from('form_submissions')
                    .update({ payment_status: 'paid' })
                    .eq('id', formId)
                    .select('id'); // Selecionar algo para confirmar que funcionou

                if (updateResult.error) {
                    // Erro específico do Supabase
                    return sendErrorResponse(500,
                        `Erro ao atualizar status no Supabase para formId ${formId} (Session: ${sessionId})`,
                        'Pagamento confirmado, mas falha ao atualizar registro interno.',
                        updateResult.error
                    );
                }
                
                // Verificar se algum registro foi realmente atualizado (opcional, mas bom)
                if (!updateResult.data || updateResult.data.length === 0) {
                    console.warn(`[verify-payment] Supabase update para formId ${formId} não encontrou/atualizou registros. O formId existe na tabela 'form_submissions'?`);
                    // Retornar sucesso, mas com aviso
                     return res.status(200).json({ success: true, warning: 'Pagamento confirmado, mas registro do formulário não encontrado para atualização.', formId: formId });
                }

            } catch (supabaseUpdateError) {
                // Erro inesperado durante a chamada ao Supabase
                return sendErrorResponse(500,
                    `Erro inesperado durante atualização do Supabase para formId ${formId}`,
                    'Erro interno ao atualizar status do pagamento.',
                    supabaseUpdateError
                );
            }

            console.log(`[verify-payment] Status atualizado com sucesso no Supabase para formId: ${formId}. Registros afetados: ${updateResult.data?.length}`);
            return res.status(200).json({ success: true, message: 'Pagamento verificado e status atualizado.', formId: formId });

        } else {
            // Pagamento não confirmado / pendente
            console.log(`[verify-payment] Pagamento NÃO confirmado para sessionId: ${sessionId}. Status=${session.status}, PaymentStatus=${session.payment_status}`);
            return res.status(200).json({ // Usar 200 OK, mas indicar status no corpo
                success: false,
                status: 'pending_confirmation',
                message: 'Pagamento ainda não confirmado ou pendente.',
                stripe_status: session.status,
                stripe_payment_status: session.payment_status
            });
        }

    } catch (error) {
        // Erro GERAL inesperado não capturado pelos blocos internos
        return sendErrorResponse(500, 'Erro geral inesperado no handler /api/verify-payment', 'Ocorreu um erro inesperado ao processar sua solicitação.', error);
    }
});

module.exports = router; // Exportar o router para ser usado em server.js 