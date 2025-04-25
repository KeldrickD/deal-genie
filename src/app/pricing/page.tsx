import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PricingCard from "./pricing-card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deal Genie Pricing – Simple Plans for Every Investor',
  description: 'Choose the right Deal Genie plan for your real estate investment needs, from free starter to pro and team options.',
  openGraph: {
    title: 'Deal Genie Pricing',
    description: 'Affordable pricing for AI-powered real estate analysis and tools.',
    url: 'https://dealgenieos.com/pricing', // Replace with your actual URL
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
          description="Up to 5 analyses / month"
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
          priceId="price_1RHfHEBQTlbe5lZGDU5AjPxL"
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
          priceId="price_1RHfKuBQTlbe5lZGsa3rGJNG"
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