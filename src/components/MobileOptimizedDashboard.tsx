'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Loader2, MapPin, TrendingUp, Bell, Calendar, Filter, ChevronRight, Zap, Phone, Navigation, Star, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/AuthProvider';
import { formatCurrency, cn } from '@/lib/utils';
import { calculateGenieDealScore } from '@/app/ai/actions';
import FeedbackWidget from './FeedbackWidget';
import SocialProofWidget from './SocialProofWidget';
import XPProgressCard from './XPProgressCard';
import AnnouncementBanner from './AnnouncementBanner';
import Sparkline from './Sparkline';

// Mock data structure similar to SmartScoutDashboard component
const MOCK_PROPERTIES = Array(10).fill(null).map((_, i) => ({
  id: `prop-${i}`,
  address: `${123 + i} Main St, Unit ${i+1}`,
  zipCode: ['94107', '90210', '92660', '75001', '80301'][i % 5],
  price: 500000 + (i * 75000),
  priceDropPercent: (i % 5) + 1,
  potentialROI: 10 + (i % 7),
  dealScore: 65 + (i % 30),
  daysOnMarket: 15 + (i % 45),
  bedrooms: 2 + (i % 4),
  bathrooms: 2 + (i % 3),
  sqft: 1200 + (i * 250),
  propertyType: ['Single Family', 'Multi-Family', 'Condo', 'Townhouse'][i % 4],
  yearBuilt: 1980 + (i * 5),
  attomData: {
    avm: 550000 + (i * 80000),
    equity: 50000 + (i * 25000),
    owner_occupied: i % 2 === 0,
    lastSaleAmount: 450000 + (i * 50000),
    lastSaleDate: `2020-${(i % 12) + 1}-01`,
    taxAssessedValue: 500000 + (i * 60000),
    zoning: ['R1', 'R2', 'MF', 'MU'][i % 4],
    lotSize: 5000 + (i * 1000),
    distressed: i % 10 === 0,
    ownerNames: `Owner ${i+1}`
  }
}));

