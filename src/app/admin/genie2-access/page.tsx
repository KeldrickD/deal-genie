import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';
import AccessManagementPanel from './access-management';

export default async function Genie2AdminPage() {
  // Check if user is an admin
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect('/login');
  }
  
  const supabase = createClient();
  const userId = session.user.id;
  
  // Check if user is an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  // Cast the profile to include the admin field since it might not be in the TypeScript types yet
  const userProfile = profile as any;
  
  if (!userProfile?.is_admin) {
    redirect('/dashboard');
  }
  
  // Get users
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at
    `)
    .order('created_at', { ascending: false });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Genie 2.0 Access Management</h1>
      
      <p className="mb-8 text-gray-600">
        Manage which users have access to Genie 2.0 features. Users with Pro or Team
        subscriptions automatically get access, but you can also grant access to specific users.
      </p>
      
      <AccessManagementPanel users={users || []} adminId={userId} />
    </div>
  );
} 