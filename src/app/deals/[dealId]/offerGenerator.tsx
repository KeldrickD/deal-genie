'use client';

import { useEffect, useState } from 'react';
import OfferGenerator from '@/components/OfferGenerator';
import { Button } from '@/components/ui/button';
import { StructuredAnalysis } from '@/app/ai/actions';
import { useAuthContext } from '@/components/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { FEATURE_NAMES } from '@/lib/config';
import UpgradePromptModal from '@/components/UpgradePromptModal';

interface DealOfferGeneratorProps {
  dealId: string;
  dealData: any; // Type this better in a real implementation
  analysisData?: StructuredAnalysis | null;
}

export default function DealOfferGenerator({ 
  dealId, 
  dealData,
  analysisData
}: DealOfferGeneratorProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [isSending, setIsSending] = useState(false);
  const { supabase } = useAuthContext();
  
  const { 
    showUpgradePrompt, 
    promptFeature, 
    closeUpgradePrompt, 
    enforceLimit 
  } = useUsageLimit();

  // If needed, fetch the most recent analysis from supabase here
  // and pass it to the OfferGenerator

  const handleGenerateOffer = async () => {
    // Track and enforce usage limit for offer generation
    const limitResult = await enforceLimit(FEATURE_NAMES.OFFER, {
      context: 'deal_offer_generator',
      dealId
    }, { showPrompt: true });
    
    // Only proceed if we haven't hit usage limits
    if (limitResult.success) {
      setIsSending(true);
      setStatus('generating');
      
      try {
        // ... existing code - continue with offer generation ...
        
      } catch (error) {
        console.error('Error generating offer:', error);
        toast.error('Failed to generate offer document');
        setStatus('error');
      } finally {
        setIsSending(false);
      }
    }
  };

  if (!showGenerator) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Generate Offer Documents</h3>
        <p className="text-gray-600 max-w-md mb-6">
          Create professional offer documents, emails, and PDFs based on this deal's information.
        </p>
        <Button onClick={() => setShowGenerator(true)}>
          Create Offer Documents
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Upgrade Modal */}
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
      
      <div className="mb-4">
        <Button variant="outline" onClick={() => setShowGenerator(false)}>
          ← Back to Options
        </Button>
      </div>
      
      <OfferGenerator 
        dealData={dealData} 
        analysisData={analysisData} 
      />
    </div>
  );
} 