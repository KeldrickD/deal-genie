import { useState, useCallback, useEffect } from 'react';
import { FEATURE_NAMES } from '@/lib/config';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';
import { useAuthContext } from '@/components/AuthProvider';
import { enforceUsageLimit } from '@/lib/usageLimit';

type Feature = keyof typeof FEATURE_NAMES;
type UsageSummary = Record<string, { currentUsage: number; limit: number; percentage: number }>;

// Feature name mapping for display
const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  deal_analyze: 'deal analysis',
  deal_offer: 'offer generation',
  csv_import: 'CSV import'
};

export type FeatureInfo = {
  displayName: string;
  upgradeMessage: string;
};

export type EnforceLimitOptions = {
  showUpgradePrompt?: boolean;
  metadata?: Record<string, any>;
  featureInfo?: FeatureInfo;
};

/**
 * Hook for interacting with the usage limit system
 * Provides functions to check, record, and enforce usage limits
 */
export function useUsageLimit() {
  const [isLoading, setIsLoading] = useState(false);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [showingUpgradePrompt, setShowingUpgradePrompt] = useState(false);
  const [promptFeature, setPromptFeature] = useState<FeatureInfo | null>(null);
  const { user } = useAuthContext();

  /**
   * Check if a user has exceeded their usage limit for a feature
   */
  const checkLimit = useCallback(async (feature: string): Promise<{
    success: boolean;
    hasReachedLimit: boolean;
    currentUsage: number;
    limit: number;
  }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/usage/check?feature=${encodeURIComponent(feature)}`);
      const data = await response.json();
      
      setIsLoading(false);
      
      if (!data.success) {
        toast.error(data.message || 'Failed to check usage limit');
        return {
          success: false,
          hasReachedLimit: true,
          currentUsage: 0,
          limit: 0
        };
      }
      
      // If user is reaching limit, track the event
      if (data.limit !== Infinity && data.currentUsage >= data.limit - 2) {
        trackEvent('usage_approaching_limit', feature, `${data.currentUsage}/${data.limit}`);
      }
      
      return {
        success: true,
        hasReachedLimit: data.hasReachedLimit,
        currentUsage: data.currentUsage,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      setIsLoading(false);
      toast.error('Failed to check usage limit');
      return {
        success: false,
        hasReachedLimit: true,
        currentUsage: 0,
        limit: 0
      };
    }
  }, []);

  /**
   * Record usage of a feature
   */
  const recordUsage = useCallback(async (
    feature: string, 
    metadata: Record<string, any> = {}
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/usage/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feature, metadata })
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (!data.success) {
        toast.error(data.message || 'Failed to record usage');
        return false;
      }
      
      // Track feature usage
      trackEvent('feature_used', feature, metadata?.context || '');
      
      return true;
    } catch (error) {
      console.error('Error recording usage:', error);
      setIsLoading(false);
      toast.error('Failed to record usage');
      return false;
    }
  }, []);

  /**
   * Enforce usage limits for a feature
   * Checks if the user has exceeded their limit and records usage if not
   */
  const enforceLimit = async (
    feature: keyof typeof FEATURE_NAMES,
    options: EnforceLimitOptions = {}
  ) => {
    const { showUpgradePrompt = true, metadata = {}, featureInfo } = options;

    if (!user?.id) {
      toast.error('Authentication Required', {
        description: 'Please log in to use this feature.'
      });
      return false;
    }

    try {
      const result = await enforceUsageLimit(user.id, FEATURE_NAMES[feature], metadata);

      if (!result.success) {
        if (showUpgradePrompt && featureInfo) {
          setPromptFeature(featureInfo);
          setShowingUpgradePrompt(true);
        } else {
          toast.error('Usage Limit Reached', {
            description: result.message
          });
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error enforcing usage limit:', error);
      toast.error('Error', {
        description: 'There was an error checking your usage limits. Please try again.'
      });
      return false;
    }
  };

  /**
   * Get a summary of usage for all features
   */
  const getUsageSummary = useCallback(async (): Promise<UsageSummary | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/usage/summary');
      const data = await response.json();
      
      setIsLoading(false);
      
      if (!data.success) {
        toast.error(data.message || 'Failed to get usage summary');
        return null;
      }
      
      setUsageSummary(data.summary);
      return data.summary;
    } catch (error) {
      console.error('Error getting usage summary:', error);
      setIsLoading(false);
      toast.error('Failed to get usage summary');
      return null;
    }
  }, []);

  /**
   * Check if a feature can be used
   * Shows a toast message if the limit is reached
   */
  const canUseFeature = useCallback(async (
    feature: string,
    options: { silent?: boolean; showPrompt?: boolean } = {}
  ): Promise<boolean> => {
    const result = await checkLimit(feature);
    
    if (!result.success) {
      return false;
    }
    
    if (result.hasReachedLimit) {
      // Show the upgrade prompt if applicable
      if (options.showPrompt !== false) {
        setPromptFeature({
          displayName: FEATURE_DISPLAY_NAMES[feature] || feature,
          upgradeMessage: `You've reached your usage limit for this feature. Upgrade your plan for unlimited access.`,
        });
        setShowingUpgradePrompt(true);
        
        // Track limit reached event
        trackEvent('usage_limit_reached', feature, `${result.currentUsage}/${result.limit}`);
      }
      
      if (!options.silent) {
        toast.error('Usage Limit Reached', {
          description: `You've reached your usage limit for this feature. Upgrade your plan for unlimited access.`
        });
      }
      return false;
    }
    
    // Check if near limit (1 usage left)
    if (result.limit !== Infinity && result.currentUsage >= result.limit - 1) {
      // Show the upgrade prompt if applicable
      if (options.showPrompt !== false) {
        setPromptFeature({
          displayName: FEATURE_DISPLAY_NAMES[feature] || feature,
          upgradeMessage: `You're approaching your usage limit for this feature. Upgrade your plan for unlimited access.`,
        });
        setShowingUpgradePrompt(true);
        
        // Track near limit event
        trackEvent('usage_near_limit', feature, `${result.currentUsage}/${result.limit}`);
      }
    }
    
    return !result.hasReachedLimit;
  }, [checkLimit]);

  // Close the upgrade prompt
  const closeUpgradePrompt = useCallback(() => {
    setShowingUpgradePrompt(false);
    setPromptFeature(null);
  }, []);

  return {
    isLoading,
    usageSummary,
    checkLimit,
    recordUsage,
    enforceLimit,
    getUsageSummary,
    canUseFeature,
    showingUpgradePrompt,
    promptFeature,
    closeUpgradePrompt,
  };
} 