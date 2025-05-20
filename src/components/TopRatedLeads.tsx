'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { MapPin, Award, ThumbsUp } from 'lucide-react';
import { calculateGenieDealScore } from '@/app/ai/actions';

interface TopRatedLeadProps {
  limit?: number;
  showTitle?: boolean;
  onSelectLead?: (leadId: string) => void;
}

interface TopLead {
  id: string;
  property_id: string;
  address: string;
  city?: string;
  state?: string;
  zipcode?: string;
  price?: number;
  upvotes: number;
  attomData?: any;
}

export default function TopRatedLeads({ 
  limit = 5, 
  showTitle = true,
  onSelectLead 
}: TopRatedLeadProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<TopLead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopRatedLeads = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/feedback/top-rated?limit=${limit}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch top-rated leads');
        }
        
        const data = await response.json();
        setLeads(data.properties || []);
      } catch (err: any) {
        console.error('Error fetching top-rated leads:', err);
        setError(err.message || 'Failed to load top-rated leads');
        toast.error('Could not load top-rated leads');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopRatedLeads();
  }, [limit]);
  
  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top-Rated Leads
            </CardTitle>
            <CardDescription>
              Leads with the highest positive feedback from users
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <div className="h-[1px] bg-gray-100 my-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top-Rated Leads
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (leads.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top-Rated Leads
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-center text-gray-500">No top-rated leads yet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top-Rated Leads
          </CardTitle>
          <CardDescription>
            Leads with the highest positive feedback from users
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead) => {
            const dealScore = lead.attomData ? calculateGenieDealScore(lead.attomData) : 0;
            
            return (
              <div key={lead.id} className="border-b pb-3 last:border-0">
                <h3 className="font-medium">{lead.address}</h3>
                
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>
                    {lead.city}
                    {lead.state ? `, ${lead.state}` : ''}
                    {lead.zipcode ? ` ${lead.zipcode}` : ''}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-sm text-green-600">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    <span>{lead.upvotes} users recommend this lead</span>
                  </div>
                  
                  {lead.price && (
                    <div className="text-sm font-semibold">
                      {formatCurrency(lead.price)}
                    </div>
                  )}
                </div>
                
                {dealScore > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-blue-600">Genie Score: {dealScore}/100</div>
                    <div className="w-full bg-gray-200 h-1 mt-1">
                      <div 
                        className={`h-1 ${dealScore >= 80 ? 'bg-green-500' : dealScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${dealScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {onSelectLead && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => onSelectLead(lead.property_id)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 