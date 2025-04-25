import { useState, useCallback } from 'react';
import { FEATURE_NAMES } from '@/lib/config';
import { toast } from 'sonner'; // Assuming toast is used throughout the app

type Feature = keyof typeof FEATURE_NAMES;
type UsageSummary = Record<string, { currentUsage: number; limit: number; percentage: number }>;

/**
 * Hook for interacting with the usage limit system
 * Provides functions to check, record, and enforce usage limits
 */
export function useUsageLimit() {
  const [isLoading, setIsLoading] = useState(false);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);

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
  const enforceLimit = useCallback(async (
    feature: string,
    metadata: Record<string, any> = {},
    options: { silent?: boolean } = {}
  ): Promise<{
    success: boolean;
    message: string;
    currentUsage?: number;
    limit?: number;
  }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/usage/check?feature=${encodeURIComponent(feature)}&enforce=true`);
      const data = await response.json();
      
      setIsLoading(false);
      
      if (!data.success && !options.silent) {
        toast.error(data.message || 'Usage limit reached');
      }
      
      return {
        success: data.success,
        message: data.message,
        currentUsage: data.currentUsage,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error enforcing usage limit:', error);
      setIsLoading(false);
      if (!options.silent) {
        toast.error('Failed to check usage limit');
      }
      return {
        success: false,
        message: 'Failed to check usage limit'
      };
    }
  }, []);

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
    options: { silent?: boolean } = {}
  ): Promise<boolean> => {
    const result = await checkLimit(feature);
    
    if (!result.success) {
      return false;
    }
    
    if (result.hasReachedLimit && !options.silent) {
      toast.error(`You've reached your usage limit for this feature. Upgrade your plan for unlimited access.`);
      return false;
    }
    
    return !result.hasReachedLimit;
  }, [checkLimit]);

  return {
    isLoading,
    usageSummary,
    checkLimit,
    recordUsage,
    enforceLimit,
    getUsageSummary,
    canUseFeature,
  };
} 