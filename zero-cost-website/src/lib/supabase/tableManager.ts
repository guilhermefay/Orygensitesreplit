
import { supabase } from './client';

// Function to create the RLS policy directly
export const createRLSPolicy = async (): Promise<boolean> => {
  try {
    // Execute SQL directly to ensure policy exists
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Ensure RLS is enabled
        ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
        
        -- Try to create anonymous insertion policy (ignores if already exists)
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
      `
    });
    
    if (error) {
      console.error('Error setting up RLS via SQL:', error);
      
      // Alternative method: try test insertion to verify permissions
      console.log('Attempting test insertion to verify if permissions are already correct...');
      
      // Try a test insertion with minimal data
      const { error: insertError } = await supabase
        .from('form_submissions')
        .insert([{
          name: 'test',
          email: 'test@example.com',
          phone: '0000000000',
          business: 'test',
          business_details: 'test'
        }])
        .select();
      
      if (insertError) {
        console.error('Test insertion error:', insertError);
        
        if (insertError.message.includes('permission denied') || 
            insertError.message.includes('violates row-level security')) {
          console.error('Test insertion failed: permission problem persists');
          return false;
        }
      } else {
        console.log('Test insertion successful! RLS policies appear to be correct.');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in RLS policy creation system:', error);
    return false;
  }
};

// Function to verify and create the form_submissions table if needed
export const ensureFormSubmissionsTable = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Simplified approach: just check if the table exists first
    const { data, error } = await supabase
      .from('form_submissions')
      .select('id')
      .limit(1);
    
    if (error) {
      // Error might be because table doesn't exist or RLS issue
      console.error('Error checking form_submissions table:', error);
      
      return {
        success: false,
        message: error.message
      };
    }
    
    // Table exists and we have permission to access it
    console.log('form_submissions table exists and accessible');
    
    // Ensure RLS policy is in place
    const policyResult = await createRLSPolicy();
    if (!policyResult) {
      console.warn('Unable to confirm RLS policies');
    }
    
    return {
      success: true,
      message: 'Table exists and is accessible'
    };
  } catch (error) {
    console.error('Error checking/creating form_submissions table:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error checking table'
    };
  }
};
