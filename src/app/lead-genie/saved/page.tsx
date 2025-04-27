'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, MapPin, DollarSign, Calendar, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

type SavedLead = {
  id: string;
  user_id: string;
  address: string;
  city: string;
  price: number;
  days_on_market: number | null;
  description: string | null;
  source: string;
  keywords_matched: string[];
  listing_url: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export default function SavedLeadsPage() {
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    fetchSavedLeads();
  }, []);

  const fetchSavedLeads = async (city: string = '', status: string = '') => {
    try {
      setIsLoading(true);
      
      let url = '/api/leads/saved';
      const params = new URLSearchParams();
      
      if (city) {
        params.append('city', city);
      }
      
      if (status && status !== 'all') {
        params.append('status', status);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch saved leads');
      }
      
      const data = await response.json();
      setLeads(data.leads);
    } catch (error) {
      console.error('Error fetching saved leads:', error);
      toast.error('Failed to load saved leads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSavedLeads(searchCity, statusFilter);
  };
  
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    fetchSavedLeads(searchCity, status);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge variant="secondary">New</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-500">Contacted</Badge>;
      case 'negotiating':
        return <Badge className="bg-amber-500">Negotiating</Badge>;
      case 'closed':
        return <Badge className="bg-green-500">Closed</Badge>;
      case 'dead':
        return <Badge variant="destructive">Dead</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Saved Leads</h1>
        <Link href="/lead-genie/search">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Find New Leads
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Filter by city"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="dead">Dead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch}>
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="py-8">
              <h3 className="text-lg font-medium mb-2">No saved leads found</h3>
              <p className="text-gray-500 mb-4">
                You haven't saved any leads yet or none match your current filters.
              </p>
              <Link href="/lead-genie/search">
                <Button>
                  Start searching for leads
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                    <div>
                      <div className="font-semibold text-lg">{lead.address}</div>
                      <div className="text-sm text-gray-500">Saved on {new Date(lead.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className="capitalize">{lead.source}</Badge>
                      {getStatusBadge(lead.status)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{lead.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${lead.price.toLocaleString()}</span>
                    </div>
                    {lead.days_on_market && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{lead.days_on_market} days on market</span>
                      </div>
                    )}
                  </div>
                  
                  {lead.description && (
                    <p className="text-gray-700 mb-4">{lead.description}</p>
                  )}
                  
                  {lead.keywords_matched && lead.keywords_matched.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lead.keywords_matched.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="capitalize">
                          {keyword.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    {lead.listing_url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={lead.listing_url} target="_blank" rel="noopener noreferrer">
                          View Listing <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    ) : (
                      <div />
                    )}
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/lead-genie/saved/${lead.id}`}>
                        Manage Lead
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 