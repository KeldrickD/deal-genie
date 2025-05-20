import { createClient } from '@/utils/supabase/server';
import { USAGE_LIMITS, FEATURE_NAMES, STATUS_CODES } from './config';
import { cookies } from 'next/headers';
import { getUserProfile } from './auth';
import { checkAndSendUsageNotifications } from './usageNotifications';

// Types
type Feature = keyof typeof FEATURE_NAMES;
type SubscriptionTier = keyof typeof USAGE_LIMITS;

/**
 * Records usage of a feature for a user
 * @param userId User ID to record usage for
 * @param feature Feature being used
 * @param metadata Optional metadata about the usage
 * @returns Boolean indicating success
 */
export async function recordUsage(
  userId: string,
  feature: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    if (!userId) {
      console.error('Cannot record usage: No user ID provided');
      return false;
    }

    const supabase = createClient();
    
    const { error } = await supabase
      .from('usage_log')
      .insert([
        { 
          user_id: userId, 
          feature, 
          metadata 
        }
      ]);
    
    if (error) {
      console.error('Error recording usage:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error recording usage:', error);
    return false;
  }
}

/**
 * Checks if a user has exceeded their usage limit for a feature
 * @param userId User ID to check
 * @param feature Feature to check
 * @returns Object with hasReachedLimit boolean and current usage count
 */
export async function checkUsageLimit(
  userId: string,
  feature: string
): Promise<{ hasReachedLimit: boolean; currentUsage: number; limit: number }> {
  try {
    if (!userId) {
      console.error('Cannot check usage limit: No user ID provided');
      return { hasReachedLimit: true, currentUsage: 0, limit: 0 };
    }
    
    // Get the user's subscription tier and admin status
    const userProfile = await getUserProfile(userId);
    // If admin, always allow unlimited access
    if (userProfile && userProfile.is_admin) {
      return { hasReachedLimit: false, currentUsage: 0, limit: Infinity };
    }
    // Default to 'free' tier if profile doesn't exist or has no tier
    const tier = (userProfile && 
      typeof userProfile === 'object' && 
      'subscription_tier' in userProfile ? 
      userProfile.subscription_tier as string : 'free') as SubscriptionTier;
    
    // Get the limit for this feature based on the user's tier
    const featureKey = Object.entries(FEATURE_NAMES)
      .find(([_, value]) => value === feature)?.[0]?.toLowerCase() as keyof (typeof USAGE_LIMITS)[SubscriptionTier];
    
    if (!featureKey) {
      console.error(`Unknown feature: ${feature}`);
      return { hasReachedLimit: true, currentUsage: 0, limit: 0 };
    }
    
    const limit = USAGE_LIMITS[tier][featureKey] as number;
    
    // If the user has unlimited usage (pro tier), return immediately
    if (limit === Infinity) {
      return { hasReachedLimit: false, currentUsage: 0, limit: Infinity };
    }
    
    // Calculate the start of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Query usage for the current month
    const supabase = createClient();
    const { data, error, count } = await supabase
      .from('usage_log')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('feature', feature)
      .gte('created_at', startOfMonth.toISOString());
    
    if (error) {
      console.error('Error checking usage limit:', error);
      return { hasReachedLimit: true, currentUsage: 0, limit };
    }
    
    const currentUsage = count || 0;
    const hasReachedLimit = currentUsage >= limit;
    
    // Check if we need to send email notifications
    const usageData = { currentUsage, limit };
    
    // Call the notification function asynchronously so we don't block the response
    Promise.resolve().then(() => {
      checkAndSendUsageNotifications(userId, feature, usageData).catch(console.error);
    });
    
    return { hasReachedLimit, currentUsage, limit };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return { hasReachedLimit: true, currentUsage: 0, limit: 0 };
  }
}

/**
 * Enforces usage limits for a feature
 * Checks if the user has exceeded their limit and records usage if not
 * @param userId User ID to enforce limits for
 * @param feature Feature being used
 * @param metadata Optional metadata about the usage
 * @returns Object with success boolean, message, and status code
 */
