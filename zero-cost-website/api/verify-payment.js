const express = require('express');

const router = express.Router();

// Handler de teste super simples
router.post('/', async (req, res) => {
    console.log('[verify-payment MINIMAL] Rota acessada.'); // Comentário para forçar novo commit
    
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    try {
        const { sessionId } = req.body;
        console.log(`[verify-payment MINIMAL] Recebido sessionId (não usado): ${sessionId}`);
        
        // Simplesmente retornar sucesso
        res.status(200).json({ 
            success: true, 
            message: 'Teste mínimo da API verify-payment OK.',
            receivedSessionId: sessionId || 'Nenhum sessionId recebido'
        });

    } catch (error) {
        // Erro inesperado neste código mínimo (improvável, mas para garantir)
        console.error('[verify-payment MINIMAL] Erro inesperado:', error);
        res.status(500).json({ success: false, error: 'Erro interno no teste mínimo.' });
    }
});

console.log('[verify-payment MINIMAL] Exportando router...');
module.exports = router; 