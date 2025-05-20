import { createClient } from '@/utils/supabase/server';

export async function getServerSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
} 