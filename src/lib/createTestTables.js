// Script to create test tables through the Supabase JavaScript SDK
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * This function attempts to create test tables in Supabase via the JavaScript SDK.
 * NOTE: This is for testing only as it doesn't have all the indexes and RLS policies
 * that the full SQL script has.
 */
export const createTestTables = async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    console.log('Checking if tables exist...');
    
    // Check if deal_deadlines table exists
    const { error: checkDeadlinesError, count: deadlinesCount } = await supabase
      .from('deal_deadlines')
      .select('*', { count: 'exact', head: true });
    
    if (checkDeadlinesError && checkDeadlinesError.code === '42P01') {
      console.log('deal_deadlines table does not exist, will need to create it');
    } else {
      console.log(`deal_deadlines table exists with ${deadlinesCount || 0} rows`);
      return { success: true, message: 'Tables already exist.' };
    }
    
    console.log('Creating tables...');
    
    // Execute SQL via SDK
    const sql = `
      -- Table for tracking deal deadlines/milestones
      CREATE TABLE IF NOT EXISTS public.deal_deadlines (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      -- Table for tracking deal status history
      CREATE TABLE IF NOT EXISTS public.deal_history (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
        old_status TEXT,
        new_status TEXT NOT NULL,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        changed_by UUID REFERENCES public.profiles(id)
      );
    `;
    
    const { error } = await supabase.rpc('sql', { query: sql });
    
    if (error) {
      console.error('Error creating tables:', error);
      return { success: false, error };
    }
    
    console.log('Tables created successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error in createTestTables:', error);
    return { success: false, error };
  }
}; 