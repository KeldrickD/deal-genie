import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';

interface SearchFormProps {
  onSearch: (params: {
    city: string;
    state: string;
    priceMin: number;
    priceMax: number;
    days_on_market: number;
    days_on_market_option: string;
    sources: string[];
    keywords: string;
    listing_type: 'fsbo' | 'agent' | 'both';
  }) => void;
  isLoading: boolean;
  leadSources: string[];
}

const SearchForm = ({ onSearch, isLoading, leadSources }: SearchFormProps) => {
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(1000000);
  const [days_on_market, setDaysOnMarket] = useState<number>(7);
  const [selectedSources, setSelectedSources] = useState<string[]>(['zillow']);
  const [keywords, setKeywords] = useState<string>('');
  const [daysOnMarketOption, setDaysOnMarketOption] = useState<string>('any');
  const [listingType, setListingType] = useState<'fsbo' | 'agent' | 'both'>('both');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) {
      toast.error('City is required');
      return;
    }
    if (!state) {
      toast.error('State is required');
      return;
    }
    onSearch({
      city,
      state,
      priceMin,
      priceMax,
      days_on_market,
      days_on_market_option: daysOnMarketOption,
      sources: selectedSources,
      keywords,
      listing_type: listingType
    });
  };

  const handleSourceToggle = (source: string) => {
    if (selectedSources.includes(source)) {
      if (selectedSources.length > 1) { // Prevent deselecting all sources
        setSelectedSources(selectedSources.filter(s => s !== source));
      }
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-6">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Location Inputs */}
          <div className="space-y-2">
            <Label htmlFor="city">City (required)</Label>
            <Input
              id="city"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State (required)</Label>
            <Input
              id="state"
              placeholder="Enter state (e.g., GA or Georgia)"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Listing Type */}
          <div className="space-y-2">
            <Label htmlFor="listingType">Listing Type</Label>
            <Select 
              value={listingType} 
              onValueChange={(value) => setListingType(value as 'fsbo' | 'agent' | 'both')}
            >
              <SelectTrigger id="listingType">
                <SelectValue placeholder="Select listing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">All Listings</SelectItem>
                <SelectItem value="fsbo">For Sale By Owner</SelectItem>
                <SelectItem value="agent">Listed By Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
            <div className="flex justify-between">
              <Label htmlFor="price-range">Price Range</Label>
              <span className="text-sm text-gray-500">
                ${priceMin.toLocaleString()} - ${priceMax.toLocaleString()}
              </span>
            </div>
            <Slider
              id="price-range"
              defaultValue={[priceMin, priceMax]}
              min={0}
              max={5000000}
              step={10000}
              onValueChange={(values) => {
                setPriceMin(values[0]);
                setPriceMax(values[1]);
              }}
              className="py-4"
            />
          </div>

          {/* Days on Market */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="days_on_market">Days on Market</Label>
            <div className="flex space-x-2">
              <Select 
                value={daysOnMarketOption} 
                onValueChange={setDaysOnMarketOption}
              >
                <SelectTrigger id="days_on_market_option" className="w-[130px]">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="less">Less than</SelectItem>
                  <SelectItem value="more">More than</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                id="days_on_market"
                type="number"
                min={0}
                value={days_on_market}
                onChange={(e) => setDaysOnMarket(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md"
                disabled={daysOnMarketOption === 'any'}
              />
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="keywords">Keywords (comma separated)</Label>
            <Input
              id="keywords"
              placeholder="distressed, foreclosure, etc."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="border border-gray-300 rounded-md"
            />
          </div>

          {/* Sources */}
          <div className="space-y-2 col-span-1 md:col-span-3">
            <Label>Sources</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {leadSources.map((source) => (
                <Button
                  key={source}
                  type="button"
                  variant={selectedSources.includes(source) ? "default" : "outline"}
                  onClick={() => handleSourceToggle(source)}
                  className={`text-xs px-3 py-1 h-auto ${
                    selectedSources.includes(source)
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300"
                  }`}
                >
                  {source}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search Leads'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm; 