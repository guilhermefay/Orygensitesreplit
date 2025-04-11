
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Usamos variáveis de ambiente se disponíveis, caso contrário, usamos valores diretos
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gltluwhobeprwfzzcmzw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdGx1d2hvYmVwcndmenpjbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjQ3MDUsImV4cCI6MjA1NjgwMDcwNX0.gzJXXUnB5THokP6yEAIHM65IOCNWGcKGAN7iKbWegws';

console.log('[SUPABASE CLIENT] Iniciando cliente Supabase');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
