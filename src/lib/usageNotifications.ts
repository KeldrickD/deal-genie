import { sendEmail } from './sendgrid';
import { FEATURE_NAMES } from './config';
import { getUserProfile } from './auth';
import { createClient } from '@/utils/supabase/server';

// Feature name mapping for display
const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  deal_analyze: 'deal analysis',
  deal_offer: 'offer generation',
  csv_import: 'CSV import'
};

/**
 * Send an email notification when a user reaches their usage limit
 * @param userId User ID of the user who reached their limit
 * @param feature Feature they've reached the limit for
 * @param usageData Additional usage data (current usage and limit)
 */
export async function sendLimitReachedEmail(
  userId: string,
  feature: string,
  usageData: { currentUsage: number; limit: number }
): Promise<boolean> {
  try {
    // Get user profile to get their email
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || !userProfile.email) {
      console.error('Cannot send limit reached email: No user email found');
      return false;
    }
    
    // Get friendly feature name
    const featureName = FEATURE_DISPLAY_NAMES[feature] || feature;
    
    // Send the email
    const { success } = await sendEmail({
      to: userProfile.email,
      subject: `You've reached your ${featureName} limit`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Usage Limit Reached</h2>
          <p>Hi there,</p>
          <p>You've used all ${usageData.limit} of your monthly ${featureName} credits in Deal Genie.</p>
          <p>With a Pro subscription, you'll get:</p>
          <ul>
            <li>Unlimited ${featureName}</li>
            <li>Unlimited deal analyses</li>
            <li>Unlimited offer generation</li>
            <li>Advanced analytics and reporting</li>
          </ul>
          <p style="margin: 25px 0;">
            <a href="https://dealgenieos.com/pricing" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Upgrade to Pro</a>
          </p>
          <p>If you have any questions, please reply to this email.</p>
          <p>Thank you for using Deal Genie!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
            <p>Deal Genie - AI-Powered Real Estate Investment Platform</p>
            <p>This email was sent to ${userProfile.email}</p>
          </div>
        </div>
      `,
    });
    
    if (success) {
      // Record that we sent this email - using usage_log table instead of email_log
      const supabase = createClient();
      await supabase.from('usage_log').insert({
        user_id: userId,
        feature: 'email_notification',
        metadata: {
          email_type: 'limit_reached',
          feature,
          currentUsage: usageData.currentUsage,
          limit: usageData.limit
        }
      });
    }
    
    return success;
  } catch (error) {
    console.error('Error sending limit reached email:', error);
    return false;
  }
}

/**
 * Send an email notification when a user is approaching their usage limit
 * @param userId User ID of the user approaching their limit
 * @param feature Feature they're approaching the limit for
 * @param usageData Additional usage data (current usage and limit)
 */
export async function sendApproachingLimitEmail(
  userId: string,
  feature: string,
  usageData: { currentUsage: number; limit: number }
): Promise<boolean> {
  try {
    // Get user profile to get their email
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || !userProfile.email) {
      console.error('Cannot send approaching limit email: No user email found');
      return false;
    }
    
    // Check if we've already sent an email for this feature this month
    const supabase = createClient();
    
    // Calculate the start of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Check usage_log for email notifications
    const { data, error } = await supabase
      .from('usage_log')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', 'email_notification')
      .gte('created_at', startOfMonth.toISOString())
      .eq('metadata->email_type', 'approaching_limit')
      .eq('metadata->feature', feature);
      
    if (error) {
      console.error('Error checking email log:', error);
    } else if (data && data.length > 0) {
      // We've already sent an email this month
      console.log(`Already sent approaching limit email to user ${userId} for ${feature} this month`);
      return true;
    }
    
    // Get friendly feature name
    const featureName = FEATURE_DISPLAY_NAMES[feature] || feature;
    const remaining = usageData.limit - usageData.currentUsage;
    
    // Send the email
    const { success } = await sendEmail({
      to: userProfile.email,
      subject: `You're approaching your ${featureName} limit`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Almost at Usage Limit</h2>
          <p>Hi there,</p>
          <p>You have only ${remaining} ${featureName} credits remaining this month in Deal Genie.</p>
          <p>With a Pro subscription, you'll never have to worry about limits again:</p>
          <ul>
            <li>Unlimited ${featureName}</li>
            <li>Unlimited deal analyses</li>
            <li>Unlimited offer generation</li>
            <li>Advanced analytics and reporting</li>
          </ul>
          <p style="margin: 25px 0;">
            <a href="https://dealgenieos.com/pricing" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Upgrade to Pro</a>
          </p>
          <p>If you have any questions, please reply to this email.</p>
          <p>Thank you for using Deal Genie!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
            <p>Deal Genie - AI-Powered Real Estate Investment Platform</p>
            <p>This email was sent to ${userProfile.email}</p>
          </div>
        </div>
      `,
    });
    
    if (success) {
      // Record that we sent this email - using usage_log table instead of email_log
      await supabase.from('usage_log').insert({
        user_id: userId,
        feature: 'email_notification',
        metadata: {
          email_type: 'approaching_limit',
          feature,
          currentUsage: usageData.currentUsage,
          limit: usageData.limit
        }
      });
    }
    
    return success;
  } catch (error) {
    console.error('Error sending approaching limit email:', error);
    return false;
  }
}

/**
 * Check and send limit-related email notifications based on usage data
 * @param userId User ID to check
 * @param feature Feature to check
 * @param usageData Usage data for the feature
 */
export async function checkAndSendUsageNotifications(
  userId: string,
  feature: string,
  usageData: { currentUsage: number; limit: number }
): Promise<void> {
  try {
    const { currentUsage, limit } = usageData;
    
    // Skip for unlimited plans
    if (limit === Infinity) {
      return;
    }
    
    // If user has reached their limit, send a limit reached email
    if (currentUsage >= limit) {
      await sendLimitReachedEmail(userId, feature, usageData);
      return;
    }
    
    // If user is approaching their limit (80% or more), send approaching limit email
    const usagePercentage = (currentUsage / limit) * 100;
    if (usagePercentage >= 80) {
      await sendApproachingLimitEmail(userId, feature, usageData);
    }
  } catch (error) {
    console.error('Error checking and sending usage notifications:', error);
  }
} 