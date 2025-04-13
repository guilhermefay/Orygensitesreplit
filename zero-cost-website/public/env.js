// Este arquivo injetará as variáveis de ambiente necessárias no frontend
window.ENV = {
  VITE_STRIPE_PUBLIC_KEY: '{{VITE_STRIPE_PUBLIC_KEY}}' // Será substituído pelo servidor
};