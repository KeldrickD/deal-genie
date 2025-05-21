import { Badge } from "@/components/ui/badge";
import PricingCard from "./pricing-card";
import type { Metadata } from 'next';
import Link from "next/link";
import { Check } from "lucide-react";

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
      
      {/* Comparison Table Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-center mb-4">How Deal Genie Compares</h2>
        <p className="text-center mb-10 text-gray-600 max-w-3xl mx-auto">
          Why pay for multiple tools when Deal Genie covers it all? Get the features of 3+ tools — in one smart dashboard.
        </p>
        
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold">Feature</th>
                <th className="p-4 text-indigo-600 font-bold">Deal Genie<br /><span className="text-sm font-normal text-gray-500">$99/mo</span></th>
                <th className="p-4">PropStream<br /><span className="text-sm text-gray-500">$99/mo</span></th>
                <th className="p-4">DealMachine<br /><span className="text-sm text-gray-500">$199/mo</span></th>
                <th className="p-4">Privy<br /><span className="text-sm text-gray-500">$97/mo</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="bg-white">
                <td className="p-4 font-medium">AI Deal Score™</td>
                <td className="p-4 text-green-600">✅</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 font-medium">ATTOM Property Data</td>
                <td className="p-4 text-green-600">✅</td>
                <td className="p-4 text-gray-600">Partial (public)</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-green-600">✅</td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 font-medium">Built-in CRM</td>
                <td className="p-4 text-green-600">✅ (with XP system)</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-gray-600">✅ (basic)</td>
                <td className="p-4 text-red-500">❌</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 font-medium">Unlimited Analyses</td>
                <td className="p-4 text-green-600">✅</td>
                <td className="p-4 text-gray-600">❌ (limited exports)</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 font-medium">Exit Strategy Simulator</td>
                <td className="p-4 text-green-600">✅</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 font-medium">Offer Generator (PDF + Email)</td>
                <td className="p-4 text-green-600">✅</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 font-medium">Weekly Personalized Leads</td>
                <td className="p-4 text-green-600">✅</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
                <td className="p-4 text-red-500">❌</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-lg font-medium text-indigo-600 mb-4">
            Get all this for just <span className="text-2xl font-bold">$99/mo</span> — half the price of DealMachine
          </p>
          <Link 
            href="/signup?plan=pro" 
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Start Free Trial →
          </Link>
        </div>
      </section>
      
      {/* Why Choose Deal Genie Section */}
      <section className="bg-gray-50 py-16 px-6 rounded-2xl mb-20">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Why Choose Deal Genie?</h2>
          <p className="text-gray-600 text-lg">
            Most tools give you data. Deal Genie gives you decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-2">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="#4F46E5"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Close 10x Faster</h3>
            </div>
            <p className="text-gray-700">
              Get ARV, MAO, repair estimates, exit strategies, and a deal score — instantly. No spreadsheets, no guesswork.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-2">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3H7V5H5V3ZM7 7H5V9H7V7ZM5 11H7V13H5V11ZM7 15H5V17H7V15ZM17 3H19V5H17V3ZM19 7H17V9H19V7ZM17 11H19V13H17V11ZM19 15H17V17H19V15ZM12 15V3H10V15H3V17H10V21H12V17H21V15H12Z" fill="#4F46E5"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Built for Investors</h3>
            </div>
            <p className="text-gray-700">
              Whether you're flipping, wholesaling, or BRRRRing — Deal Genie adapts to your strategy and your risk profile.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-2">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21V20H9V21ZM12 2C8.14 2 5 5.14 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.14 15.86 2 12 2ZM14.85 13.1L14 13.7V16H10V13.7L9.15 13.1C7.8 12.16 7 10.63 7 9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9C17 10.63 16.2 12.16 14.85 13.1Z" fill="#4F46E5"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Smarter Than the Rest</h3>
            </div>
            <p className="text-gray-700">
              AI-powered scoring. ATTOM property data. Behavioral personalization. No other platform brings it together like this.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-2">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 11H3V9H21V11ZM21 14H3V16H21V14ZM3 5V7H21V5H3Z" fill="#4F46E5"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">One Platform. One Price.</h3>
            </div>
            <p className="text-gray-700">
              Instead of paying for 3+ tools, you get everything in one dashboard — for just $99/month.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl text-white max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-3">Time-Limited Bonus</h3>
            <p className="mb-4">Sign up for annual billing by <span className="font-bold">June 30th</span> and get:</p>
            <ul className="mb-4 text-left inline-block mx-auto">
              <li className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-300 flex-shrink-0" />
                <span>2 bonus months free ($198 value)</span>
              </li>
              <li className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-300 flex-shrink-0" />
                <span>Free 1-on-1 onboarding call</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-300 flex-shrink-0" />
                <span>250 XP starter boost</span>
              </li>
            </ul>
            <Link 
              href="/signup?plan=pro&interval=annual" 
              className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Claim This Offer →
            </Link>
          </div>
        </div>
      </section>

      {/* Regular Pricing Cards */}
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
          price="$249"
          pricePeriod="/month"
          priceYearly="$2,388"
          yearlyText="(save $600/year)"
          description="For brokerages and investment firms"
          features={[
            "Everything in Pro plan",
            "Team collaboration tools",
            "3-5 team member accounts",
            "Bulk analysis tools",
            "Dedicated account manager",
            "API access",
            "White-label options"
          ]}
          buttonText="Contact Sales"
          buttonVariant="secondary"
          showBilling={true}
        />
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