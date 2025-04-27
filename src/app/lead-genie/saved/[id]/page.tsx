'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, MapPin, DollarSign, CalendarDays, ArrowLeft, Loader2, PhoneCall, Mail, Trash2 } from 'lucide-react';
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

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  
  const [lead, setLead] = useState<SavedLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/leads/saved/${leadId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Lead not found');
          router.push('/lead-genie/saved');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lead details');
      }
      
      const data = await response.json();
      setLead(data.lead);
      setNotes(data.lead.notes || '');
      setStatus(data.lead.status || 'new');
    } catch (error) {
      console.error('Error fetching lead details:', error);
      toast.error('Failed to load lead details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLead = async () => {
    if (!lead) return;
    
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/leads/saved/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
          status,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update lead');
      }
      
      toast.success('Lead updated successfully');
      
      // Update local state
      setLead(prev => {
        if (!prev) return null;
        return { ...prev, notes, status };
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLead = async () => {
    if (!lead) return;
    
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/leads/saved/${leadId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete lead');
      }
      
      toast.success('Lead deleted successfully');
      router.push('/lead-genie/saved');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Lead Not Found</h2>
          <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or has been deleted.</p>
          <Link href="/lead-genie/saved">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Saved Leads
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/lead-genie/saved" className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm mb-4">
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to Saved Leads
        </Link>
        <h1 className="text-2xl font-bold">{lead.address}</h1>
        <div className="text-gray-500 text-sm">{lead.city}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Lead Details</span>
                <Badge variant="outline" className="capitalize">{lead.source}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Price</span>
                  <span className="flex items-center text-xl font-semibold">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-1" />
                    {lead.price.toLocaleString()}
                  </span>
                </div>
                
                {lead.days_on_market && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Days on Market</span>
                    <span className="flex items-center text-xl font-semibold">
                      <CalendarDays className="h-5 w-5 text-gray-400 mr-1" />
                      {lead.days_on_market}
                    </span>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Added</span>
                  <span className="flex items-center text-xl font-semibold">
                    <CalendarDays className="h-5 w-5 text-gray-400 mr-1" />
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {lead.description && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{lead.description}</p>
                </div>
              )}
              
              {lead.keywords_matched && lead.keywords_matched.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.keywords_matched.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="capitalize">
                        {keyword.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {lead.listing_url && (
                <div className="mt-6">
                  <Button variant="outline" asChild>
                    <a href={lead.listing_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Original Listing
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button className="flex-1 gap-2">
              <PhoneCall className="h-4 w-4" />
              Call Seller
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Manage Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="dead">Dead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add your notes about this lead"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                onClick={updateLead} 
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={deleteLead}
                disabled={isDeleting}
                className="w-full"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Lead
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 