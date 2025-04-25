'use client';

import { useState, useEffect } from 'react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FEATURE_NAMES } from '@/lib/config';
import UpgradePromptModal from '@/components/UpgradePromptModal';
import { UsageLimits } from '@/components/UsageLimits';

interface DealAnalysisWrapperProps {
  children: React.ReactNode;
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
}

export default function DealAnalysisWrapper({
  children,
  onAnalyze,
  isAnalyzing,
  hasAnalysis
}: DealAnalysisWrapperProps) {
  const { 
    checkLimit, 
    enforceLimit, 
    usageSummary, 
    getUsageSummary,
    showUpgradePrompt,
    promptFeature,
    closeUpgradePrompt
  } = useUsageLimit();
  
  const [initialized, setInitialized] = useState(false);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [limitInfo, setLimitInfo] = useState<{currentUsage: number; limit: number} | null>(null);
  
  // Get usage summary when component mounts
  useEffect(() => {
    getUsageSummary();
  }, [getUsageSummary]);
  
  // Initial check for limits
  useEffect(() => {
    const checkAnalysisLimit = async () => {
      const result = await checkLimit(FEATURE_NAMES.ANALYZE);
      setCanAnalyze(!result.hasReachedLimit);
      setLimitInfo({
        currentUsage: result.currentUsage,
        limit: result.limit
      });
      setInitialized(true);
    };
    
    checkAnalysisLimit();
  }, [checkLimit]);
  
  // Handle the analyze button click
  const handleAnalyze = async () => {
    // Enforce usage limit
    const limitResult = await enforceLimit(FEATURE_NAMES.ANALYZE, {
      context: 'deal_analysis',
      timestamp: new Date().toISOString()
    }, { showPrompt: true });
    
    if (limitResult.success) {
      // If we have usage left, allow the analysis
      setLimitInfo({
        currentUsage: (limitResult.currentUsage || 0),
        limit: (limitResult.limit || 0)
      });
      
      // Call the original analyze function
      await onAnalyze();
    } else {
      // No usage left, cannot analyze
      setCanAnalyze(false);
    }
  };
  
  // If we haven't checked limits yet, show a loading state
  if (!initialized) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <>
      {/* Usage limit modal */}
      {showUpgradePrompt && promptFeature && (
        <UpgradePromptModal
          isOpen={showUpgradePrompt}
          onClose={closeUpgradePrompt}
          feature={promptFeature.feature}
          currentUsage={promptFeature.currentUsage}
          limit={promptFeature.limit}
          featureDisplayName={promptFeature.featureDisplayName}
        />
      )}
      
      {/* Show analysis or usage UI */}
      {hasAnalysis ? (
        <>{children}</>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>AI Deal Analysis</CardTitle>
            <CardDescription>
              Get AI insights on this property deal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-gray-500 mb-6">Generate an analysis of this deal based on the provided data.</p>
              
              {/* Usage stats component */}
              {limitInfo && limitInfo.limit !== Infinity && (
                <div className="mb-6 max-w-md mx-auto">
                  <UsageLimits standalone={false} showSingleFeature={FEATURE_NAMES.ANALYZE} />
                </div>
              )}
              
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !canAnalyze} 
                className="w-full md:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : !canAnalyze ? (
                  'Usage Limit Reached'
                ) : (
                  'Analyze Deal'
                )}
              </Button>
              
              {!canAnalyze && (
                <div className="mt-3 text-sm text-red-600">
                  You've reached your monthly usage limit for analyses. 
                  <Button 
                    variant="link" 
                    className="px-1 text-primary text-sm" 
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
} 