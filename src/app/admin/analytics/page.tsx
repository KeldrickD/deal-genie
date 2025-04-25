'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import type { Database } from '@/types/supabase';

interface AnalyticsData {
  totalTrials: number;
  totalConversions: number;
  conversionRate: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalTrials: 0,
    totalConversions: 0,
    conversionRate: 0,
    activeSubscriptions: 0,
    canceledSubscriptions: 0
  });
  
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    // Only admin users should access this page
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Count total trials
        const { count: totalTrials, error: trialsError } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'trialing')
          .or('status.eq.active,status.eq.canceled,converted_at.is.not.null');
          
        if (trialsError) throw new Error(trialsError.message);
        
        // Count conversions
        const { count: totalConversions, error: conversionsError } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .not('converted_at', 'is', null);
          
        if (conversionsError) throw new Error(conversionsError.message);
        
        // Count active subscriptions
        const { count: activeSubscriptions, error: activeError } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
          
        if (activeError) throw new Error(activeError.message);
        
        // Count canceled subscriptions
        const { count: canceledSubscriptions, error: canceledError } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'canceled');
          
        if (canceledError) throw new Error(canceledError.message);
        
        // Calculate conversion rate
        const conversionRate = totalTrials ? (totalConversions / totalTrials) * 100 : 0;
        
        setAnalyticsData({
          totalTrials: totalTrials || 0,
          totalConversions: totalConversions || 0,
          conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
          activeSubscriptions: activeSubscriptions || 0,
          canceledSubscriptions: canceledSubscriptions || 0
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred loading analytics');
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      loadAnalytics();
    }
  }, [supabase, router, user, isAuthenticated, authLoading]);
  
  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Subscription Analytics</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Subscription Analytics</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trial Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData.totalConversions} conversions from {analyticsData.totalTrials} trials
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently paying customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Canceled Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.canceledSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Former paying customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">30%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${analyticsData.conversionRate >= 30 ? 'bg-green-600' : 'bg-blue-600'}`} 
                style={{ width: `${Math.min(analyticsData.conversionRate * 100 / 30, 100)}%` }}>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional analytics could be added here */}
    </div>
  );
} 