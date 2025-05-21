"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config"; // Import SITE config
import { 
  Brain,
  Zap,
  Medal,
  Users,
  CheckCircle2,
  ChevronDown,
  Star,
  BarChart3,
  Rocket,
  Globe,
  ArrowRight,
  PieChart,
  MessageCircle,
  Clock,
  Shield,
  ArrowUpRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { ReactNode } from "react";

// HomePageRedirect: Client component to handle auth redirects
function HomePageRedirect({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    // Only redirect if authentication check is complete and user is logged in
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // If loading or not authenticated, render children (landing page)
  return !loading && isAuthenticated ? null : children;
}

export default function HomePage() {
  const [pricingInterval, setPricingInterval] = useState('monthly');

  return (
    <HomePageRedirect>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-indigo-50 via-white to-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <span className="h-2 w-2 bg-indigo-600 rounded-full"></span> Real Estate Investing AI
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Analyze Deals <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">10x Faster</span> with AI
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Deal Genie helps you find winning real estate deals in seconds. AI-powered analysis, scoring, and offer generation — all in one platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" asChild className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 px-8">
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-indigo-200 hover:bg-indigo-50">
                    <Link href="/demo" className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-600" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                      Watch Demo
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200"></div>
                    ))}
                  </div>
                  <p>Join <span className="font-medium text-indigo-600">3,240+</span> investors already using Deal Genie</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-radial from-indigo-100 to-transparent opacity-70 -z-10"></div>
                <div className="bg-white rounded-2xl shadow-xl p-2 md:p-3 border border-indigo-100 relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs px-4 py-1 rounded-full font-medium">Deal Genie 2.0</div>
                  <Image 
                    src="/Deal-Genie-Dashboard.png" 
                    alt="Deal Genie Dashboard" 
                    width={1200} 
                    height={675} 
                    className="rounded-xl"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg flex items-center gap-3 border border-indigo-100">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Deal Score</p>
                      <p className="font-bold text-lg">92/100</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="py-12 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Trusted By Real Estate Professionals</p>
              <div className="h-px w-16 bg-indigo-200 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">27s</p>
                <p className="text-sm text-gray-500 text-center">Average analysis time</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">97%</p>
                <p className="text-sm text-gray-500 text-center">Customer satisfaction</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">15k+</p>
                <p className="text-sm text-gray-500 text-center">Properties analyzed</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">$2.9M</p>
                <p className="text-sm text-gray-500 text-center">Investor profits generated</p>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
                <div className="text-gray-400 font-medium">ATTOM Data</div>
                <div className="text-gray-400 font-medium">REI Mastermind</div>
                <div className="text-gray-400 font-medium">InvestorFuel</div>
                <div className="text-gray-400 font-medium">BiggerPockets</div>
                <div className="text-gray-400 font-medium">REWW</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className="h-2 w-2 bg-indigo-600 rounded-full"></span> Core Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Find & Analyze Winning Deals</h2>
              <p className="text-xl text-gray-600">
                Deal Genie combines AI-powered analysis with real-world data to help you make faster, smarter real estate investment decisions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="mb-5 bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <Star className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Genie Deal Score™</h3>
                <p className="text-gray-600 mb-4">
                  Instantly rates every property from 0-100 based on your investment strategy, purchase price, ARV, and local market data.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <Link href="#" className="text-indigo-600 font-medium inline-flex items-center hover:text-indigo-700">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="mb-5 bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Property Insights</h3>
                <p className="text-gray-600 mb-4">
                  Enter any address to get property details, comps, repair estimates, ARV, and cash flow projections in seconds.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <Link href="#" className="text-indigo-600 font-medium inline-flex items-center hover:text-indigo-700">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="mb-5 bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <Brain className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Deal Finder</h3>
                <p className="text-gray-600 mb-4">
                  Our AI learns your preferences and automatically highlights the best deals in your target markets.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <Link href="#" className="text-indigo-600 font-medium inline-flex items-center hover:text-indigo-700">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="mb-5 bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Comps Engine</h3>
                <p className="text-gray-600 mb-4">
                  Get accurate, location-specific comparable properties that match your investment criteria and timing needs.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <Link href="#" className="text-indigo-600 font-medium inline-flex items-center hover:text-indigo-700">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="mb-5 bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <MessageCircle className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Offer Generator</h3>
                <p className="text-gray-600 mb-4">
                  Create professional offer letters, emails, and LOIs in seconds. Customized to your negotiation strategy and property details.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <Link href="#" className="text-indigo-600 font-medium inline-flex items-center hover:text-indigo-700">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="mb-5 bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <PieChart className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Deal XP System</h3>
                <p className="text-gray-600 mb-4">
                  Track your progress, earn experience points, and unlock bonuses as you analyze properties and close deals.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <Link href="#" className="text-indigo-600 font-medium inline-flex items-center hover:text-indigo-700">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 border border-indigo-100">
              <div className="grid md:grid-cols-2 items-center gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Bulk Analysis for Serious Investors</h3>
                  <p className="text-gray-600 mb-6">
                    Upload hundreds of addresses at once and get comprehensive analysis spreadsheets with Deal Scores in minutes. Filter by score, equity, ARV, and more.
                  </p>
                  <Button asChild className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600">
                    <Link href="#pricing">See Pricing Plans</Link>
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 flex justify-center">
                  <Image 
                    src="/Deal-Genie-Dashboard.png" 
                    alt="Bulk Analysis Dashboard" 
                    width={192} 
                    height={192} 
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className="h-2 w-2 bg-indigo-600 rounded-full"></span> Simple Process
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Deal Genie Works</h2>
              <p className="text-xl text-gray-600">
                Our streamlined workflow helps you go from property analysis to making offers in minutes, not hours.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-x-6 gap-y-10 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-20 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200"></div>
              
              <div className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">1</div>
                <h3 className="text-xl font-bold mb-3">Enter Property</h3>
                <p className="text-gray-600">
                  Simply paste an address or upload a list of properties to get started.
                </p>
                <div className="mt-5 mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-indigo-400" fill="currentColor">
                    <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">2</div>
                <h3 className="text-xl font-bold mb-3">AI Analysis</h3>
                <p className="text-gray-600">
                  Our AI compares the property against multiple data sources and your investment criteria.
                </p>
                <div className="mt-5 mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-indigo-400" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">3</div>
                <h3 className="text-xl font-bold mb-3">Get Your Score</h3>
                <p className="text-gray-600">
                  Review the Deal Score, detailed analysis, and recommended purchase price strategy.
                </p>
                <div className="mt-5 mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-indigo-400" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm6-4H7v-2h11v2zm0-4H7V7h11v2z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">4</div>
                <h3 className="text-xl font-bold mb-3">Make Offers</h3>
                <p className="text-gray-600">
                  Generate professional offer packages or add the property to your deal pipeline.
                </p>
                <div className="mt-5 mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-indigo-400" fill="currentColor">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="mt-20 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-8 md:p-10 text-white">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="col-span-2">
                  <h3 className="text-2xl font-bold mb-4">Watch Deal Genie in Action</h3>
                  <p className="mb-6 opacity-90">
                    See how Deal Genie analyzes properties, generates scores, and creates offers in our 3-minute demo video.
                  </p>
                  <Button variant="secondary" asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                    <Link href="/demo" className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                      Watch Demo Video
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="currentColor">
                      <path d="M8 5v14l11-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className="h-2 w-2 bg-indigo-600 rounded-full"></span> Our Edge
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Real Estate Investors Choose Deal Genie</h2>
              <p className="text-xl text-gray-600">
                We're built specifically for investors who value speed, accuracy, and ROI in their decision making.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="bg-indigo-100 rounded-lg p-3">
                    <Clock className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">Lightning Fast Analysis</h3>
                    <p className="text-gray-600">
                      From address entry to complete property breakdown in under 30 seconds. Save hours on every deal.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="bg-indigo-100 rounded-lg p-3">
                    <Shield className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">Data You Can Trust</h3>
                    <p className="text-gray-600">
                      Powered by ATTOM Data, public records, and proprietary AI models trained on thousands of real deals.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="bg-indigo-100 rounded-lg p-3">
                    <Brain className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">Built By Investors</h3>
                    <p className="text-gray-600">
                      Created by active real estate investors who understand what matters for flips, rentals, and wholesaling.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="bg-indigo-100 rounded-lg p-3">
                    <Users className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">Community Powered</h3>
                    <p className="text-gray-600">
                      Benefit from our growing network of investors sharing insights, deals, and strategies through GenieNet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 border border-indigo-100">
              <div className="grid md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-3">
                  <h3 className="text-2xl font-bold mb-4">Deal Genie vs. Traditional Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Old Way</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✕</span>
                          <span className="text-gray-600">30+ minutes per property</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✕</span>
                          <span className="text-gray-600">Multiple spreadsheets</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✕</span>
                          <span className="text-gray-600">Manual data gathering</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✕</span>
                          <span className="text-gray-600">Subjective decision making</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-indigo-600 mb-4">Deal Genie Way</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-gray-600">Under 30 seconds</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-gray-600">All-in-one platform</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-gray-600">Automated data pull</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-gray-600">Data-driven scoring</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-center">
                  <div className="relative">
                    <div className="w-full max-w-xs bg-indigo-600 rounded-xl p-5 text-white">
                      <h4 className="text-lg font-bold mb-2">Average User Results:</h4>
                      <div className="mb-4">
                        <p className="text-3xl font-bold mb-1">5x</p>
                        <p className="text-sm opacity-80">More properties analyzed</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-3xl font-bold mb-1">12.4hrs</p>
                        <p className="text-sm opacity-80">Saved per week</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold mb-1">32%</p>
                        <p className="text-sm opacity-80">Higher closing rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className="h-2 w-2 bg-indigo-600 rounded-full"></span> Testimonials
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Hear From Our Users</h2>
              <p className="text-xl text-gray-600">
                Real investors with real results using Deal Genie in their daily workflows
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div className="flex mb-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg">
                  "I used to spend 30 minutes on each deal. Now I analyze in under 60 seconds. Game changer for my wholesaling business."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full mr-3 flex items-center justify-center text-indigo-600 font-bold">T</div>
                  <div>
                    <p className="font-bold">Taylor Williams</p>
                    <p className="text-sm text-gray-500">FL Investor, 217 deals analyzed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div className="flex mb-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg">
                  "The Genie Deal Score actually matches my gut instinct. It's like having a second brain for real estate investing."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full mr-3 flex items-center justify-center text-indigo-600 font-bold">M</div>
                  <div>
                    <p className="font-bold">Malik Johnson</p>
                    <p className="text-sm text-gray-500">GA Wholesaler, 124 deals analyzed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div className="flex mb-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg">
                  "Deal Genie pays for itself after just one good deal. The offer generator alone saves me hours every week on paperwork."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full mr-3 flex items-center justify-center text-indigo-600 font-bold">S</div>
                  <div>
                    <p className="font-bold">Sarah Chen</p>
                    <p className="text-sm text-gray-500">TX Flipper, 86 deals analyzed</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-14 text-center">
              <Button variant="outline" asChild className="border-indigo-200 hover:bg-indigo-50">
                <Link href="/testimonials">Read More Success Stories</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-8">Integrates With Your Favorite Tools</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
              <div className="text-gray-400 font-medium">REI Pro</div>
              <div className="text-gray-400 font-medium">Podio</div>
              <div className="text-gray-400 font-medium">ZipForms</div>
              <div className="text-gray-400 font-medium">Property Base</div>
              <div className="text-gray-400 font-medium">Zoho CRM</div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className="h-2 w-2 bg-indigo-600 rounded-full"></span> Pricing
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600">
                Try Deal Genie risk-free with our 7-day trial. No credit card required to get started.
              </p>
            </div>
            
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1 bg-gray-100 rounded-lg">
                <button 
                  className={`py-2 px-6 rounded-md font-medium transition-colors ${pricingInterval === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setPricingInterval('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`py-2 px-6 rounded-md font-medium transition-colors ${pricingInterval === 'annual' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setPricingInterval('annual')}
                >
                  Annual (Save 20%)
                </button>
              </div>
            </div>
            
            <div className="w-full max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Starter</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-bold">Free</span>
                  </div>
                  <p className="text-sm text-gray-500">Limited functionality</p>
                </div>
                
                <div className="border-t border-gray-100 pt-6 mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">3 deal analyses per month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Basic property data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Deal Scoring</span>
                    </li>
                  </ul>
                </div>
                
                <Button asChild variant="outline" className="w-full border-indigo-200 hover:bg-indigo-50">
                  <Link href="/signup?plan=free">Get Started</Link>
                </Button>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-white rounded-xl p-8 border-2 border-indigo-500 shadow-xl relative -mt-4 z-10">
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">MOST POPULAR</span>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-bold">{pricingInterval === 'monthly' ? '$99' : '$79'}</span>
                    <span className="text-gray-500 mb-1">/{pricingInterval === 'monthly' ? 'month' : 'month'}</span>
                  </div>
                  {pricingInterval === 'annual' && (
                    <p className="text-xs text-green-600 font-medium mb-1">$948 billed annually (save $240)</p>
                  )}
                  <p className="text-sm text-gray-500">Full access for individuals</p>
                </div>
                
                <div className="border-t border-gray-100 pt-6 mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600"><span className="font-medium">Unlimited</span> deal analyses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Full property data & comps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Advanced Deal Scoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Offer Generator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Deal Pipeline & CRM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Priority Support</span>
                    </li>
                  </ul>
                </div>
                
                <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600">
                  <Link href="/signup?plan=pro">Start 7-Day Free Trial</Link>
                </Button>
                <p className="text-xs text-center text-gray-500 mt-3">No credit card required to try</p>
              </div>
              
              {/* Team Plan */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Team</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-bold">{pricingInterval === 'monthly' ? '$249' : '$199'}</span>
                    <span className="text-gray-500 mb-1">/{pricingInterval === 'monthly' ? 'month' : 'month'}</span>
                  </div>
                  {pricingInterval === 'annual' && (
                    <p className="text-xs text-green-600 font-medium mb-1">$2,388 billed annually (save $600)</p>
                  )}
                  <p className="text-sm text-gray-500">For teams of 3+ members</p>
                </div>
                
                <div className="border-t border-gray-100 pt-6 mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600"><span className="font-medium">Everything in Pro</span>, plus:</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">3-5 team member accounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Bulk import & analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Team dashboard & analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Dedicated account manager</span>
                    </li>
                  </ul>
                </div>
                
                <Button asChild variant="outline" className="w-full border-indigo-200 hover:bg-indigo-50">
                  <Link href="/signup?plan=team">Contact Sales</Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-16 max-w-4xl mx-auto bg-indigo-50 rounded-xl p-8 border border-indigo-100">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold mb-3">Need enterprise features?</h3>
                  <p className="text-gray-600 mb-4">
                    For larger teams, custom integrations, or specialized training, contact our sales team for a customized solution.
                  </p>
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/enterprise">Contact Enterprise Sales</Link>
                  </Button>
                </div>
                <div className="hidden md:flex justify-end">
                  <svg viewBox="0 0 24 24" className="h-32 w-32 text-indigo-200" fill="currentColor">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2zm0-4H8V7h10v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className="h-2 w-2 bg-indigo-600 rounded-full"></span> FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about Deal Genie
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">Is Deal Genie only for house flippers?</h3>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
                <div className="mt-4 text-gray-600">
                  <p>No, Deal Genie supports various real estate investment strategies including fix-and-flip, buy-and-hold rentals, BRRRR (Buy, Rehab, Rent, Refinance, Repeat), and wholesaling. You can configure your investment criteria for each strategy type.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">Where does your property data come from?</h3>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
                <div className="mt-4 text-gray-600">
                  <p>We source our data from ATTOM Data Solutions, one of the largest property data providers in the US. This includes ownership information, property characteristics, tax assessments, valuation models, and neighborhood data. Our AI scoring model combines this with local market trends and your investment criteria.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">Can I cancel my subscription anytime?</h3>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
                <div className="mt-4 text-gray-600">
                  <p>Yes, all of our plans are commitment-free. You can cancel anytime directly from your account dashboard with no cancellation fees. If you cancel, you'll maintain access until the end of your current billing period.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">What happens after the 7-day free trial?</h3>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
                <div className="mt-4 text-gray-600">
                  <p>After your 7-day trial ends, you can choose to upgrade to one of our paid plans (Pro or Team) or downgrade to our free Starter plan with limited features. We'll send you reminders before your trial ends, but we'll never automatically charge you - you need to explicitly choose to continue with a paid plan.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">How accurate is the Deal Score?</h3>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
                <div className="mt-4 text-gray-600">
                  <p>Our Deal Score has been tested against thousands of real investor transactions. On average, properties with scores above 80 have shown a 92% correlation with positive investment outcomes based on user feedback. However, we always recommend combining our AI analysis with your own due diligence and property inspection.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-medium">Can I export data to my existing CRM?</h3>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
                <div className="mt-4 text-gray-600">
                  <p>Yes! Deal Genie supports data export in CSV, Excel, and PDF formats. We also offer direct integrations with popular CRMs like Podio, REI Pro, and Zoho CRM. For Enterprise clients, we can build custom API integrations with your existing systems.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Still have questions? We're here to help.</p>
              <Button asChild variant="outline" className="border-indigo-200 hover:bg-indigo-50">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Start analyzing real estate deals 10x faster today</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of investors using Deal Genie to find better deals, analyze faster, and close more properties.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="secondary" asChild className="px-8 bg-white hover:bg-gray-100 text-indigo-700">
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="px-8 text-white border-white hover:bg-white/10">
                    <Link href="/demo">Watch Demo</Link>
                  </Button>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-2xl font-bold mb-0">7-Day</p>
                    <p className="text-sm opacity-80">Free Trial</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold mb-0">5-Min</p>
                    <p className="text-sm opacity-80">Setup Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold mb-0">No Card</p>
                    <p className="text-sm opacity-80">Required</p>
                  </div>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-radial from-indigo-500/30 to-transparent -z-10"></div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">What users are saying</h3>
                      <p className="text-white/70 text-sm">Average rating: 4.9/5</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm">"I've closed 3 deals in the past month thanks to Deal Genie. The analysis is spot on and saves me hours of spreadsheet work."</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm">"This is the tool I've been waiting for. Perfect for wholesalers who need to analyze dozens of properties quickly."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-5 gap-8 lg:gap-16 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-white rounded-lg p-1.5">
                    <Image 
                      src="/file.svg" 
                      alt="Deal Genie Logo" 
                      width={32} 
                      height={32}
                      className="h-8 w-8"
                    />
                  </div>
                  <span className="text-xl font-bold">Deal Genie</span>
                </div>
                <p className="text-gray-400 max-w-md mb-6">
                  The AI-powered operating system for real estate investors. Find, analyze, and close better deals in less time.
                </p>
                <div className="flex space-x-4">
                  <Link href="https://twitter.com/dealgenie" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </Link>
                  <Link href="https://linkedin.com/company/dealgenie" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link href="https://youtube.com/dealgenie" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link href="https://discord.gg/dealgenie" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Product</h3>
                <ul className="space-y-3">
                  <li><Link href="#features" className="text-gray-400 hover:text-white transition">Features</Link></li>
                  <li><Link href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                  <li><Link href="/demo" className="text-gray-400 hover:text-white transition">Demo</Link></li>
                  <li><Link href="/changelog" className="text-gray-400 hover:text-white transition">Changelog</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Resources</h3>
                <ul className="space-y-3">
                  <li><Link href="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                  <li><Link href="/guides" className="text-gray-400 hover:text-white transition">Guides</Link></li>
                  <li><Link href="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
                  <li><Link href="/api-docs" className="text-gray-400 hover:text-white transition">API</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Company</h3>
                <ul className="space-y-3">
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition">Terms</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 mb-4 md:mb-0">&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-400">Terms</Link>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-400">Privacy</Link>
                <Link href="/cookies" className="text-sm text-gray-500 hover:text-gray-400">Cookies</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </HomePageRedirect>
  );
}
