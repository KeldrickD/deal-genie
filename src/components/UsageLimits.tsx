'use client';

import { useEffect } from 'react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';

// Feature name mapping for display
const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  deal_analyze: 'Deal Analysis',
  deal_offer: 'Offer Generation',
  csv_import: 'CSV Imports'
};

interface UsageLimitsProps {
  standalone?: boolean;
  showSingleFeature?: string;
}

export default function UsageLimits({ 
  standalone = true,
  showSingleFeature
}: UsageLimitsProps) {
  const { isLoading, usageSummary, getUsageSummary } = useUsageLimit();
  
  useEffect(() => {
    // Load usage summary when component mounts
    getUsageSummary();
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      getUsageSummary();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [getUsageSummary]);
  
  // Function to render a single feature's usage bar
  const renderFeatureUsage = (feature: string, data: { currentUsage: number; limit: number; percentage: number }) => {
    const displayName = FEATURE_DISPLAY_NAMES[feature] || feature;
    const { currentUsage, limit, percentage } = data;
    const isUnlimited = limit === Infinity;
    const isNearLimit = percentage >= 80 && !isUnlimited;
    const isAtLimit = percentage >= 100 && !isUnlimited;
    
    return (
      <div key={feature} className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-sm text-gray-500">
            {currentUsage} / {isUnlimited ? '∞' : limit}
          </span>
        </div>
        
        <div className={isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-amber-100' : 'bg-gray-100'}>
          <Progress 
            value={isUnlimited ? 5 : percentage} 
            className={`h-2 ${isAtLimit ? 'bg-red-600' : isNearLimit ? 'bg-amber-500' : 'bg-blue-600'}`}
          />
        </div>
        
        {isAtLimit && (
          <div className="flex items-center mt-1 text-red-600 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Limit reached. Please upgrade your plan for more.</span>
          </div>
        )}
        
        {isNearLimit && !isAtLimit && (
          <div className="flex items-center mt-1 text-amber-600 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Almost at limit. Consider upgrading your plan.</span>
          </div>
        )}
      </div>
    );
  };
  
  // For single feature mode (non-standalone)
  if (!standalone && showSingleFeature && usageSummary && usageSummary[showSingleFeature]) {
    return renderFeatureUsage(showSingleFeature, usageSummary[showSingleFeature]);
  }
  
  // For standalone component in loading state
  if (standalone && isLoading && !usageSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
          <CardDescription>Loading your usage statistics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // For standalone component with no usage data
  if (standalone && (!usageSummary || Object.keys(usageSummary).length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
          <CardDescription>
            Track your feature usage and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No usage data</AlertTitle>
            <AlertDescription>
              Start using the platform's features to see your usage statistics.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Main standalone component with data
  if (standalone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
          <CardDescription>
            Track your feature usage and limits for this billing period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageSummary && Object.entries(usageSummary).map(([feature, data]) => 
            renderFeatureUsage(feature, data)
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Default: empty fragment for non-standalone mode without matching feature
  return <></>;
} 