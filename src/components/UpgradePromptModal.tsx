'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentUsage: number;
  limit: number;
  featureDisplayName?: string;
}

export default function UpgradePromptModal({
  isOpen,
  onClose,
  feature,
  currentUsage,
  limit,
  featureDisplayName
}: UpgradePromptModalProps) {
  const router = useRouter();
  const displayName = featureDisplayName || feature;
  const isAtLimit = currentUsage >= limit;
  const isNearLimit = currentUsage >= limit - 1;
  
  useEffect(() => {
    if (isOpen) {
      // Track the event when modal is shown
      if (isAtLimit) {
        trackEvent('usage_limit_reached', feature, `${currentUsage}/${limit}`);
      } else if (isNearLimit) {
        trackEvent('usage_near_limit', feature, `${currentUsage}/${limit}`);
      }
    }
  }, [isOpen, isAtLimit, isNearLimit, feature, currentUsage, limit]);
  
  const handleUpgrade = () => {
    // Track click on upgrade button
    trackEvent('upgrade_prompt_click', feature, 'upgrade_button');
    router.push('/pricing');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAtLimit ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Usage Limit Reached
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Usage Limit Almost Reached
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isAtLimit ? (
              `You've used all ${limit} free ${displayName}s for this month.`
            ) : (
              `You only have ${limit - currentUsage} ${displayName}${limit - currentUsage === 1 ? '' : 's'} left this month.`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg bg-muted p-4 mb-4">
            <h4 className="font-medium mb-2">Upgrade to Pro for unlimited access:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited {displayName}s</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited offers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited imports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Advanced analytics</span>
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade}>
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 