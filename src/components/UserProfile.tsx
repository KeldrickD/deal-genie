'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Comment out Slider until we have the package
// import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BarChart3, PieChart, TrendingUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/AuthProvider';

// Strategy types
const INVESTMENT_STRATEGIES = [
  { value: 'BRRRR', label: 'BRRRR (Buy, Rehab, Rent, Refinance, Repeat)' },
  { value: 'FIX_AND_FLIP', label: 'Fix and Flip' },
  { value: 'RENTAL', label: 'Buy and Hold Rental' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'MULTI_STRATEGY', label: 'Multi-Strategy' },
];

// Interface for the user's investment profile
interface InvestmentProfile {
  strategy: string;
  riskTolerance: number;
  targetRoi: number;
  propertyTypes: string[];
  marketPreferences: string[];
  minDealSize: number;
  maxDealSize: number;
  rehabExperience: string;
}

// Default profile values
const DEFAULT_PROFILE: InvestmentProfile = {
  strategy: 'MULTI_STRATEGY',
  riskTolerance: 50,
  targetRoi: 15,
  propertyTypes: ['SFH'],
  marketPreferences: [],
  minDealSize: 50000,
  maxDealSize: 300000,
  rehabExperience: 'MODERATE',
};

export default function UserProfile() {
  const { user, supabase } = useAuthContext();
  const [profile, setProfile] = useState<InvestmentProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');
  const [dealHistory, setDealHistory] = useState<any[]>([]);
  
  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user || !supabase) return;
      
      try {
        setIsLoading(true);
        
        // Fetch the user's profile from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // If the user has a profile with investment data, use it, otherwise use default
        if (data && data.investment_data) {
          setProfile(data.investment_data as InvestmentProfile);
        }
        
        // Fetch deal history for insights
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (dealsError) {
          console.error('Error fetching deals:', dealsError);
        } else {
          setDealHistory(dealsData || []);
        }
        
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, [user, supabase]);
  
  // Handle form input changes
  const handleProfileChange = (field: keyof InvestmentProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save profile to database
  const saveProfile = async () => {
    if (!user || !supabase) {
      toast.error('You must be logged in to save your profile');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          investment_data: profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your investment profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Genie Profile</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="preferences">Investment Preferences</TabsTrigger>
          <TabsTrigger value="insights">Profile Insights</TabsTrigger>
          <TabsTrigger value="history">Deal History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Investment Strategy</CardTitle>
              <CardDescription>
                Tell Genie about your investment approach and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="strategy">Primary Investment Strategy</Label>
                <Select
                  value={profile.strategy}
                  onValueChange={(value) => handleProfileChange('strategy', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_STRATEGIES.map((strategy) => (
                      <SelectItem key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Risk Tolerance</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Conservative</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={profile.riskTolerance}
                    onChange={(e) => handleProfileChange('riskTolerance', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">Aggressive</span>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {profile.riskTolerance < 25 ? 'Conservative' : 
                   profile.riskTolerance < 50 ? 'Moderate' : 
                   profile.riskTolerance < 75 ? 'Growth-Oriented' : 'Aggressive'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Target ROI (Annual %)</Label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={profile.targetRoi}
                    onChange={(e) => handleProfileChange('targetRoi', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-16 text-right">
                    <span className="font-medium">{profile.targetRoi}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minDealSize">Minimum Deal Size</Label>
                  <Input
                    id="minDealSize"
                    type="number"
                    value={profile.minDealSize}
                    onChange={(e) => handleProfileChange('minDealSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">
                    {formatCurrency(profile.minDealSize)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxDealSize">Maximum Deal Size</Label>
                  <Input
                    id="maxDealSize"
                    type="number"
                    value={profile.maxDealSize}
                    onChange={(e) => handleProfileChange('maxDealSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">
                    {formatCurrency(profile.maxDealSize)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rehabExperience">Rehab Experience Level</Label>
                <Select
                  value={profile.rehabExperience}
                  onValueChange={(value) => handleProfileChange('rehabExperience', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your rehab experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner (Cosmetic Renovations Only)</SelectItem>
                    <SelectItem value="MODERATE">Moderate (Minor Structural Work)</SelectItem>
                    <SelectItem value="ADVANCED">Advanced (Major Renovations)</SelectItem>
                    <SelectItem value="EXPERT">Expert (Full Gut Rehabs & Development)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfile} disabled={isSaving} className="ml-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Your Investment Profile Insights</CardTitle>
              <CardDescription>
                Genie's analysis of your investment style based on your preferences and past deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                    <h3 className="font-medium">Strategy Profile</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Primary Strategy</span>
                        <span className="font-medium">
                          {INVESTMENT_STRATEGIES.find(s => s.value === profile.strategy)?.label || profile.strategy}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Risk Profile</span>
                        <span className="font-medium">
                          {profile.riskTolerance < 25 ? 'Conservative' : 
                           profile.riskTolerance < 50 ? 'Moderate' : 
                           profile.riskTolerance < 75 ? 'Growth-Oriented' : 'Aggressive'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Target Returns</span>
                        <span className="font-medium">{profile.targetRoi}% ROI</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                    <h3 className="font-medium">Deal Preferences</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Deal Size Range</span>
                        <span className="font-medium">
                          {formatCurrency(profile.minDealSize)} - {formatCurrency(profile.maxDealSize)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Rehab Experience</span>
                        <span className="font-medium">
                          {profile.rehabExperience === 'BEGINNER' ? 'Beginner' : 
                           profile.rehabExperience === 'MODERATE' ? 'Moderate' : 
                           profile.rehabExperience === 'ADVANCED' ? 'Advanced' : 'Expert'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                    <h3 className="font-medium">Performance Summary</h3>
                  </div>
                  {dealHistory.length > 0 ? (
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total Deals</span>
                          <span className="font-medium">{dealHistory.length}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Avg. Deal Size</span>
                          <span className="font-medium">
                            {formatCurrency(
                              dealHistory.reduce((sum, deal) => sum + (deal.purchase_price || 0), 0) / 
                              dealHistory.length
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No deal history available yet. As you analyze and track deals, Genie will 
                      generate insights about your investment performance.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-medium mb-2">Genie's Recommendations</h3>
                <p className="text-sm">
                  Based on your profile, Genie will prioritize deals that match your {
                    profile.riskTolerance < 40 ? 'conservative' : 
                    profile.riskTolerance > 70 ? 'aggressive' : 'balanced'
                  } investment style with a target ROI of {profile.targetRoi}% or higher. 
                  {profile.strategy === 'BRRRR' ? 
                    ' BRRRR strategy deals will be flagged as most relevant to your goals.' : 
                   profile.strategy === 'FIX_AND_FLIP' ? 
                    ' Fix and flip opportunities will be prioritized in your deal analysis.' : 
                   profile.strategy === 'RENTAL' ? 
                    ' Rental property cash flow will be emphasized in your analysis results.' : 
                    ' A mix of strategies will be considered based on deal specifics.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Your Deal History</CardTitle>
              <CardDescription>
                Past deals and analyses that inform your investment profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dealHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-2 border">Property</th>
                        <th className="p-2 border">Purchase Price</th>
                        <th className="p-2 border">Status</th>
                        <th className="p-2 border">Type</th>
                        <th className="p-2 border">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealHistory.map((deal) => (
                        <tr key={deal.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 border font-medium">{deal.address || 'Unnamed Property'}</td>
                          <td className="p-2 border">
                            {deal.purchase_price ? formatCurrency(deal.purchase_price) : 'N/A'}
                          </td>
                          <td className="p-2 border">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              deal.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 
                              deal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              deal.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {deal.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="p-2 border">{deal.deal_type || 'N/A'}</td>
                          <td className="p-2 border">
                            {deal.created_at ? new Date(deal.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No deal history available yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    As you analyze properties and track deals, they will appear here
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.href = '/deals/new'}
                  >
                    Add Your First Deal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 