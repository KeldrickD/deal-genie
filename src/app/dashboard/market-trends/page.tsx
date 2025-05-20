'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from '@/components/AuthProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const marketData = [
  { month: 'Jan', sales: 65, listings: 120, avgPrice: 320000 },
  { month: 'Feb', sales: 59, listings: 110, avgPrice: 325000 },
  { month: 'Mar', sales: 80, listings: 140, avgPrice: 330000 },
  { month: 'Apr', sales: 81, listings: 145, avgPrice: 335000 },
  { month: 'May', sales: 56, listings: 160, avgPrice: 340000 },
  { month: 'Jun', sales: 55, listings: 180, avgPrice: 342000 },
  { month: 'Jul', sales: 40, listings: 170, avgPrice: 345000 },
];

const formattedPriceData = marketData.map(item => ({
  ...item,
  avgPrice: item.avgPrice / 1000, // Convert to K for display
}));

export default function MarketTrends() {
  const { isAuthenticated } = useAuthContext();
  const [selectedRegion, setSelectedRegion] = useState('national');

  if (!isAuthenticated) {
    return <div className="p-8">Please log in to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Market Trends</h1>
          <p className="text-muted-foreground mt-1">Track real estate market performance</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className="border rounded-md p-1">
            <Button 
              variant={selectedRegion === 'national' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedRegion('national')}
            >
              National
            </Button>
            <Button 
              variant={selectedRegion === 'regional' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedRegion('regional')}
            >
              Regional
            </Button>
            <Button 
              variant={selectedRegion === 'local' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedRegion('local')}
            >
              Local
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Summary</CardTitle>
                <CardDescription>Last 7 months of market activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="sales" name="Sales" stroke="#8884d8" />
                      <Line yAxisId="left" type="monotone" dataKey="listings" name="Listings" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Home Prices</CardTitle>
                <CardDescription>In thousands of dollars</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedPriceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}K`, 'Avg Price']} />
                      <Bar dataKey="avgPrice" fill="#8884d8" name="Avg Price ($K)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Volume Trends</CardTitle>
              <CardDescription>Monthly sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Sales volume has fluctuated throughout the year with a peak in April followed by a decline.
                Current trends suggest a potential recovery in the coming months.
              </p>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Levels</CardTitle>
              <CardDescription>Available listings by month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Inventory levels have been increasing steadily since the beginning of the year, 
                with a slight drop in July, suggesting a slight shift toward a buyer's market.
              </p>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="listings" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Price Trends</CardTitle>
              <CardDescription>Average home prices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Home prices have shown consistent growth through the year, with the average price 
                increasing by approximately 7.8% since January.
              </p>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[300000, 350000]} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Avg Price']} />
                    <Line type="monotone" dataKey="avgPrice" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>Analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              <strong>Current Market Status:</strong> The market is currently showing signs of stabilization after 
              a period of high price growth. Inventory is increasing which may lead to more balanced conditions.
            </p>
            <p>
              <strong>Investment Recommendations:</strong> Consider focusing on properties in the mid-price range 
              which have shown the most consistent appreciation. Markets with job growth continue to outperform.
            </p>
            <p>
              <strong>Future Outlook:</strong> Modest price growth is expected to continue, though at a slower pace 
              than in previous quarters. Rising interest rates may impact buyer demand in the coming months.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 