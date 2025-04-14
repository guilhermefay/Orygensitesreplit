// Arquivo de teste para verificar se o deploy na Vercel está funcionando
module.exports = (req, res) => {
  res.json({
    message: "API funcionando corretamente!",
    timestamp: new Date().toISOString(),
    env: {
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      supabaseConfigured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_KEY,
      publicKeyConfigured: !!process.env.VITE_STRIPE_PUBLIC_KEY
    }
  });
};