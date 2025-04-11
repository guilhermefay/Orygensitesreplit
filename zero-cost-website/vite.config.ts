import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Desabilitando lovable-tagger para resolver problema de ESM
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Redirecionar solicitações /api para o servidor Express na porta 5001
      '/api': {
        target: 'http://localhost:5001',
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
}));
