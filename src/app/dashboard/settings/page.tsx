'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuthContext } from '@/components/AuthProvider';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const { user, supabase, isAuthenticated } = useAuthContext();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    dealAlerts: true,
    marketUpdates: false,
    weeklyNewsletter: true,
    propertyRecommendations: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    // Simulate saving to database
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Would normally save to supabase here
    // if (supabase && user) {
    //   await supabase.from('user_settings').upsert({
    //     user_id: user.id,
    //     settings: settings
    //   });
    // }
    
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  if (!isAuthenticated) {
    return <div className="p-8">Please log in to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Notification Settings</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Control what emails you receive from Deal Genie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all email notifications
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="deal-alerts" className="font-medium">
                Deal Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new deals that match your criteria
              </p>
            </div>
            <Switch
              id="deal-alerts"
              checked={settings.dealAlerts}
              onCheckedChange={() => handleToggle('dealAlerts')}
              disabled={!settings.emailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="market-updates" className="font-medium">
                Market Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates on market trends and changes
              </p>
            </div>
            <Switch
              id="market-updates"
              checked={settings.marketUpdates}
              onCheckedChange={() => handleToggle('marketUpdates')}
              disabled={!settings.emailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-newsletter" className="font-medium">
                Weekly Newsletter
              </Label>
              <p className="text-sm text-muted-foreground">
                Our weekly digest of real estate investment tips
              </p>
            </div>
            <Switch
              id="weekly-newsletter"
              checked={settings.weeklyNewsletter}
              onCheckedChange={() => handleToggle('weeklyNewsletter')}
              disabled={!settings.emailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="property-recommendations" className="font-medium">
                Property Recommendations
              </Label>
              <p className="text-sm text-muted-foreground">
                Weekly personalized property recommendations
              </p>
            </div>
            <Switch
              id="property-recommendations"
              checked={settings.propertyRecommendations}
              onCheckedChange={() => handleToggle('propertyRecommendations')}
              disabled={!settings.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
} 