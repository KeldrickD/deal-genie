import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GenieOS Pricing – Simple Plans for Every Investor',
  description: 'Choose the right GenieOS plan for your real estate investment needs, from free starter to pro and team options.',
  openGraph: {
    title: 'GenieOS Pricing',
    description: 'Affordable pricing for AI-powered real estate analysis and tools.',
    url: 'https://your-domain.com/pricing', // Replace with your actual URL
    // images: [{ url: '/api/og?page=pricing', width: 1200, height: 630 }], // Temporarily commented out
  },
};

export default function PricingPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">Choose the plan that fits your deal volume and team size.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <PricingCard
          plan="Free"
          price="$0"
          description="Up to 3 analyses / month"
          features={[
            "Basic Deal Analyzer",
            "Genie Offer Engine (Limited)",
            "Genie Profile (Starter)"
          ]}
          buttonText="Get Started"
          buttonVariant="outline"
        />

        {/* Pro Plan */}
        <PricingCard
          plan="Pro"
          price="$49"
          pricePeriod="/mo"
          description="For active individual investors"
          features={[
            "Unlimited Analyses",
            "Smart Scout Alerts",
            "Genie Profile (Advanced)",
            "Full Offer Generator",
            "Priority Support"
          ]}
          buttonText="Start 14-Day Free Trial"
          isPopular
        />

        {/* Team Plan */}
        <PricingCard
          plan="Team"
          price="$99"
          pricePeriod="/mo"
          description="For scaling teams & brokerages"
          features={[
            "All Pro Features",
            "Multi-User Access (3 seats)",
            "Shared Dashboards",
            "Team Performance Analytics",
            "Dedicated Account Manager"
          ]}
          buttonText="Contact Sales"
          buttonVariant="outline"
        />
      </div>

      {/* Add-On: GenieNet */}
      <div className="mt-16 text-center max-w-md mx-auto border rounded-lg p-6 bg-muted/30">
        <Badge variant="secondary" className="mb-3">Add-On</Badge>
        <h3 className="text-xl font-semibold mb-2">GenieNet Access</h3>
        <p className="text-muted-foreground mb-4">Live market data, community-sourced deals, and advanced analytics.</p>
        <p className="text-3xl font-bold mb-6">$29<span className="text-base text-muted-foreground font-normal">/mo</span></p>
        <Button variant="secondary" className="w-full">Join Waitlist</Button>
      </div>
    </div>
  )
}

// Helper component for pricing cards
interface PricingCardProps {
  plan: string;
  price: string;
  pricePeriod?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isPopular?: boolean;
}

function PricingCard({ plan, price, pricePeriod, description, features, buttonText, buttonVariant = "default", isPopular = false }: PricingCardProps) {
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
      <Button variant={buttonVariant} className="w-full mt-auto">{buttonText}</Button>
    </div>
  );
} 