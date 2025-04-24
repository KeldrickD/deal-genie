'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, TrendingUp, Bell, Calendar, ArrowUpRight, ArrowDownRight, Filter, LineChart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/AuthProvider';
import { formatCurrency } from '@/lib/utils';

// Mock market data for development
const MOCK_MARKET_DATA = [
  {
    id: '1',
    zipCode: '32789',
    city: 'Winter Park',
    state: 'FL',
    medianPrice: 485000,
    priceChange: 5.2,
    avgDOM: 22,
    dealCount: 15,
    roiPotential: 18.5,
    hotScore: 89,
    trend: 'up',
  },
  {
    id: '2',
    zipCode: '32801',
    city: 'Orlando',
    state: 'FL',
    medianPrice: 420000,
    priceChange: 3.8,
    avgDOM: 28,
    dealCount: 23,
    roiPotential: 16.2,
    hotScore: 76,
    trend: 'up',
  },
  {
    id: '3',
    zipCode: '32806',
    city: 'Orlando',
    state: 'FL',
    medianPrice: 395000,
    priceChange: -1.2,
    avgDOM: 35,
    dealCount: 18,
    roiPotential: 21.3,
    hotScore: 82,
    trend: 'down',
  },
  {
    id: '4',
    zipCode: '32803',
    city: 'Orlando',
    state: 'FL',
    medianPrice: 510000,
    priceChange: 2.5,
    avgDOM: 19,
    dealCount: 11,
    roiPotential: 14.7,
    hotScore: 72,
    trend: 'up',
  },
  {
    id: '5',
    zipCode: '32819',
    city: 'Orlando',
    state: 'FL',
    medianPrice: 625000,
    priceChange: 4.8,
    avgDOM: 31,
    dealCount: 9,
    roiPotential: 12.9,
    hotScore: 65,
    trend: 'up',
  },
];

// Mock property data for development
const MOCK_PROPERTIES = [
  {
    id: '101',
    address: '1234 Park Ave',
    zipCode: '32789',
    city: 'Winter Park',
    state: 'FL',
    price: 375000,
    originalPrice: 399000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1850,
    yearBuilt: 1998,
    daysOnMarket: 15,
    pricePerSqFt: 203,
    priceDropPercent: 6.0,
    estimatedARV: 465000,
    estimatedRepair: 35000,
    potentialROI: 22.8,
    dealScore: 87,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
  },
  {
    id: '102',
    address: '567 Lake Dr',
    zipCode: '32789',
    city: 'Winter Park',
    state: 'FL',
    price: 412000,
    originalPrice: 425000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2100,
    yearBuilt: 2002,
    daysOnMarket: 22,
    pricePerSqFt: 196,
    priceDropPercent: 3.1,
    estimatedARV: 510000,
    estimatedRepair: 45000,
    potentialROI: 17.2,
    dealScore: 79,
    imageUrl: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
  },
  {
    id: '103',
    address: '890 Central Blvd',
    zipCode: '32801',
    city: 'Orlando',
    state: 'FL',
    price: 299000,
    originalPrice: 329000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1450,
    yearBuilt: 1985,
    daysOnMarket: 38,
    pricePerSqFt: 206,
    priceDropPercent: 9.1,
    estimatedARV: 389000,
    estimatedRepair: 42000,
    potentialROI: 24.1,
    dealScore: 91,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  },
  {
    id: '104',
    address: '123 Highland St',
    zipCode: '32806',
    city: 'Orlando',
    state: 'FL',
    price: 352000,
    originalPrice: 375000,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1780,
    yearBuilt: 1992,
    daysOnMarket: 27,
    pricePerSqFt: 198,
    priceDropPercent: 6.1,
    estimatedARV: 445000,
    estimatedRepair: 38000,
    potentialROI: 20.5,
    dealScore: 85,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
  },
];

// Mock data for demonstration
const mockAlerts = [
  { 
    id: 1, 
    zipCode: '94107', 
    address: '123 Market St', 
    price: '$850,000',
    discount: '8% below market', 
    roi: '12.4%',
    date: '2023-09-15'
  },
  { 
    id: 2, 
    zipCode: '90210', 
    address: '456 Beverly Dr', 
    price: '$2,450,000',
    discount: '5% below market', 
    roi: '9.2%',
    date: '2023-09-14'
  },
  { 
    id: 3, 
    zipCode: '92660', 
    address: '789 Newport Blvd', 
    price: '$1,250,000',
    discount: '10% below market', 
    roi: '14.5%',
    date: '2023-09-13'
  },
];

const mockMarkets = [
  { id: 1, zipCode: '94107', performance: 'High', avgDOM: 15, priceChange: '+2.3%', roi: '11.2%' },
  { id: 2, zipCode: '90210', performance: 'Medium', avgDOM: 28, priceChange: '+0.8%', roi: '8.7%' },
  { id: 3, zipCode: '92660', performance: 'High', avgDOM: 12, priceChange: '+3.1%', roi: '12.5%' },
  { id: 4, zipCode: '10001', performance: 'Low', avgDOM: 45, priceChange: '-1.2%', roi: '6.3%' },
];