export default function MobileOptimizedDashboard() {
  const { user, supabase } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    minDealScore: 65,
    maxPrice: 2000000,
    minROI: 8,
    propertyTypes: ['Single Family', 'Multi-Family']
  });
  const [showGenie2Banner, setShowGenie2Banner] = useState(true);
  const [selectedSort, setSelectedSort] = useState('dealScore');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Load properties
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          // Sort the properties
          const sortedProperties = [...MOCK_PROPERTIES].sort((a, b) => {
            if (selectedSort === 'dealScore') return b.dealScore - a.dealScore;
            if (selectedSort === 'price') return a.price - b.price;
            if (selectedSort === 'roi') return b.potentialROI - a.potentialROI;
            if (selectedSort === 'newest') return a.daysOnMarket - b.daysOnMarket;
            return 0;
          });
          
          // Apply filters
          const filteredProperties = sortedProperties.filter(p => 
            p.dealScore >= filterOptions.minDealScore &&
            p.price <= filterOptions.maxPrice &&
            p.potentialROI >= filterOptions.minROI &&
            filterOptions.propertyTypes.includes(p.propertyType)
          );
          
          setProperties(filteredProperties);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error loading properties:', error);
        toast.error('Failed to load properties');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedSort, filterOptions]);
  
  // Deal score indicator styles
  const getDealScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 75) return 'bg-green-400';
    if (score >= 65) return 'bg-yellow-400';
    return 'bg-red-400';
  };
  
  const getDealScoreGradient = (score: number) => {
    if (score >= 85) return 'from-green-400 to-green-600';
    if (score >= 70) return 'from-green-300 to-green-500';
    if (score >= 55) return 'from-yellow-300 to-yellow-500';
    return 'from-red-300 to-red-500';
  };

  // Quick action buttons based on property location
  const handleCallAgent = (property: any) => {
    toast.success('Connecting to listing agent...');
    // In a real app, this would initiate a call
  };
  
  const handleGetDirections = (property: any) => {
    toast.success('Opening navigation to property...');
    // In a real app, this would open maps with directions
  };
  
  const handleShareProperty = (property: any) => {
    toast.success('Sharing options opened');
    // In a real app, this would open the native share dialog
  };
  
  const handleSaveProperty = (property: any) => {
    toast('Property saved to your list', {
      description: 'You can access your saved properties in your profile',
      action: {
        label: 'View',
        onClick: () => console.log('View saved properties')
      }
    });
    // In a real app, this would save the property to the user's account
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-center text-muted-foreground">Loading properties...</p>
      </div>
    );
  }
  
  return (
    <div className="pb-16"> {/* Extra padding for bottom nav */}
      {/* Genie 2.0 Announcement */}
      {showGenie2Banner && (
        <AnnouncementBanner
          title="Welcome to Genie 2.0!"
          features={[
            "New mobile experience for investors on the go",
            "Track your investor XP and level up",
            "See what other investors are saying about properties"
          ]}
          onDismiss={() => setShowGenie2Banner(false)}
          variant="success"
        />
      )}
      
      {/* Main Content */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="discover" className="mt-0 space-y-3">
          {/* Filter Controls */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Top Deals</h2>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Filter Properties</SheetTitle>
                  <SheetDescription>
                    Customize your property search
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deal Score (Min: {filterOptions.minDealScore})</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={filterOptions.minDealScore}
                      onChange={(e) => setFilterOptions({...filterOptions, minDealScore: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Price: {formatCurrency(filterOptions.maxPrice)}</label>
                    <input 
                      type="range" 
                      min="100000" 
                      max="5000000" 
                      step="50000"
                      value={filterOptions.maxPrice}
                      onChange={(e) => setFilterOptions({...filterOptions, maxPrice: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min ROI: {filterOptions.minROI}%</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="30" 
                      value={filterOptions.minROI}
                      onChange={(e) => setFilterOptions({...filterOptions, minROI: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Types</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Single Family', 'Multi-Family', 'Condo', 'Townhouse'].map(type => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filterOptions.propertyTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilterOptions({
                                  ...filterOptions, 
                                  propertyTypes: [...filterOptions.propertyTypes, type]
                                });
                              } else {
                                setFilterOptions({
                                  ...filterOptions,
                                  propertyTypes: filterOptions.propertyTypes.filter(t => t !== type)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setFilterOptions({
                        minDealScore: 65,
                        maxPrice: 2000000,
                        minROI: 8,
                        propertyTypes: ['Single Family', 'Multi-Family']
                      })}
                    >
                      Reset
                    </Button>
                    <Button onClick={() => setFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Sort Options */}
          <div className="flex overflow-x-auto py-2 space-x-2 no-scrollbar">
            <Badge 
              variant={selectedSort === 'dealScore' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedSort('dealScore')}
            >
              Best Score
            </Badge>
            <Badge 
              variant={selectedSort === 'price' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedSort('price')}
            >
              Lowest Price
            </Badge>
            <Badge 
              variant={selectedSort === 'roi' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedSort('roi')}
            >
              Highest ROI
            </Badge>
            <Badge 
              variant={selectedSort === 'newest' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedSort('newest')}
            >
              Newest Listings
            </Badge>
          </div>
          
          {/* Mobile Property Cards */}
          <div className="space-y-4 mt-2">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="relative">
                  {/* Property Image */}
                  <div className="h-40 bg-gray-200 relative">
                    {/* Placeholder for property image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Property Image
                    </div>
                    
                    {/* Deal Score Badge */}
                    <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                      <div className={`text-white text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center bg-gradient-to-r ${getDealScoreGradient(property.dealScore)}`}>
                        {property.dealScore}
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {property.attomData.owner_occupied ? 'Owner Occ.' : 'Investor'}
                      </Badge>
                    </div>
                    
                    {/* Price Drop Badge */}
                    {property.priceDropPercent > 0 && (
                      <Badge className="absolute bottom-2 left-2 bg-green-500 text-white">
                        Price Drop: {property.priceDropPercent}%
                      </Badge>
                    )}
                  </div>
                  
                  {/* Property Details */}
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{property.address}</h3>
                          <p className="text-sm text-muted-foreground">{property.zipCode} • {property.propertyType}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(property.price)}</p>
                          <p className="text-xs text-muted-foreground">AVM: {formatCurrency(property.attomData.avm)}</p>
                        </div>
                      </div>
                      
                      {/* Property Stats */}
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <div>
                          <p className="text-muted-foreground">Beds</p>
                          <p className="font-medium">{property.bedrooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Baths</p>
                          <p className="font-medium">{property.bathrooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sqft</p>
                          <p className="font-medium">{property.sqft.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Investment Stats */}
                      <div className="grid grid-cols-3 gap-1 text-sm border-t pt-2 mt-2">
                        <div>
                          <p className="text-muted-foreground">ROI</p>
                          <p className="font-medium text-green-600">{property.potentialROI}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Equity</p>
                          <p className="font-medium">{formatCurrency(property.attomData.equity)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">DOM</p>
                          <p className="font-medium">{property.daysOnMarket} days</p>
                        </div>
                      </div>
                      
                      {/* Value Trend */}
                      <div className="border-t pt-2 pb-1">
                        <p className="text-xs text-muted-foreground mb-1">Value Trend</p>
                        <Sparkline 
                          data={[property.attomData.lastSaleAmount * 0.9, property.attomData.lastSaleAmount, property.attomData.avm * 0.95, property.attomData.avm]} 
                          height={30} 
                          width={280} 
                          showSpots={true}
                          showReferenceLine={false}
                        />
                      </div>
                      
                      {/* Social Proof */}
                      <div className="border-t pt-2">
                        <SocialProofWidget propertyId={property.id} compact={true} />
                      </div>
                      
                      {/* Quick Action Buttons */}
                      <div className="grid grid-cols-4 gap-1 pt-2 mt-1 border-t">
                        <Button size="sm" variant="ghost" className="flex flex-col h-auto py-1 px-0" onClick={() => handleCallAgent(property)}>
                          <Phone className="h-4 w-4" />
                          <span className="text-xs">Call</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="flex flex-col h-auto py-1 px-0" onClick={() => handleGetDirections(property)}>
                          <Navigation className="h-4 w-4" />
                          <span className="text-xs">Navigate</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="flex flex-col h-auto py-1 px-0" onClick={() => handleSaveProperty(property)}>
                          <Star className="h-4 w-4" />
                          <span className="text-xs">Save</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="flex flex-col h-auto py-1 px-0" onClick={() => handleShareProperty(property)}>
                          <Share2 className="h-4 w-4" />
                          <span className="text-xs">Share</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="mt-0">
          <div className="py-4">
            <XPProgressCard />
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
              <CardDescription>Track your investment actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground text-center py-8">Activity tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="mt-0">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Refer Friends</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Invite other investors and earn XP when they join
                  </p>
                  <Button className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Invite Investors
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">App Settings</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dark Mode</span>
                      <Button variant="outline" size="sm">Off</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Notifications</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Usage</span>
                      <Button variant="outline" size="sm">High Quality</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Bottom Navigation Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <TabsList className="grid w-full grid-cols-4 bg-transparent h-16">
          <TabsTrigger
            value="discover"
            className={cn(
              "flex flex-col h-full pt-2 rounded-none data-[state=active]:bg-background",
              activeTab === "discover" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Zap className="h-5 w-5" />
            <span className="text-xs mt-1">Discover</span>
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className={cn(
              "flex flex-col h-full pt-2 rounded-none data-[state=active]:bg-background",
              activeTab === "saved" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Star className="h-5 w-5" />
            <span className="text-xs mt-1">Progress</span>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className={cn(
              "flex flex-col h-full pt-2 rounded-none data-[state=active]:bg-background",
              activeTab === "activity" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs mt-1">Activity</span>
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className={cn(
              "flex flex-col h-full pt-2 rounded-none data-[state=active]:bg-background",
              activeTab === "account" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs mt-1">Account</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
} 