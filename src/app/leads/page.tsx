'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Search, Filter, MapPin, Calendar, DollarSign } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchForm from './search-form';
import { formatCurrency } from '@/lib/utils';

interface Lead {
  id: string;
  user_id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  days_on_market: number;
  description: string;
  source: string;
  keywords_matched: string[];
  listing_url: string;
  created_at: string;
  property_type?: string;
  listing_type: 'fsbo' | 'agent' | 'both';
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const availableSources = ['redfin', 'craigslist', 'facebook', 'realtor'];

  async function handleSearch(params: {
    city: string;
    state: string;
    priceMin: number;
    priceMax: number;
    days_on_market: number;
    days_on_market_option: string;
    sources: string[];
    keywords: string;
    listing_type: 'fsbo' | 'agent' | 'both';
  }) {
    setIsLoading(true);
    try {
      const keywordsArray = params.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k !== '');

      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: params.city,
          state: params.state,
          priceMin: params.priceMin,
          priceMax: params.priceMax,
          days_on_market: params.days_on_market,
          days_on_market_option: params.days_on_market_option,
          sources: params.sources,
          keywords: keywordsArray.join(','),
          listing_type: params.listing_type
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search for leads');
      }

      setLeads(data.leads);
      if (data.leads.length === 0) {
        toast.success('Search completed, but no leads found. Try different criteria.');
      } else {
        toast.success(`Found ${data.leads.length} potential leads!`);
      }
    } catch (error) {
      console.error('Error searching for leads:', error);
      toast.error('Failed to search for leads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function saveToLeads(lead: Lead) {
    // Implementation for saving a lead
    toast.success('Lead saved to your list!');
  }

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        pages={[
          { name: 'Lead Genie', href: '/leads' },
        ]}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lead Genie</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SearchForm 
          onSearch={handleSearch}
          isLoading={isLoading}
          leadSources={availableSources}
        />

        {leads.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            <h2 className="text-xl font-semibold mb-2">Found {leads.length} Leads</h2>
            
            {leads.map((lead) => (
              <Card key={lead.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{lead.address}</CardTitle>
                      <CardDescription>{lead.city}, {lead.state}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{formatCurrency(lead.price)}</div>
                      <div className="text-sm text-gray-500">{lead.days_on_market} days on market</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="mb-4">
                    <p className="text-gray-700">{lead.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{lead.source}</Badge>
                    {lead.property_type && (
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">{lead.property_type}</Badge>
                    )}
                    <Badge className={lead.listing_type === 'fsbo' 
                      ? "bg-orange-100 text-orange-800 hover:bg-orange-200" 
                      : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    }>
                      {lead.listing_type === 'fsbo' ? 'For Sale By Owner' : 'Agent Listed'}
                    </Badge>
                    
                    {lead.keywords_matched && lead.keywords_matched.length > 0 && (
                      lead.keywords_matched.map((keyword, idx) => (
                        <Badge key={idx} className="bg-green-100 text-green-800 hover:bg-green-200">
                          {keyword}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="bg-gray-50 p-4 flex justify-between">
                  <Button
                    onClick={() => window.open(lead.listing_url, '_blank')}
                    variant="outline"
                  >
                    View Listing
                  </Button>
                  
                  <Button 
                    onClick={() => saveToLeads(lead)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Lead
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 