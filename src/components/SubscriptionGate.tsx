'use client';

import { useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Database } from '@/types/supabase';

type SubscriptionGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function SubscriptionGate({ 
  children, 
  fallback 
}: SubscriptionGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function checkSubscription() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check for active subscription
        const { data: activeSubscription, error: activeError } = await supabase
          .from('user_subscriptions')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (activeError) {
          console.error('Error checking active subscription:', activeError);
        }

        // Check for trial subscription
        const { data: trialSubscription, error: trialError } = await supabase
          .from('user_subscriptions')
          .select('id, status, trial_end')
          .eq('user_id', user.id)
          .eq('status', 'trialing')
          .maybeSingle();

        if (trialError) {
          console.error('Error checking trial subscription:', trialError);
        }

        // Grant access if user has active subscription or is still in trial period
        const hasActiveSubscription = !!activeSubscription;
        const hasValidTrial = trialSubscription && trialSubscription.trial_end 
          ? new Date(trialSubscription.trial_end) > new Date() 
          : false;

        setHasAccess(hasActiveSubscription || hasValidTrial);
        setLoading(false);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setHasAccess(false);
        setLoading(false);
      }
    }

    checkSubscription();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If user has access, show the children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback UI
  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Premium Feature</CardTitle>
        <CardDescription>
          This feature requires an active subscription.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Upgrade your account to access all premium features including this one.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/settings/billing">Upgrade Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 