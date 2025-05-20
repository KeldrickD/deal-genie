'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, ExternalLink, Heart, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import MobileOptimizedDashboard from '@/components/MobileOptimizedDashboard';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import SocialProofWidget from '@/components/SocialProofWidget';
import XPProgressCard from '@/components/XPProgressCard';
import ReferralWidget from '@/components/ReferralWidget';

export default function Genie2Dashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'dashboard' | 'details'>('dashboard');
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);
  
  if (!user) {
    return null;
  }
  
  const handleDismissAnnouncement = () => {
    setAnnouncementDismissed(true);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Announcement Banner */}
      {!announcementDismissed && (
        <AnnouncementBanner
          title="Welcome to Deal Genie 2.0! 🚀"
          features={[
            "Mobile-optimized dashboard for on-the-go investing",
            "XP & level progression to track your real estate journey",
            "Social proof with investor activity and testimonials",
            "Referral system to grow your network and earn rewards",
            "Weekly personalized property recommendations via email"
          ]}
          onDismiss={handleDismissAnnouncement}
          variant="success"
        />
      )}
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Genie 2.0 Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          <Button variant="secondary" size="sm">
            <Heart className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
              <TabsTrigger value="mobile" className="flex-1">Mobile View</TabsTrigger>
              <TabsTrigger value="social" className="flex-1">Social Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Properties Dashboard</CardTitle>
                  <CardDescription>
                    Your real estate investment opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-12 text-muted-foreground">
                    Regular desktop dashboard view would appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mobile" className="mt-4">
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="max-w-md mx-auto border-x border-gray-200 h-[600px] overflow-y-auto">
                    <MobileOptimizedDashboard />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="social" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Property Social Activity</CardTitle>
                  <CardDescription>
                    See what other investors are saying
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Placeholder IDs - in a real implementation these would be actual property IDs */}
                    <SocialProofWidget propertyId="property-123" />
                    <SocialProofWidget propertyId="property-456" compact={true} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* XP Progress */}
          <XPProgressCard />
          
          {/* Referral Widget */}
          <ReferralWidget />
          
          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/picks" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-primary mr-2" />
                      <span>Weekly Genie Picks</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/market-trends" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-primary mr-2" />
                      <span>Market Trends</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-primary mr-2" />
                      <span>Notification Settings</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 