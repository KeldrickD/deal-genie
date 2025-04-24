import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import PreferencesForm from './preferences-form';
import XpSystem from '@/components/XpSystem';
import { getUserProfile } from '@/utils/database';

export const metadata = {
  title: 'Genie Profile | GenieOS',
  description: 'Customize your investment preferences and strategy',
};

export default async function ProfilePage() {
  // Get the current session
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // If no session, redirect to login
  if (!session) {
    redirect('/login');
  }
  
  // Get the user profile
  const { data: profile, error } = await getUserProfile(session.user.id);
  
  // If there's an error, show an error message
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          Error loading profile: {error.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-medium text-lg mb-4">Account Information</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p>{profile?.full_name || 'Not set'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{profile?.email || session.user.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p>{new Date(profile?.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <XpSystem />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <PreferencesForm initialData={profile?.investment_data} />
        </div>
      </div>
    </div>
  );
} 