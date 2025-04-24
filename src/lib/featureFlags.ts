/**
 * Feature Flags for GenieOS
 * 
 * This file manages feature flags for the application.
 * Feature flags allow us to enable/disable features in different environments.
 */

import { useState, useEffect } from 'react';

interface FeatureFlags {
  // Controls visibility of GenieNet features
  enableGenieNet: boolean;
  
  // Add other feature flags below
  // enableFeatureX: boolean
}

/**
 * Get the current environment's feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  // Read from environment variables if available
  // Otherwise use default values
  return {
    // Convert string "true"/"false" to boolean
    enableGenieNet: process.env.NEXT_PUBLIC_ENABLE_GENIE_NET === "true" || false,
  };
}

/**
 * Hook to get feature flags in client components
 * Provides reactive updates when flags change
 */
export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());
  
  useEffect(() => {
    // Function to update flags on change
    const handleFlagsChange = () => {
      setFlags(getFeatureFlags());
    };
    
    // Listen for flag changes (useful for development)
    window.addEventListener('featureFlagsChanged', handleFlagsChange);
    
    return () => {
      window.removeEventListener('featureFlagsChanged', handleFlagsChange);
    };
  }, []);
  
  return flags;
}

/**
 * Override flags for development/testing
 * These overrides are not persisted across page refreshes
 */
let overrides: Partial<FeatureFlags> = {};

/**
 * Toggle a feature flag (for development testing only)
 * This is not persisted across page refreshes
 */
export function toggleFeatureFlag(flagName: keyof FeatureFlags): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    console.warn('Feature flag toggling is only available in browser development mode');
    return;
  }
  
  const currentValue = overrides[flagName] ?? getFeatureFlags()[flagName];
  overrides[flagName] = !currentValue;
  
  // Force re-render in components that use these flags
  window.dispatchEvent(new Event('featureFlagsChanged'));
}

/**
 * Reset all feature flag overrides
 */
export function resetFeatureFlagOverrides(): void {
  overrides = {};
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('featureFlagsChanged'));
  }
} 