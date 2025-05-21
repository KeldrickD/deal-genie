// Script to upgrade admin account to Pro tier
// Usage: npm run upgrade-admin

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../../.env') });

// Admin email to upgrade
const ADMIN_EMAIL = 'Keldrickd@gmail.com';

async function upgradeAdminAccount() {
  try {
    // Initialize Supabase Admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log(`Searching for account with email: ${ADMIN_EMAIL}`);

    // First, find the user in auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .ilike('email', ADMIN_EMAIL)
      .maybeSingle();

    // If that fails, try a direct SQL query using rpc
    if (authError || !authUser) {
      console.log('Could not find user in auth.users table, trying SQL query...');
      
      // Execute SQL to find the user
      const { data: sqlUser, error: sqlError } = await supabase
        .rpc('find_user_by_email', { email_param: ADMIN_EMAIL });

      if (sqlError || !sqlUser || sqlUser.length === 0) {
        console.error('Error finding user via SQL:', sqlError?.message || 'User not found');
        console.log('\nLet\'s create an RPC function to help find the user:');
        console.log('1. Go to Supabase dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Run this SQL:');
        console.log(`
CREATE OR REPLACE FUNCTION find_user_by_email(email_param TEXT)
RETURNS TABLE (id UUID, email TEXT) 
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT id, email FROM auth.users WHERE email ILIKE '%' || email_param || '%'
$$;

-- Then run this to find your user:
SELECT * FROM find_user_by_email('${ADMIN_EMAIL}');

-- Once you have your user ID, run this to upgrade:
UPDATE profiles
SET 
  subscription_tier = 'pro',
  is_admin = true, 
  genie2_access = true
WHERE id = 'YOUR_USER_ID_HERE';
        `);
        return;
      }
      
      // Use the user found via SQL
      const userId = sqlUser[0].id;
      console.log(`Found user via SQL query: ${sqlUser[0].email} (${userId})`);
      
      // Update the user profile
      await updateUserProfile(supabase, userId);
      return;
    }
    
    console.log(`Found user: ${authUser.email} (${authUser.id})`);
    
    // Update the user profile
    await updateUserProfile(supabase, authUser.id);
  } catch (error) {
    console.error('Unexpected error:', error);
    console.log('\nTry directly in Supabase SQL Editor:');
    console.log(`
-- First find your user ID
SELECT id, email FROM auth.users WHERE email ILIKE '%keldrickd%';

-- Then update your profile (replace USER_ID with the ID from the first query)
UPDATE profiles
SET 
  subscription_tier = 'pro',
  is_admin = true, 
  genie2_access = true
WHERE id = 'YOUR_USER_ID';
    `);
  }
}

async function updateUserProfile(supabase, userId) {
  try {
    // Get current user status
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('subscription_tier, is_admin, genie2_access')
      .eq('id', userId)
      .single();
    
    if (userData) {
      console.log(`Current status: subscription=${userData.subscription_tier}, admin=${userData.is_admin}, genie2_access=${userData.genie2_access}`);
    }
    
    // Update the user profile
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        subscription_tier: 'pro',
        is_admin: true,
        genie2_access: true
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error upgrading account:', updateError.message);
      return;
    }

    console.log('✅ Admin account upgraded successfully!');
    console.log(`New status: subscription=${updateData.subscription_tier}, admin=${updateData.is_admin}, genie2_access=${updateData.genie2_access}`);
    console.log('You can now access all Pro features without payment.');
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}

upgradeAdminAccount(); 