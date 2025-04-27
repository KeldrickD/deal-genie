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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  city: z.string().min(1, 'City is required'),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  daysOnMarket: z.string().optional(),
});

interface Lead {
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
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
      priceMin: '',
      priceMax: '',
      daysOnMarket: '',
    },
  });

  const availableSources = [
    { id: 'zillow', label: 'Zillow' },
    { id: 'craigslist', label: 'Craigslist' },
    { id: 'facebook', label: 'Facebook Marketplace' },
    { id: 'realtor', label: 'Realtor.com' },
  ];

  const availableKeywords = [
    { id: 'as-is', label: 'As-Is' },
    { id: 'motivated-seller', label: 'Motivated Seller' },
    { id: 'must-sell', label: 'Must Sell' },
    { id: 'fixer-upper', label: 'Fixer Upper' },
    { id: 'needs-work', label: 'Needs Work' },
    { id: 'handyman-special', label: 'Handyman Special' },
    { id: 'distressed', label: 'Distressed' },
    { id: 'estate-sale', label: 'Estate Sale' },
  ];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: values.city,
          priceMin: values.priceMin ? parseInt(values.priceMin) : undefined,
          priceMax: values.priceMax ? parseInt(values.priceMax) : undefined,
          daysOnMarket: values.daysOnMarket ? parseInt(values.daysOnMarket) : undefined,
          sources: sources.length > 0 ? sources : undefined,
          keywords: keywords.length > 0 ? keywords : undefined,
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

  function handleSourceToggle(sourceId: string) {
    setSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId]
    );
  }

  function handleKeywordToggle(keywordId: string) {
    setKeywords((prev) =>
      prev.includes(keywordId)
        ? prev.filter((id) => id !== keywordId)
        : [...prev, keywordId]
    );
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Lead Search
              </CardTitle>
              <CardDescription>
                Find FSBO leads that match your criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            <Input placeholder="e.g. Los Angeles" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Price</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                              <Input placeholder="e.g. 100000" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priceMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Price</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                              <Input placeholder="e.g. 500000" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="daysOnMarket"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Days on Market</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                            <Input placeholder="e.g. 30" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="sources">
                      <AccordionTrigger>Sources</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2">
                          {availableSources.map((source) => (
                            <div key={source.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`source-${source.id}`}
                                checked={sources.includes(source.id)}
                                onCheckedChange={() => handleSourceToggle(source.id)}
                              />
                              <Label htmlFor={`source-${source.id}`}>{source.label}</Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="keywords">
                      <AccordionTrigger>Keywords</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2">
                          {availableKeywords.map((keyword) => (
                            <div key={keyword.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`keyword-${keyword.id}`}
                                checked={keywords.includes(keyword.id)}
                                onCheckedChange={() => handleKeywordToggle(keyword.id)}
                              />
                              <Label htmlFor={`keyword-${keyword.id}`}>{keyword.label}</Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Searching...' : 'Search Leads'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Results
              </CardTitle>
              <CardDescription>
                {leads.length > 0
                  ? `Found ${leads.length} potential leads`
                  : 'Search for leads to see results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <Card key={lead.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{lead.address}</CardTitle>
                            <CardDescription>{lead.city}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {formatPrice(lead.price)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.days_on_market} days on market
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-700 mb-2">{lead.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="bg-blue-50">
                            {lead.source}
                          </Badge>
                          {lead.keywords_matched.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="bg-orange-50">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <div className="text-xs text-gray-500">
                          Found {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={lead.listing_url} target="_blank" rel="noopener noreferrer">
                            View Listing
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No leads found</h3>
                  <p className="text-gray-500 mt-1">
                    Try adjusting your search criteria to find more results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 