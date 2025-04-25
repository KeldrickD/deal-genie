'use client';

import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PricingCardProps {
  plan: string;
  price: string;
  pricePeriod?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isPopular?: boolean;
  priceId?: string;
}

export default function PricingCard({ 
  plan, 
  price, 
  pricePeriod, 
  description, 
  features, 
  buttonText, 
  buttonVariant = "default", 
  isPopular = false,
  priceId
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      console.error("No price ID provided for paid plan");
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
          plan
        }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className={`border rounded-lg p-6 text-center flex flex-col shadow-lg ${isPopular ? 'border-2 border-primary' : 'bg-card'}`}>
      {isPopular && <Badge variant="default" className="mb-2 self-center">Most Popular</Badge>}
      <h2 className="text-2xl font-semibold mb-2">{plan}</h2>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <p className="text-4xl font-bold mb-4">{price}{pricePeriod && <span className="text-base text-muted-foreground font-normal">{pricePeriod}</span>}</p>
      <ul className="text-left mb-8 space-y-2 text-sm flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className={`h-4 w-4 mt-0.5 ${isPopular ? 'text-primary' : 'text-green-500'} flex-shrink-0`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
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