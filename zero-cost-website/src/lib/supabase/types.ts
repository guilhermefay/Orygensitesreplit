
// Type for our form submissions table
export interface FormSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  business: string;
  business_details: string;
  color_palette?: string[] | string;
  content?: string;
  logo_url?: string | null;
  photo_urls?: string[] | string | null;
  created_at?: string;
  selected_plan?: string;
  plan_variant?: string;
  payment_status?: string;
  payment_id?: string | null;
}

// Required columns for proper operation
export const requiredColumns = [
  'name', 'email', 'phone', 'business', 'business_details', 
  'color_palette', 'content', 'logo_url', 'photo_urls', 'created_at',
  'selected_plan', 'plan_variant'
];

// SQL to create the table
export const createTableSQL = `
-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business TEXT NOT NULL,
  business_details TEXT NOT NULL,
  color_palette TEXT,
  content TEXT,
  logo_url TEXT,
  photo_urls TEXT,
  selected_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (if not already enabled)
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Add RLS policy (will fail gracefully if policy already exists)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Enable anonymous inserts for form_submissions" 
    ON public.form_submissions FOR INSERT 
    TO anon
    WITH CHECK (true);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Policy already exists, skipping...';
  END;
END $$;
`;
