import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { SaveToCrmButton } from '@/components/leads/SaveToCrmButton';

interface Lead {
  id: string;
  address: string;
  city: string;
  state?: string;
  zipcode?: string;
  price: number;
  days_on_market: number;
  description: string;
  source: string;
  keywords_matched: string[];
  listing_url: string;
  created_at: string;
  property_id?: string;
}

interface LeadCardProps {
  lead: Lead;
  onSavedToCrm?: (leadId: string) => void;
}

export default function LeadCard({ lead, onSavedToCrm }: LeadCardProps) {
  return (
    <Card key={lead.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between mb-2">
            <div className="font-semibold text-lg">{lead.address}</div>
            <Badge variant="outline" className="capitalize">{lead.source}</Badge>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{lead.city}{lead.state ? `, ${lead.state}` : ''}{lead.zipcode ? ` ${lead.zipcode}` : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>${lead.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{lead.days_on_market} days on market</span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{lead.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {lead.keywords_matched.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="capitalize">
                {keyword.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" asChild>
                <a href={lead.listing_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" /> View Listing
                </a>
              </Button>
            </div>
            
            <SaveToCrmButton
              lead={{
                property_id: lead.property_id || lead.id,
                address: lead.address,
                city: lead.city,
                state: lead.state,
                zipcode: lead.zipcode,
                price: lead.price,
                property_type: lead.source,
                days_on_market: lead.days_on_market,
                listing_url: lead.listing_url,
                keywords_matched: lead.keywords_matched,
              }}
              onSuccess={onSavedToCrm}
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 