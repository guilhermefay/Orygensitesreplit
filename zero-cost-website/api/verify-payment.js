const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Exportar diretamente a função handler no formato Vercel
module.exports = async (req, res) => {
    console.log('[verify-payment Vercel Handler] Rota acessada.');

    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Pré-voo OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Apenas POST é permitido
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
    // Função auxiliar para enviar resposta JSON de erro (definida aqui dentro)
    const sendErrorResponse = (statusCode, internalMessage, userMessage, errorDetails = null) => {
        console.error(`[verify-payment Handler] Erro ${statusCode}: ${internalMessage}`, errorDetails || '');
        // Garantir que a resposta seja sempre JSON
        res.status(statusCode).json({ success: false, error: userMessage, details: errorDetails?.message || errorDetails });
    };

    let stripe;
    let supabaseClient;

    // --- INÍCIO: Inicialização dos clientes DENTRO do handler ---
    try {
        console.log('[verify-payment Handler] Verificando env vars:', {
             STRIPE_SECRET_KEY_PRESENT: !!process.env.STRIPE_SECRET_KEY,
             SUPABASE_URL_PRESENT: !!process.env.SUPABASE_URL,
             SUPABASE_SERVICE_KEY_PRESENT: !!process.env.SUPABASE_SERVICE_KEY,
             SUPABASE_KEY_PRESENT: !!process.env.SUPABASE_KEY
         });

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY não está configurada no ambiente.');
        }
        stripe = new Stripe(stripeSecretKey);
        console.log('[verify-payment Handler] Cliente Stripe inicializado.');

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        const supabaseAnonKey = process.env.SUPABASE_KEY;

        if (supabaseServiceKey && supabaseUrl) {
            supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
        } else if (supabaseAnonKey && supabaseUrl) {
            console.warn('[verify-payment Handler] ATENÇÃO: Usando SUPABASE_KEY (Anon Key).');
            supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        } else {
            throw new Error('Variáveis SUPABASE_URL e (SUPABASE_SERVICE_KEY ou SUPABASE_KEY) não configuradas.');
        }
        console.log('[verify-payment Handler] Cliente Supabase inicializado.');

    } catch (initError) {
        return sendErrorResponse(500, 'Falha na inicialização (Stripe/Supabase)', 'Erro interno de configuração do servidor.', initError);
    }
    // --- FIM: Inicialização --- 

    // --- INÍCIO: Lógica Principal --- 
    try {
        const { sessionId } = req.body || {};
        if (!sessionId) {
            console.warn('[verify-payment Handler] Tentativa de verificação sem sessionId.');
            // Erro do cliente, não usar sendErrorResponse que loga como erro interno
            return res.status(400).json({ success: false, error: 'sessionId é obrigatório.' }); 
        }
        console.log(`[verify-payment Handler] Recebido pedido para verificar sessionId: ${sessionId}`);

        // 1. Buscar a sessão do Stripe
        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId);
            console.log(`[verify-payment Handler] Sessão Stripe recuperada: Status=${session.status}, PaymentStatus=${session.payment_status}`);
        } catch (stripeError) {
            if (stripeError.type === 'StripeInvalidRequestError') {
                return sendErrorResponse(404, `Sessão Stripe não encontrada: ${sessionId}`, 'Sessão de pagamento não encontrada.', stripeError);
            }
            return sendErrorResponse(500, `Erro ao buscar sessão Stripe ${sessionId}`, 'Erro ao comunicar com o sistema de pagamento.', stripeError);
        }

        // 2. Verificar o status do pagamento
        if (session.status === 'complete' && session.payment_status === 'paid') {
            console.log(`[verify-payment Handler] Pagamento confirmado para sessionId: ${sessionId}`);
            const formId = session.metadata?.formId;
            if (!formId) {
                console.error(`[verify-payment Handler] ERRO CRÍTICO: formId não encontrado nos metadados da sessão Stripe ${sessionId}.`);
                return res.status(200).json({ success: true, warning: 'Pagamento confirmado, mas falha ao vincular ao formulário.', formId: null });
            }
            console.log(`[verify-payment Handler] formId encontrado: ${formId}. Atualizando Supabase...`);

            // 3. Atualizar o status no Supabase
            try {
                const { data, error: updateError } = await supabaseClient
                    .from('form_submissions')
                    .update({ payment_status: 'paid' })
                    .eq('id', formId)
                    .select('id');

                if (updateError) {
                    return sendErrorResponse(500, `Erro Supabase ao atualizar formId ${formId}`, 'Pagamento ok, mas falha ao atualizar BD.', updateError);
                }
                if (!data || data.length === 0) {
                    console.warn(`[verify-payment Handler] Supabase update para formId ${formId} não encontrou/atualizou registros.`);
                    return res.status(200).json({ success: true, warning: 'Pagamento ok, mas formId não encontrado no BD.', formId: formId });
                }
                console.log(`[verify-payment Handler] Status atualizado no Supabase para formId: ${formId}.`);
                return res.status(200).json({ success: true, message: 'Pagamento verificado e status atualizado.', formId: formId });

            } catch (supabaseError) {
                return sendErrorResponse(500, `Erro inesperado na atualização Supabase formId ${formId}`, 'Erro interno ao atualizar BD.', supabaseError);
            }
        } else {
            // Pagamento não confirmado / pendente
            console.log(`[verify-payment Handler] Pagamento NÃO confirmado para sessionId: ${sessionId}. Status=${session.status}, PaymentStatus=${session.payment_status}`);
            return res.status(200).json({
                success: false,
                status: 'pending_confirmation',
                message: 'Pagamento ainda não confirmado ou pendente.',
                stripe_status: session.status,
                stripe_payment_status: session.payment_status
            });
        }
    } catch (mainLogicError) {
        // Erro GERAL inesperado não capturado pelos blocos internos
        return sendErrorResponse(500, 'Erro geral inesperado no handler /api/verify-payment', 'Ocorreu um erro inesperado.', mainLogicError);
    }
}; 