export async function enforceUsageLimit(
  userId: string,
  feature: string,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; message: string; statusCode: number; currentUsage?: number; limit?: number }> {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required',
        statusCode: STATUS_CODES.UNAUTHORIZED
      };
    }
    
    // Check if the user has exceeded their limit
    const { hasReachedLimit, currentUsage, limit } = await checkUsageLimit(userId, feature);
    
    if (hasReachedLimit) {
      return {
        success: false,
        message: `Usage limit reached for ${feature}. Upgrade your plan for more.`,
        statusCode: STATUS_CODES.USAGE_LIMIT_REACHED,
        currentUsage,
        limit
      };
    }
    
    // Record the usage
    const recorded = await recordUsage(userId, feature, metadata);
    
    if (!recorded) {
      return {
        success: false,
        message: 'Failed to record usage',
        statusCode: STATUS_CODES.SERVER_ERROR
      };
    }
    
    return {
      success: true,
      message: 'Usage recorded successfully',
      statusCode: STATUS_CODES.SUCCESS,
      currentUsage: currentUsage + 1,
      limit
    };
  } catch (error) {
    console.error('Error enforcing usage limit:', error);
    return {
      success: false,
      message: 'Internal server error',
      statusCode: STATUS_CODES.SERVER_ERROR
    };
  }
}

/**
 * Gets a usage summary for all features for a user
 * @param userId User ID to get summary for
 * @returns Object with usage counts and limits for each feature
 */
export async function getUserUsageSummary(
  userId: string
): Promise<Record<string, { currentUsage: number; limit: number; percentage: number }>> {
  try {
    if (!userId) {
      console.error('Cannot get usage summary: No user ID provided');
      return {};
    }
    
    // Get the user's subscription tier
    const userProfile = await getUserProfile(userId);
    // Default to 'free' tier if profile doesn't exist or has no tier
    const tier = (userProfile && 
      typeof userProfile === 'object' && 
      'subscription_tier' in userProfile ? 
      userProfile.subscription_tier as string : 'free') as SubscriptionTier;
    
    // Calculate the start of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get usage for all features for the current month
    const supabase = createClient();
    const { data, error } = await supabase
      .from('usage_log')
      .select('feature, id')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());
    
    if (error) {
      console.error('Error getting usage summary:', error);
      return {};
    }
    
    // Initialize summary with all features set to 0
    const summary: Record<string, { currentUsage: number; limit: number; percentage: number }> = {};
    
    // Initialize all features with 0 usage
    Object.values(FEATURE_NAMES).forEach(featureName => {
      const featureKey = Object.entries(FEATURE_NAMES)
        .find(([_, value]) => value === featureName)?.[0]?.toLowerCase() as keyof (typeof USAGE_LIMITS)[SubscriptionTier];
      
      if (featureKey) {
        const limit = USAGE_LIMITS[tier][featureKey] as number;
        summary[featureName] = { currentUsage: 0, limit, percentage: 0 };
      }
    });
    
    // Count usage for each feature
    data?.forEach(item => {
      if (item.feature === 'email_notification') {
        // Skip email notification entries in the usage log
        return;
      }
      
      if (summary[item.feature]) {
        summary[item.feature].currentUsage++;
      } else {
        // For any features not in our config
        const featureKey = Object.entries(FEATURE_NAMES)
          .find(([_, value]) => value === item.feature)?.[0]?.toLowerCase() as keyof (typeof USAGE_LIMITS)[SubscriptionTier];
        
        const limit = featureKey ? USAGE_LIMITS[tier][featureKey] as number : 0;
        summary[item.feature] = { currentUsage: 1, limit, percentage: 0 };
      }
    });
    
    // Calculate percentages
    Object.keys(summary).forEach(key => {
      const { currentUsage, limit } = summary[key];
      summary[key].percentage = limit === Infinity ? 0 : Math.min(Math.round((currentUsage / limit) * 100), 100);
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting usage summary:', error);
    return {};
  }
} 