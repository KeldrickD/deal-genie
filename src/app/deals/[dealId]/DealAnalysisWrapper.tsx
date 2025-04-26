'use client';

import { useState, useEffect, useRef } from 'react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FEATURE_NAMES } from '@/lib/config';
import UpgradePromptModal from '@/components/UpgradePromptModal';

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
  // Reference to track if component is mounted
  const isMounted = useRef(true);

  const { 
    checkLimit, 
    enforceLimit,
    getUsageSummary,
    showingUpgradePrompt: showUpgradePrompt,
    promptFeature,
    closeUpgradePrompt
  } = useUsageLimit();
  
  const [initialized, setInitialized] = useState(false);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [limitInfo, setLimitInfo] = useState<{currentUsage: number; limit: number} | null>(null);
  const [usageLimitError, setUsageLimitError] = useState<boolean>(false);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Get usage summary when component mounts
  useEffect(() => {
    getUsageSummary().catch(err => {
      console.error('Error loading usage summary:', err);
      if (isMounted.current) {
        setUsageLimitError(true);
      }
    });
  }, [getUsageSummary]);
  
  // Initial check for limits
  useEffect(() => {
    const checkAnalysisLimit = async () => {
      try {
        const result = await checkLimit(FEATURE_NAMES.ANALYZE);
        if (isMounted.current) {
          setCanAnalyze(!result.hasReachedLimit);
          setLimitInfo({
            currentUsage: result.currentUsage,
            limit: result.limit
          });
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error checking limit:', error);
        if (isMounted.current) {
          setCanAnalyze(true); // Default to allowing analysis if check fails
          setInitialized(true);
          setUsageLimitError(true);
        }
      }
    };
    
    checkAnalysisLimit();
  }, [checkLimit]);
  
  // Handle the analyze button click
  const handleAnalyze = async () => {
    // Enforce usage limit
    try {
      const limitResult = await enforceLimit('ANALYZE', {
        metadata: {
          context: 'deal_analysis',
          timestamp: new Date().toISOString()
        }
      });
      
      if (isMounted.current) {
        // If we have usage left, allow the analysis
        if (typeof limitResult === 'object' && limitResult !== null) {
          const { currentUsage, limit, success } = limitResult;
          
          if (typeof currentUsage === 'number' && typeof limit === 'number') {
            setLimitInfo({ currentUsage, limit });
          }
          
          // Call the original analyze function if successful
          if (success) {
            await onAnalyze();
          } else {
            // No usage left, cannot analyze
            setCanAnalyze(false);
          }
        } else if (limitResult === true) {
          // Old API might return true, still allow analysis
          await onAnalyze();
        } else {
          // Couldn't use feature
          setCanAnalyze(false);
        }
      }
    } catch (error) {
      console.error('Error enforcing limit:', error);
      // If there's an error with the usage limit, still allow analysis
      if (isMounted.current) {
        setUsageLimitError(true);
        await onAnalyze();
      }
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
      {/* Usage limit modal - only render if promptFeature exists */}
      {showUpgradePrompt && promptFeature && (
        <UpgradePromptModal
          isOpen={showUpgradePrompt}
          onClose={closeUpgradePrompt}
          feature={promptFeature.displayName || ''}
          currentUsage={0}
          limit={0}
          featureDisplayName={promptFeature.displayName || ''}
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
              
              {/* Usage stats component - only show if no errors */}
              {!usageLimitError && limitInfo && limitInfo.limit !== Infinity && (
                <div className="mb-6 max-w-md mx-auto">
                  {/* Simple usage progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Deal Analysis</span>
                      <span className="text-sm text-gray-500">
                        {limitInfo.currentUsage} / {limitInfo.limit}
                      </span>
                    </div>
                    <div className="bg-gray-100">
                      <div 
                        className="h-2 bg-blue-600" 
                        style={{ 
                          width: `${Math.min(100, (limitInfo.currentUsage / limitInfo.limit) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || (!usageLimitError && !canAnalyze)} 
                className="w-full md:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : !canAnalyze && !usageLimitError ? (
                  'Usage Limit Reached'
                ) : (
                  'Analyze Deal'
                )}
              </Button>
              
              {!canAnalyze && !usageLimitError && (
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