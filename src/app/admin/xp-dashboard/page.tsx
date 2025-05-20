'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function XPAdminDashboard() {
  const { user, supabase } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any[]>([]);
  const [topActivities, setTopActivities] = useState<any[]>([]);
  
  useEffect(() => {
    // Verify admin status
    if (user && !user.app_metadata?.admin) {
      router.push('/dashboard');
      return;
    }
    
    // Load data
    const loadData = async () => {
      setLoading(true);
      try {
        // Get top users by XP
        const { data: xpData, error: xpError } = await supabase
          .from('user_xp')
          .select('user_id, xp_total, user_profiles(email, full_name)')
          .order('xp_total', { ascending: false })
          .limit(10);
        
        if (xpError) throw xpError;
        
        // Get referral stats
        const { data: referralData, error: referralError } = await supabase
          .from('user_referrals')
          .select('referrer_id, user_profiles!referrer_id(email, full_name), count')
          .order('count', { ascending: false })
          .limit(10);
        
        if (referralError) throw referralError;
        
        // Get top XP activities
        const { data: activityData, error: activityError } = await supabase
          .from('xp_activities')
          .select('activity_type, count, total_xp')
          .order('total_xp', { ascending: false })
          .limit(10);
        
        if (activityError) throw activityError;
        
        setUserStats(xpData || []);
        setReferralStats(referralData || []);
        setTopActivities(activityData || []);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user, supabase, router]);
  
  const exportData = (dataType: 'xp' | 'referrals' | 'activities') => {
    let data;
    let filename;
    
    switch (dataType) {
      case 'xp':
        data = userStats;
        filename = 'user-xp-stats.csv';
        break;
      case 'referrals':
        data = referralStats;
        filename = 'referral-stats.csv';
        break;
      case 'activities':
        data = topActivities;
        filename = 'xp-activities.csv';
        break;
    }
    
    if (!data || data.length === 0) return;
    
    // Convert data to CSV
    const replacer = (key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    const csv = [
      header.join(','),
      ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!user || !user.app_metadata?.admin) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">Genie 2.0 XP & Referrals Admin</h1>
        </div>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>XP System Overview</CardTitle>
              <CardDescription>
                Monitor user progression and referral data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="text-2xl font-bold">
                    {loading ? '...' : userStats.length > 0 ? userStats[0].xp_total : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Highest User XP
                  </div>
                </div>
                <div className="p-4 border rounded-md">
                  <div className="text-2xl font-bold">
                    {loading ? '...' : referralStats.length > 0 ? referralStats[0].count : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Most Referrals by User
                  </div>
                </div>
                <div className="p-4 border rounded-md">
                  <div className="text-2xl font-bold">
                    {loading ? '...' : topActivities.length > 0 ? topActivities[0].total_xp : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Most Popular Activity (XP)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* XP Stats */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="users" className="flex-1">Top Users by XP</TabsTrigger>
              <TabsTrigger value="referrals" className="flex-1">Top Referrers</TabsTrigger>
              <TabsTrigger value="activities" className="flex-1">Top Activities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top Users by XP</CardTitle>
                    <CardDescription>
                      Users with the highest XP totals
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('xp')}
                    disabled={loading || !userStats.length}
                  >
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">User</th>
                            <th className="text-right py-2 px-4">XP Total</th>
                            <th className="text-right py-2 px-4">Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userStats.map((user, index) => (
                            <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="py-2 px-4">
                                {user.user_profiles?.full_name || user.user_profiles?.email || 'Unknown User'}
                              </td>
                              <td className="text-right py-2 px-4">
                                {user.xp_total}
                              </td>
                              <td className="text-right py-2 px-4">
                                {Math.floor(Math.log(user.xp_total + 100) / Math.log(1.5))}
                              </td>
                            </tr>
                          ))}
                          {!userStats.length && (
                            <tr>
                              <td colSpan={3} className="text-center py-4">No XP data found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="referrals" className="mt-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top Referrers</CardTitle>
                    <CardDescription>
                      Users who have referred the most new users
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('referrals')}
                    disabled={loading || !referralStats.length}
                  >
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">User</th>
                            <th className="text-right py-2 px-4">Referrals</th>
                            <th className="text-right py-2 px-4">XP Earned</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralStats.map((referral, index) => (
                            <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="py-2 px-4">
                                {referral.user_profiles?.full_name || referral.user_profiles?.email || 'Unknown User'}
                              </td>
                              <td className="text-right py-2 px-4">
                                {referral.count}
                              </td>
                              <td className="text-right py-2 px-4">
                                {referral.count * 100}
                              </td>
                            </tr>
                          ))}
                          {!referralStats.length && (
                            <tr>
                              <td colSpan={3} className="text-center py-4">No referral data found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities" className="mt-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top XP Activities</CardTitle>
                    <CardDescription>
                      Most popular ways users are earning XP
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('activities')}
                    disabled={loading || !topActivities.length}
                  >
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">Activity</th>
                            <th className="text-right py-2 px-4">Count</th>
                            <th className="text-right py-2 px-4">Total XP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topActivities.map((activity, index) => (
                            <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="py-2 px-4">
                                {activity.activity_type}
                              </td>
                              <td className="text-right py-2 px-4">
                                {activity.count}
                              </td>
                              <td className="text-right py-2 px-4">
                                {activity.total_xp}
                              </td>
                            </tr>
                          ))}
                          {!topActivities.length && (
                            <tr>
                              <td colSpan={3} className="text-center py-4">No activity data found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* XP System Management */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>XP System Management</CardTitle>
              <CardDescription>
                Configure and adjust the XP system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Configure XP Values</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Add Property</span>
                    <div className="w-20">
                      <input type="number" className="w-full border rounded p-1 text-right" defaultValue="50" min="0" max="1000" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Analyze Deal</span>
                    <div className="w-20">
                      <input type="number" className="w-full border rounded p-1 text-right" defaultValue="25" min="0" max="1000" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Make Offer</span>
                    <div className="w-20">
                      <input type="number" className="w-full border rounded p-1 text-right" defaultValue="100" min="0" max="1000" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Successful Referral</span>
                    <div className="w-20">
                      <input type="number" className="w-full border rounded p-1 text-right" defaultValue="100" min="0" max="1000" />
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Save XP Configuration
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">XP System Controls</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    Reset All XP (Danger)
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Recalculate Levels
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Grant Bonus XP
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Related Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <Link href="/admin" className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors">
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users" className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors">
                    User Management
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/genie2" className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors">
                    Genie 2.0 Dashboard
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