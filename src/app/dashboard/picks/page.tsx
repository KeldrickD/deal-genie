'use client';

import { useAuthContext } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, TrendingUp, Banknote, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

// Define property type
interface PropertyPick {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  dealScore: number;
  roi: number;
  potentialRent: number;
  reason: string;
  imageUrl: string;
}

// Mock property data
const weeklyPicks: PropertyPick[] = [
  {
    id: 'pick1',
    address: '123 Investment Ave, San Francisco, CA',
    price: 750000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    type: 'Single Family',
    dealScore: 85,
    roi: 12.4,
    potentialRent: 3800,
    reason: 'Undervalued property in high-growth neighborhood with strong rental demand',
    imageUrl: '/images/property1.jpg'
  },
  {
    id: 'pick2',
    address: '456 Opportunity Blvd, Austin, TX',
    price: 420000,
    bedrooms: 4, 
    bathrooms: 3,
    sqft: 2200,
    type: 'Single Family',
    dealScore: 92,
    roi: 15.1,
    potentialRent: 2900,
    reason: 'Recently renovated property in rapidly appreciating tech hub',
    imageUrl: '/images/property2.jpg'
  },
  {
    id: 'pick3',
    address: '789 Cash Flow St, Tampa, FL',
    price: 310000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1650,
    type: 'Townhouse',
    dealScore: 89,
    roi: 14.2,
    potentialRent: 2400,
    reason: 'Strong cash flow potential in growing Florida market',
    imageUrl: '/images/property3.jpg'
  },
  {
    id: 'pick4',
    address: '101 Market Dr, Charlotte, NC',
    price: 380000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1950,
    type: 'Single Family',
    dealScore: 87,
    roi: 13.5,
    potentialRent: 2600,
    reason: 'Well-maintained property in area with strong job growth',
    imageUrl: '/images/property4.jpg'
  },
];

// Placeholder image url for when real images aren't available
const placeholderImage = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=720&h=480';

export default function WeeklyPicks() {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <div className="p-8">Please log in to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Weekly Genie Picks</h1>
        <p className="text-muted-foreground mt-1">Personalized property recommendations updated weekly</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            This Week's Investment Opportunities
          </CardTitle>
          <CardDescription>
            Based on your investment preferences and market analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Picks</TabsTrigger>
              <TabsTrigger value="high-roi">High ROI</TabsTrigger>
              <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
              <TabsTrigger value="appreciation">Appreciation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {weeklyPicks.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </TabsContent>
            
            <TabsContent value="high-roi" className="space-y-6">
              {weeklyPicks
                .filter(p => p.roi > 14)
                .map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))
              }
            </TabsContent>
            
            <TabsContent value="cash-flow" className="space-y-6">
              {weeklyPicks
                .filter(p => p.potentialRent / p.price > 0.007)
                .map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))
              }
            </TabsContent>
            
            <TabsContent value="appreciation" className="space-y-6">
              {weeklyPicks
                .filter(p => p.address.includes("San Francisco") || p.address.includes("Austin"))
                .map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))
              }
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>How Genie Picks Work</CardTitle>
          <CardDescription>Powered by AI and market analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Each week, our AI analyzes thousands of properties across major markets to find the best 
            investment opportunities based on your preferences and investment goals.
          </p>
          <p>
            Properties are scored based on multiple factors including potential ROI, cash flow, appreciation
            potential, neighborhood growth, and comparable sales.
          </p>
          <p>
            Help us improve your recommendations by providing feedback on each property pick using the 
            thumbs up/down buttons.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for property cards
function PropertyCard({ property }: { property: PropertyPick }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          {/* Property image */}
          <div className="h-full min-h-[260px] bg-muted relative">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${placeholderImage})`
              }}
            />
            
            {/* Deal score */}
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground font-bold rounded-full p-3 shadow-lg">
              {property.dealScore}
              <span className="text-xs block text-center">Score</span>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 p-4 flex flex-col">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{property.address}</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {property.type}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <div className="font-bold text-xl text-primary">
                {formatCurrency(property.price)}
              </div>
              <div className="flex items-center text-amber-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>ROI: {property.roi}%</span>
              </div>
            </div>
            
            <div className="flex gap-3 text-sm text-muted-foreground">
              <div>{property.bedrooms} beds</div>
              <div>{property.bathrooms} baths</div>
              <div>{property.sqft.toLocaleString()} sqft</div>
            </div>
            
            <div className="flex items-center text-green-600">
              <Banknote className="h-4 w-4 mr-1" />
              <span>Est. Rent: {formatCurrency(property.potentialRent)}/mo</span>
            </div>
            
            <div className="mt-2">
              <h4 className="font-medium mb-1">Why it's a good investment:</h4>
              <p className="text-sm text-muted-foreground">{property.reason}</p>
            </div>
          </div>
          
          <div className="flex items-center mt-auto pt-4 justify-between">
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <ThumbsUp className="h-4 w-4 mr-1" />
                Like
              </Button>
              <Button size="sm" variant="outline">
                <ThumbsDown className="h-4 w-4 mr-1" />
                Dislike
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm">
                View Analysis
              </Button>
              <Button size="sm" variant="outline">
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 