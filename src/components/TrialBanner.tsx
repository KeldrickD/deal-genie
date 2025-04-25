'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';
import type { Database } from '@/types/supabase';

export default function TrialBanner() {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function checkTrialStatus() {
      try {
        setLoading(true);
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Check for trial subscription
        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select('trial_end, status')
          .eq('user_id', user.id)
          .eq('status', 'trialing')
          .maybeSingle();

        if (error) {
          console.error('Error fetching trial info:', error);
          setLoading(false);
          return;
        }

        // If no trial or trial_end is not set, hide banner
        if (!subscription || !subscription.trial_end) {
          setIsVisible(false);
          setLoading(false);
          return;
        }

        // Calculate days remaining in trial
        const trialEndDate = new Date(subscription.trial_end);
        const today = new Date();
        const daysLeft = Math.max(0, differenceInDays(trialEndDate, today));
        
        setTrialDaysLeft(daysLeft);
        setLoading(false);
      } catch (error) {
        console.error('Error checking trial status:', error);
        setLoading(false);
      }
    }

    checkTrialStatus();
  }, [supabase]);

  // Hide banner if loading, no trial, or banner dismissed
  if (loading || trialDaysLeft === null || !isVisible) {
    return null;
  }

  // Color varies based on urgency
  const getBannerColor = (days: number) => {
    if (days <= 3) return 'bg-red-100 border-red-500 text-red-800';
    if (days <= 7) return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-blue-100 border-blue-500 text-blue-800';
  };

  return (
    <div className={`p-3 mb-4 border-l-4 rounded flex items-center justify-between ${getBannerColor(trialDaysLeft)}`}>
      <div className="flex items-center space-x-3">
        <AlertCircle className="h-5 w-5" />
        <span>
          {trialDaysLeft === 0 ? (
            <strong>Your trial ends today!</strong>
          ) : (
            <strong>Your trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}.</strong>
          )}
          {' '}Upgrade now to keep access to premium features.
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="default" size="sm" asChild>
          <Link href="/settings/billing">Upgrade Now</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsVisible(false)}
          className="h-8 w-8 rounded-full"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 