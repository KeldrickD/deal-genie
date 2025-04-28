import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PricingCard from "./pricing-card";
import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@/components/ui/link";

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
        <Badge variant="secondary" className="mb-4 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
          Building in Public
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Free Beta Access</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We're opening up all features during our beta period to gather feedback and improve the platform.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-2xl">All Features Included</CardTitle>
            <CardDescription>
              During our beta period, you have access to everything we've built.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Smart Scout</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Automated property search</li>
                  <li>• Custom search criteria</li>
                  <li>• Real-time alerts</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Lead Genie</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI-powered lead analysis</li>
                  <li>• Deal scoring</li>
                  <li>• Market insights</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">GenieNet</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Community insights</li>
                  <li>• Market trends</li>
                  <li>• Network effects</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">XP System</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Progress tracking</li>
                  <li>• Achievement badges</li>
                  <li>• Skill development</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Help us improve by providing feedback and reporting issues.
            </p>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 