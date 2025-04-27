'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LeadCard from './LeadCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Lead = {
  id: string;
  user_id: string;
  address: string;
  city: string;
  price: number;
  days_on_market: number;
  description: string;
  source: string;
  keywords_matched: string[];
  listing_url: string;
  created_at: string;
};

export default function LeadSearch() {
  // State for search form
  const [city, setCity] = useState('');
  const [priceRange, setPriceRange] = useState([100000, 500000]);
  const [daysOnMarket, setDaysOnMarket] = useState(30);
  const [daysOnMarketOption, setDaysOnMarketOption] = useState("less"); // "less" or "more"
  const [sources, setSources] = useState({
    zillow: true,
    craigslist: true,
    facebook: true,
    realtor: true
  });
  const [keywords, setKeywords] = useState({
    'as-is': true,
    'motivated-seller': true,
    'must-sell': true,
    'fixer-upper': true,
    'needs-work': true,
    'handyman-special': true,
    'distressed': true,
    'estate-sale': true,
    'tlc': true,
    'investor': true,
    'cash': true,
    'fixer': true,
    'needs': true,
    'motivated': true,
    'all-offers': true,
    'handyman': true
  });

  // State for search results
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!city) {
      toast.error('Please enter a city to search');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare the search parameters
      const selectedSources = Object.entries(sources)
        .filter(([_, selected]) => selected)
        .map(([name, _]) => name);

      const selectedKeywords = Object.entries(keywords)
        .filter(([_, selected]) => selected)
        .map(([name, _]) => name);

      // Call the API
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          priceMin: priceRange[0],
          priceMax: priceRange[1],
          days_on_market: daysOnMarket,
          days_on_market_option: daysOnMarketOption,
          sources: selectedSources,
          keywords: selectedKeywords.join(',')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search for leads');
      }

      setLeads(data.leads || []);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Error searching for leads:', error);
      setError(error.message || 'Failed to search for leads. Please try again.');
      toast.error('Failed to search for leads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLead = async (lead: Lead) => {
    try {
      const response = await fetch('/api/leads/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lead),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save lead');
      }

      toast.success('Lead saved successfully!');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead. Please try again.');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Search Form */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Search Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="city">City (required)</Label>
              <Input 
                id="city" 
                placeholder="Enter city name" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}</Label>
              <Slider
                defaultValue={[100000, 500000]}
                min={50000}
                max={1000000}
                step={10000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="py-4"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Days on Market: {daysOnMarket} days</Label>
                <Select 
                  value={daysOnMarketOption}
                  onValueChange={setDaysOnMarketOption}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less">or less</SelectItem>
                    <SelectItem value="more">or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Slider
                defaultValue={[30]}
                min={1}
                max={180}
                step={1}
                value={[daysOnMarket]}
                onValueChange={(value) => setDaysOnMarket(value[0])}
                className="py-4"
              />
            </div>

            <Tabs defaultValue="sources">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sources" className="space-y-2 pt-2">
                {Object.entries(sources).map(([name, checked]) => (
                  <div key={name} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`source-${name}`} 
                      checked={checked}
                      onCheckedChange={(checked) => 
                        setSources(prev => ({ ...prev, [name]: !!checked }))
                      }
                    />
                    <Label htmlFor={`source-${name}`} className="capitalize">{name}</Label>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="keywords" className="space-y-2 pt-2 max-h-60 overflow-y-auto">
                {Object.entries(keywords).map(([name, checked]) => (
                  <div key={name} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`keyword-${name}`} 
                      checked={checked}
                      onCheckedChange={(checked) => 
                        setKeywords(prev => ({ ...prev, [name]: !!checked }))
                      }
                    />
                    <Label htmlFor={`keyword-${name}`} className="capitalize">{name.replace(/-/g, ' ')}</Label>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Searching...' : 'Search For Leads'}
            </Button>
          </CardFooter>
        </Card>

        {/* Results Section */}
        <div className="lg:col-span-8">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <h3 className="text-xl font-medium mb-2">Searching for Leads</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Fetching leads from {Object.entries(sources).filter(([_, selected]) => selected).length} sources in {city}...
                </p>
              </CardContent>
            </Card>
          ) : hasSearched ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Results for {city}</h2>
                <div className="text-sm text-gray-500">
                  Found {leads.length} leads
                </div>
              </div>
              
              {leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <LeadCard 
                      key={lead.id} 
                      lead={lead} 
                      onSavedToCrm={(leadId) => {
                        toast.success('Lead saved to CRM!');
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border rounded-lg p-6 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium">No leads found</h3>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search criteria or expanding your price range.
                  </p>
                </div>
              )}
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Start Your Lead Search</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Enter a city and customize your search criteria to find FSBO leads across multiple sources.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
} 