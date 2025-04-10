
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://gltluwhobeprwfzzcmzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdGx1d2hvYmVwcndmenpjbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjQ3MDUsImV4cCI6MjA1NjgwMDcwNX0.gzJXXUnB5THokP6yEAIHM65IOCNWGcKGAN7iKbWegws';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
