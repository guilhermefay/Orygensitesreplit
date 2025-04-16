// Exportar diretamente a função handler no formato Vercel
module.exports = async (req, res) => {
    console.log('[verify-payment PURE HANDLER] Rota acessada.');

    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Pré-voo OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Apenas POST é permitido para este teste
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { sessionId } = req.body || {}; // Usar req.body
        console.log(`[verify-payment PURE HANDLER] Recebido sessionId (não usado): ${sessionId}`);

        // Simplesmente retornar sucesso
        res.status(200).json({ 
            success: true, 
            message: 'Teste com handler Vercel puro OK.',
            receivedSessionId: sessionId || 'Nenhum sessionId recebido'
        });

    } catch (error) {
        console.error('[verify-payment PURE HANDLER] Erro inesperado:', error);
        res.status(500).json({ success: false, error: 'Erro interno no teste com handler puro.' });
    }
}; 