// User alert preferences interface
interface AlertPreferences {
  enableDailyAlerts: boolean;
  enableWeeklySummary: boolean;
  minDealScore: number;
  minROI: number;
  maxDaysOnMarket: number;
  minPriceDrop: number;
  targetZipCodes: string[];
  alertEmail: string;
  alertPhone: string | null;
}

// Default alert preferences
const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  enableDailyAlerts: true,
  enableWeeklySummary: true,
  minDealScore: 75,
  minROI: 15,
  maxDaysOnMarket: 45,
  minPriceDrop: 5,
  targetZipCodes: ['32789', '32801', '32806'],
  alertEmail: '',
  alertPhone: null,
};

// Add types for our user preferences
type SmartScoutPreferences = {
  targetZipCodes: string[];
  enableDailyAlerts: boolean;
  enableWeeklySummary: boolean;
  minDealScore: number;
  minROI: number;
  maxDaysOnMarket: number;
  minPriceDrop: number;
  alertEmail: string;
  alertPhone: string | null;
};

// Extend the session user type to include smart_scout_prefs
declare module '@/components/AuthProvider' {
  interface SessionUser {
    smart_scout_prefs?: SmartScoutPreferences;
  }
}

export default function SmartScoutDashboard() {
  const { user, supabase, session } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('markets');
  const [marketData, setMarketData] = useState<typeof MOCK_MARKET_DATA>([]);
  const [properties, setProperties] = useState<typeof MOCK_PROPERTIES>([]);
  const [alertPrefs, setAlertPrefs] = useState<AlertPreferences>(DEFAULT_ALERT_PREFERENCES);
  const [newZipCode, setNewZipCode] = useState('');
  const [userMarkets, setUserMarkets] = useState<string[]>(['94107', '90210', '92660']);
  const [alerts, setAlerts] = useState([
    { 
      id: 1, 
      zipCode: '94107', 
      address: '123 Market St', 
      price: '$850,000',
      discount: '8% below market', 
      roi: '12.4%',
      date: '2023-09-15'
    },
    { 
      id: 2, 
      zipCode: '90210', 
      address: '456 Beverly Dr', 
      price: '$2,450,000',
      discount: '5% below market', 
      roi: '9.2%',
      date: '2023-09-14'
    },
    { 
      id: 3, 
      zipCode: '92660', 
      address: '789 Newport Blvd', 
      price: '$1,250,000',
      discount: '10% below market', 
      roi: '14.5%',
      date: '2023-09-13'
    },
  ]);
  const [markets, setMarkets] = useState([
    { id: 1, zipCode: '94107', performance: 'High', avgDOM: 15, priceChange: '+2.3%', roi: '11.2%' },
    { id: 2, zipCode: '90210', performance: 'Medium', avgDOM: 28, priceChange: '+0.8%', roi: '8.7%' },
    { id: 3, zipCode: '92660', performance: 'High', avgDOM: 12, priceChange: '+3.1%', roi: '12.5%' },
    { id: 4, zipCode: '10001', performance: 'Low', avgDOM: 45, priceChange: '-1.2%', roi: '6.3%' },
  ]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  
  // Load user preferences and market data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // If we have a user, load their preferences
        if (session?.user) {
          // In a real app, this would fetch preferences from an API or database
          // For now, use default values
          setAlertPrefs(DEFAULT_ALERT_PREFERENCES);
          
          // Use default target zip codes
          const targetZips = DEFAULT_ALERT_PREFERENCES.targetZipCodes;
          
          // Simulate API call to get property data
          // In a real app, this would be an actual fetch
          const filteredProps = properties.filter(p => 
            targetZips.includes(p.zipCode) && 
            p.dealScore >= DEFAULT_ALERT_PREFERENCES.minDealScore &&
            p.potentialROI >= DEFAULT_ALERT_PREFERENCES.minROI &&
            p.daysOnMarket <= DEFAULT_ALERT_PREFERENCES.maxDaysOnMarket &&
            p.priceDropPercent >= DEFAULT_ALERT_PREFERENCES.minPriceDrop
          );
          
          setProperties(filteredProps);
          
          // Fetch user's saved markets, alerts, etc.
          // This would be replaced with actual API calls
          setUserMarkets(targetZips);
          setAlerts(mockAlerts);
          setMarkets(mockMarkets);
        }
      } catch (error) {
        console.error('Error loading Smart Scout data:', error);
        toast.error('Failed to load Smart Scout data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [session]);
  
  // Save user preferences
  const savePreferences = async () => {
    setIsSaving(true);
    
    try {
      if (session?.user) {
        // In a real app, this would be an API call to save preferences
        console.log('Saving preferences:', alertPrefs);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update in database/API would happen here
        // For now, just show success message
        toast.success('Preferences saved successfully');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add a new zip code to track
  const addZipCode = () => {
    if (!newZipCode) return;
    
    if (!/^\d{5}$/.test(newZipCode)) {
      toast.error('Please enter a valid 5-digit zip code');
      return;
    }
    
    if (alertPrefs.targetZipCodes.includes(newZipCode)) {
      toast.error('This zip code is already in your list');
      return;
    }
    
    setAlertPrefs(prev => ({
      ...prev,
      targetZipCodes: [...prev.targetZipCodes, newZipCode]
    }));
    
    setNewZipCode('');
    toast.success(`Added zip code ${newZipCode} to your tracked markets`);
  };
  
  // Remove a zip code from tracking
  const removeZipCode = (zipCode: string) => {
    setAlertPrefs(prev => ({
      ...prev,
      targetZipCodes: prev.targetZipCodes.filter(z => z !== zipCode)
    }));
    toast.success(`Removed zip code ${zipCode} from your tracked markets`);
  };
  
  // Handle preference changes
  const handlePrefChange = (field: keyof AlertPreferences, value: any) => {
    setAlertPrefs(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Helper to get a market health indicator
  const getMarketHealthIndicator = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  // Helper to get a deal score indicator
  const getDealScoreIndicator = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const handleAddZipCode = () => {
    if (newZipCode && !userMarkets.includes(newZipCode)) {
      setUserMarkets([...userMarkets, newZipCode]);
      setNewZipCode('');
    }
  };

  const handleRemoveZipCode = (zipCode: string) => {
    setUserMarkets(userMarkets.filter(z => z !== zipCode));
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Smart Scout data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tracked Markets</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userMarkets.length}</div>
                <p className="text-xs text-muted-foreground">
                  +1 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. ROI Potential</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">11.2%</div>
                <p className="text-xs text-muted-foreground">
                  +0.8% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                New potential deals in your tracked markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex flex-col p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{alert.address}</h3>
                        <p className="text-sm text-muted-foreground">ZIP: {alert.zipCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{alert.price}</p>
                        <p className="text-sm text-green-600">{alert.discount}</p>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Potential ROI: <span className="font-medium text-blue-600">{alert.roi}</span></span>
                      <span className="text-muted-foreground">{alert.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Alerts</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Alerts</CardTitle>
              <CardDescription>
                Properties with high ROI potential in your target markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map(alert => (
                    <div key={alert.id} className="flex flex-col p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{alert.address}</h3>
                          <p className="text-sm text-muted-foreground">ZIP: {alert.zipCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{alert.price}</p>
                          <p className="text-sm text-green-600">{alert.discount}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-sm">
                          <p className="text-muted-foreground">ROI</p>
                          <p className="font-medium">{alert.roi}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{alert.date}</p>
                        </div>
                        <div className="flex justify-end items-end">
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No alerts</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add more markets to receive alerts
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="markets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Performance</CardTitle>
              <CardDescription>
                Analysis of your tracked real estate markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">ZIP Code</th>
                      <th className="text-left py-3 px-2">Performance</th>
                      <th className="text-left py-3 px-2">Avg. DOM</th>
                      <th className="text-left py-3 px-2">Price Change</th>
                      <th className="text-left py-3 px-2">Avg. ROI</th>
                      <th className="text-left py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {markets.map(market => (
                      <tr key={market.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{market.zipCode}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            market.performance === 'High' ? 'bg-green-100 text-green-800' :
                            market.performance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {market.performance}
                          </span>
                        </td>
                        <td className="py-3 px-2">{market.avgDOM} days</td>
                        <td className={`py-3 px-2 ${market.priceChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {market.priceChange}
                        </td>
                        <td className="py-3 px-2">{market.roi}</td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm">Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Add Market</CardTitle>
              <CardDescription>
                Track additional markets for alerts and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter ZIP code"
                    value={newZipCode}
                    onChange={(e) => setNewZipCode(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddZipCode}>Add</Button>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Your Tracked Markets</h3>
                <div className="flex flex-wrap gap-2">
                  {userMarkets.map(zipCode => (
                    <div key={zipCode} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm">{zipCode}</span>
                      <button
                        onClick={() => handleRemoveZipCode(zipCode)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="alerts-enabled" className="font-medium">Enable Deal Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for new deals</p>
                </div>
                <Switch
                  id="alerts-enabled"
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-frequency">Alert Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="alert-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roi-threshold">Minimum ROI Threshold (%)</Label>
                <Input
                  id="roi-threshold"
                  type="number"
                  defaultValue="8"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price-threshold">Maximum Price ($)</Label>
                <Input
                  id="price-threshold"
                  type="number"
                  defaultValue="1000000"
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={savePreferences} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 