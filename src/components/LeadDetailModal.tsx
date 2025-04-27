'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MapPin, Calendar, DollarSign, ExternalLink, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type CrmLead = {
  id: string;
  address: string;
  city: string;
  state?: string;
  zipcode?: string;
  price?: number;
  days_on_market?: number;
  source?: string;
  property_type?: string;
  status: string;
  lead_notes?: string;
  created_at: string;
  listing_url?: string;
};

interface LeadDetailModalProps {
  lead: CrmLead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated?: (lead: CrmLead) => void;
}

export default function LeadDetailModal({
  lead,
  open,
  onOpenChange,
  onLeadUpdated
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.lead_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when lead changes
  React.useEffect(() => {
    setStatus(lead.status);
    setNotes(lead.lead_notes || '');
  }, [lead]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          lead_notes: notes
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update lead');
      }
      
      toast.success('Lead updated successfully');
      
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          status,
          lead_notes: notes
        });
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/crm/leads/${lead.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete lead');
      }
      
      toast.success('Lead deleted successfully');
      onOpenChange(false);
      
      // Allow parent component to update list
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          deleted: true
        } as CrmLead);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
          <DialogDescription>
            View and manage this lead in your CRM.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Property Details</TabsTrigger>
            <TabsTrigger value="actions">Actions & Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{lead.address}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {lead.city}
                    {lead.state ? `, ${lead.state}` : ''}
                    {lead.zipcode ? ` ${lead.zipcode}` : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {lead.price && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Price</div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="font-medium">${lead.price.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {lead.property_type && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Property Type</div>
                      <div className="font-medium capitalize">{lead.property_type}</div>
                    </div>
                  )}
                  
                  {lead.days_on_market !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Days on Market</div>
                      <div className="font-medium">{lead.days_on_market} days</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Added to CRM</div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="font-medium">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {lead.listing_url && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <a href={lead.listing_url} target="_blank" rel="noopener noreferrer">
                        View Original Listing <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Lead Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="offer_made">Offer Made</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="dead">Dead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this lead..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                />
              </div>
              
              <Button 
                onClick={handleSave} 
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
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Lead
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 