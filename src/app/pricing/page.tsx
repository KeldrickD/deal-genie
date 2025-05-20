import { Badge } from "@/components/ui/badge";
import PricingCard from "./pricing-card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deal Genie 2.0 Pricing – Premium Plans for Serious Investors',
  description: 'Choose the right Deal Genie plan for your real estate investment needs, from free starter to premium pro options with AI-powered features.',
  openGraph: {
    title: 'Deal Genie 2.0 Pricing',
    description: 'Premium pricing for AI-powered real estate analysis and tools with Attom data integration.',
    url: 'https://dealgenieos.com/pricing',
  },
};

export default function PricingPage() {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Premium Intelligence for Real Investors</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Deal Genie 2.0 is now more powerful with Attom data integration, Deal Score™, and AI recommendations.
        </p>
      </div>
      
      {/* Competitor Comparison */}
      <div className="relative overflow-hidden rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 mb-12 max-w-3xl mx-auto">
        <div className="absolute top-0 right-0">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
            <path d="M60 0L120 60L60 120L0 60L60 0Z" fill="#4f46e5"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-4 relative z-10">How We Compare</h2>
        <div className="grid grid-cols-4 gap-2 text-sm relative z-10">
          <div className="col-span-1 font-medium">Tool</div>
          <div className="col-span-1 font-medium">Price</div>
          <div className="col-span-2 font-medium">Features</div>
          
          <div className="col-span-1">
            <span className="font-semibold text-indigo-700">Deal Genie</span>
          </div>
          <div className="col-span-1">$99/mo</div>
          <div className="col-span-2">Attom data, AI analysis, CRM, XP system, unlimited usage</div>
          
          <div className="col-span-1">PropStream</div>
          <div className="col-span-1">$99/mo</div>
          <div className="col-span-2">Public records, skip tracing, limited exports</div>
          
          <div className="col-span-1">DealMachine</div>
          <div className="col-span-1">$199/mo</div>
          <div className="col-span-2">Driving for dollars, direct mail, basic CRM</div>
          
          <div className="col-span-1">Privy</div>
          <div className="col-span-1">$97/mo</div>
          <div className="col-span-2">Comps, rehab estimates, no AI analysis</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {isDevelopment && (
          <PricingCard
            plan="Test"
            price="$0"
            pricePeriod="/month"
            description="Development mode - Unlimited access for testing"
            features={[
              "Unlimited property analyses",
              "Unlimited offer generations",
              "All premium features",
              "No usage limits",
              "Development only"
            ]}
            buttonText="Activate Test Mode"
            buttonVariant="default"
            isPopular={true}
          />
        )}

        <PricingCard
          plan="Free"
          price="$0"
          pricePeriod="/month"
          description="Sample the Deal Genie engine with limited access"
          features={[
            "3 property analyses per month",
            "2 offer generations per month",
            "Basic market insights",
            "Limited feature access",
            "No data exports"
          ]}
          buttonText="Get Started"
          buttonVariant="outline"
        />

        <PricingCard
          plan="Pro"
          price="$99"
          pricePeriod="/month"
          priceYearly="$790"
          yearlyText="(2 months free!)"
          description="Full power for serious investors who demand intelligence"
          features={[
            "Unlimited property analyses",
            "Unlimited offer generations",
            "Attom data integration",
            "Deal Score™ technology",
            "Full Lead Genie access",
            "Integrated CRM",
            "XP & progression system",
            "AI recommendations",
            "Priority support"
          ]}
          buttonText="Upgrade to Pro"
          isPopular={!isDevelopment}
          priceId="price_1QwX2XKXwX2XKXwX2XKXwX2X"
          showBilling={true}
        />

        <PricingCard
          plan="Team"
          price="Custom"
          description="For brokerages and investment firms"
          features={[
            "Everything in Pro plan",
            "Team collaboration tools",
            "Custom integrations",
            "Bulk analysis tools",
            "Dedicated account manager",
            "API access",
            "White-label options"
          ]}
          buttonText="Contact Sales"
          buttonVariant="secondary"
        />
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Why Upgrade to Pro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold mb-2">Intelligence, Not Just Data</h3>
            <p className="text-sm text-muted-foreground">
              Deal Genie 2.0 provides AI-driven insights and recommendations based on premium Attom data, not just raw numbers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Comprehensive Toolset</h3>
            <p className="text-sm text-muted-foreground">
              Our Pro plan includes Lead Genie, CRM, Deal Score™, and XP progression in one seamless platform.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Premium Value</h3>
            <p className="text-sm text-muted-foreground">
              At $99/mo, Deal Genie is more affordable than competitors like PropStream, DealMachine, and Privy ($97-$200/mo).
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">New in Genie 2.0</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold mb-2">Mobile Experience</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Optimized mobile dashboard</li>
              <li>• On-the-go investing</li>
              <li>• Responsive deal analysis</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">XP System</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Progression gamification</li>
              <li>• Activity rewards</li>
              <li>• Referral program</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Social Proof</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• User testimonials</li>
              <li>• Deal activity feed</li>
              <li>• Community insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 