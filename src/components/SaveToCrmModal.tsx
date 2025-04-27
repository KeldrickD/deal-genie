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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Lead {
  property_id: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price?: number;
  property_type?: string;
  listing_url?: string;
  days_on_market?: number;
  keywords_matched?: string[];
}

interface SaveToCrmModalProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export default function SaveToCrmModal({
  lead,
  open,
  onOpenChange,
  onSaved
}: SaveToCrmModalProps) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setNotes('');
    setStatus('new');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Format the data for API submission
      const leadData = {
        property_id: lead.property_id,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        zipcode: lead.zipcode,
        price: lead.price,
        property_type: lead.property_type,
        listing_url: lead.listing_url,
        days_on_market: lead.days_on_market,
        keywords_matched: lead.keywords_matched,
        lead_notes: notes,
        status
      };
      
      // Make API call to save to CRM
      const response = await fetch('/api/crm/save-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save lead to CRM');
      }
      
      // Success handling
      if (onSaved) {
        onSaved();
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving lead to CRM:', error);
      toast.error('Failed to save lead to CRM. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Lead to CRM</DialogTitle>
          <DialogDescription>
            Add this property to your CRM for follow-up and tracking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{lead.address}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{lead.city}, {lead.state} {lead.zipcode}</span>
            </div>
            {lead.price && (
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                <span>${lead.price.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2 pt-2">
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
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save to CRM'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 