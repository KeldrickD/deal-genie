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

    console.log(`Looking for admin account with email: ${ADMIN_EMAIL}`);

    // Get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, is_admin')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (userError || !userData) {
      console.error('Error finding user:', userError?.message || 'User not found');
      return;
    }

    console.log(`Found user: ${userData.email} (${userData.id})`);
    console.log(`Current status: subscription=${userData.subscription_tier}, admin=${userData.is_admin}`);

    // Update the user profile to set subscription tier to 'pro'
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        subscription_tier: 'pro',
        is_admin: true,
        genie2_access: true
      })
      .eq('id', userData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error upgrading account:', updateError.message);
      return;
    }

    console.log('✅ Admin account upgraded successfully!');
    console.log(`New status: subscription=${updateData.subscription_tier}, admin=${updateData.is_admin}`);
    console.log('You can now access all Pro features without payment.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

upgradeAdminAccount(); 