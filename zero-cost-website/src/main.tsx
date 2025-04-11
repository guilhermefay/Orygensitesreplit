import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Para debug do router
console.log('App inicializando na rota:', window.location.pathname);

createRoot(document.getElementById("root")!).render(<App />);
