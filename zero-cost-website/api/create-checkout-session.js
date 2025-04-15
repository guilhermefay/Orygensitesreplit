const Stripe = require('stripe');
const { v4: uuidv4 } = require('uuid'); // Para gerar formId se necessário

// Inicializar o Stripe com a chave secreta do ambiente
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Função auxiliar para obter a URL base da aplicação
function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

module.exports = async (req, res) => {
  // Habilitar CORS para desenvolvimento e produção (ajuste conforme necessário)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ou especifique a origem do seu frontend
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { plan = 'monthly', amount = 4990, currency = 'brl', formId: providedFormId } = req.body; // Valores default

      // Garante que temos um formId
      const formId = providedFormId || uuidv4();

      // Definir descrição e valor com base no plano
      let description = 'Orygen Sites - Plano Mensal';
      // let unitAmount = 4990; // R$ 49,90 em centavos
      // if (plan === 'annual') {
      //   description = 'Orygen Sites - Plano Anual';
      //   unitAmount = 59880; // R$ 598,80 em centavos (ajuste se necessário)
      // }
      
      // --- VALOR FIXO PARA TESTE --- 
      let unitAmount = 100; // R$ 1,00 em centavos - APENAS PARA TESTE
      description = `TESTE - ${plan === 'annual' ? 'Plano Anual' : 'Plano Mensal'} (R$ 1,00)`;
      // --- FIM VALOR FIXO --- 

      // TODO: Adicionar lógica para buscar o preço do Stripe Product/Price ID se preferir

      const baseUrl = getBaseUrl(req);
      const successUrl = `${baseUrl}/payment-success?sessionId={CHECKOUT_SESSION_ID}&formId=${formId}`;
      const cancelUrl = `${baseUrl}/#contact`; // Volta para a seção de contato

      // Criar sessão de Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'boleto'], // Adicione 'pix' se ativado
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: description,
                // Você pode adicionar mais detalhes do produto aqui se quiser
                // images: ['url_da_imagem_do_produto'],
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          plan: plan,
          formId: formId, // Passa o formId para o webhook
        },
        // Configurações específicas do Brasil
        locale: 'pt-BR',
        billing_address_collection: 'required', // Coleta endereço de cobrança
        // Configuração para Boleto (opcional, ajuste os dias)
        payment_method_options: {
          boleto: {
            expires_after_days: 3,
          },
        },
        // Permite códigos promocionais se configurado no Stripe
        allow_promotion_codes: true,
        // Tenta preencher o email do cliente se ele já comprou antes
        // customer_email: req.body.email || undefined, // Passe o email do form se tiver
      });

      console.log(`[Checkout Session] Criada sessão ${session.id} para formId ${formId}`);

      // Retorna o ID da sessão para redirecionamento no frontend
      // Alternativamente, poderia retornar session.url, mas retornar o ID é mais flexível
      // para usar com stripe.redirectToCheckout(sessionId) no frontend.
      res.status(200).json({ sessionId: session.id });

    } catch (error) {
      console.error('[Create Checkout Session] Erro:', error);
      res.status(500).json({ error: { message: error.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}; 