import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Desabilitando lovable-tagger para resolver problema de ESM
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega a variável de ambiente do processo de build (onde a Vercel a define)
  const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY || ''; // Usa string vazia como fallback
  console.log(`[vite.config.ts] VITE_STRIPE_PUBLIC_KEY read during build: ${stripePublicKey ? 'Found' : 'NOT FOUND'}`);

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      proxy: {
        // Redirecionar solicitações /api para o servidor Express na porta 5000
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      },
    },
    plugins: [
      react(),
      // Desabilitado: componentTagger (problema de ESM) 
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Substitui explicitamente import.meta.env.VITE_STRIPE_PUBLIC_KEY no código do frontend
      // JSON.stringify é necessário para que o valor seja inserido como uma string no código
      'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(stripePublicKey),
    },
  };
});
