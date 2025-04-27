import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SaveToCrmButtonProps {
  lead: {
    property_id?: string;
    address: string;
    city: string;
    state?: string;
    zipcode?: string;
    price?: number;
    property_type?: string;
    days_on_market?: number;
    listing_url?: string;
    keywords_matched?: string[];
    lead_notes?: string;
  };
  onSuccess?: (leadId: string) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function SaveToCrmButton({
  lead,
  onSuccess,
  variant = 'default',
  size = 'default',
  className = '',
}: SaveToCrmButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const saveToCrm = async () => {
    if (isLoading || isSaved) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/crm/save-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lead),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          // Already exists
          toast({
            title: "Already in CRM",
            description: "This lead is already saved in your CRM",
            variant: "default",
          });
          setIsSaved(true);
          if (onSuccess && data.leadId) {
            onSuccess(data.leadId);
          }
        } else {
          throw new Error(data.error || 'Failed to save lead');
        }
      } else {
        toast({
          title: "Lead saved",
          description: "Lead has been added to your CRM",
          variant: "default",
        });
        setIsSaved(true);
        if (onSuccess && data.leadId) {
          onSuccess(data.leadId);
        }
      }
    } catch (error) {
      console.error('Error saving lead to CRM:', error);
      toast({
        title: "Error",
        description: "Failed to save lead to CRM",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={saveToCrm}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading || isSaved}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : isSaved ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Saved to CRM
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Save to CRM
        </>
      )}
    </Button>
  );
} 