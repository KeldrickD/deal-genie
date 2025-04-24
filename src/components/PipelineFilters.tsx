'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_TYPES } from '@/lib/constants';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface PipelineFiltersProps {
  onFilterChange: (filters: PipelineFilters) => void;
}

export interface PipelineFilters {
  searchTerm: string;
  propertyType: string;
  priceMin: number | null;
  priceMax: number | null;
}

export default function PipelineFilters({ onFilterChange }: PipelineFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      searchTerm,
      propertyType,
      priceMin: priceMin ? parseFloat(priceMin) : null,
      priceMax: priceMax ? parseFloat(priceMax) : null
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setPropertyType('');
    setPriceMin('');
    setPriceMax('');
    
    onFilterChange({
      searchTerm: '',
      propertyType: '',
      priceMin: null,
      priceMax: null
    });
  };

  return (
    <div className="mb-4 bg-white p-3 rounded-md shadow-sm border">
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search deals by name or address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Immediate search filter for the search box
              onFilterChange({
                searchTerm: e.target.value,
                propertyType,
                priceMin: priceMin ? parseFloat(priceMin) : null,
                priceMax: priceMax ? parseFloat(priceMax) : null
              });
            }}
            className="flex-1"
          />
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-xs whitespace-nowrap"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          Advanced Filters
        </Button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="property-type" className="text-xs">Property Type</Label>
            <Select 
              value={propertyType} 
              onValueChange={setPropertyType}
            >
              <SelectTrigger id="property-type">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any type</SelectItem>
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="price-min" className="text-xs">Min Price</Label>
            <Input
              id="price-min"
              type="number"
              placeholder="$ Min price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="price-max" className="text-xs">Max Price</Label>
            <Input
              id="price-max"
              type="number"
              placeholder="$ Max price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>
          
          <div className="sm:col-span-3 flex justify-end space-x-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-xs"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={applyFilters}
              className="text-xs"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 