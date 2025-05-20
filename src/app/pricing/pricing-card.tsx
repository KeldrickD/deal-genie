'use client';

import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PricingCardProps {
  plan: string;
  price: string;
  pricePeriod?: string;
  priceYearly?: string;
  yearlyText?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isPopular?: boolean;
  priceId?: string;
  showBilling?: boolean;
}

export default function PricingCard({ 
  plan, 
  price, 
  pricePeriod, 
  priceYearly,
  yearlyText,
  description, 
  features, 
  buttonText, 
  buttonVariant = "default", 
  isPopular = false,
  priceId,
  showBilling = false
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [billingYearly, setBillingYearly] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    // Free plan doesn't need checkout
    if (plan === "Free") {
      router.push('/signup');
      return;
    }

    // Team plan redirects to contact page
    if (plan === "Team") {
      router.push('/contact');
      return;
    }

    if (!priceId) {
      toast({
        title: "Error",
        description: "No price ID provided for paid plan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan,
          billingCycle: billingYearly ? 'yearly' : 'monthly'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative flex flex-col h-full border rounded-lg p-6 ${
      isPopular 
        ? 'border-primary shadow-lg md:scale-105' 
        : 'bg-card'
    }`}>
      {isPopular && (
        <Badge 
          variant="default" 
          className="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          Most Popular
        </Badge>
      )}
      
      <div className="flex-grow">
        <h2 className="text-2xl font-semibold mb-2">{plan}</h2>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        {showBilling && (
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Label htmlFor={`billing-toggle-${plan}`} className={billingYearly ? 'text-muted-foreground' : 'font-medium'}>Monthly</Label>
            <Switch 
              id={`billing-toggle-${plan}`}
              checked={billingYearly}
              onCheckedChange={setBillingYearly}
            />
            <Label htmlFor={`billing-toggle-${plan}`} className={billingYearly ? 'font-medium' : 'text-muted-foreground'}>
              Yearly
              <span className="ml-1 text-xs text-green-600 font-normal">Save</span>
            </Label>
          </div>
        )}
        
        <div className="mb-6">
          <span className="text-4xl font-bold">
            {billingYearly && priceYearly ? priceYearly : price}
          </span>
          {pricePeriod && (
            <span className="text-base text-muted-foreground font-normal ml-1">
              {billingYearly ? '/year' : pricePeriod}
            </span>
          )}
          {billingYearly && yearlyText && (
            <p className="text-sm text-green-600 mt-1">{yearlyText}</p>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className={`h-4 w-4 mt-0.5 ${
                isPopular ? 'text-primary' : 'text-green-500'
              } flex-shrink-0`} />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button 
        variant={buttonVariant} 
        className="w-full mt-auto"
        onClick={handleSubscribe}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : buttonText}
      </Button>
    </div>
  );
} 