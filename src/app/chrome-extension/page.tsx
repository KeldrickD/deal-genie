'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Chrome, Zap, Shield, Globe, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon } from 'lucide-react'

export default function ChromeExtensionPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Genie Chrome Extension</h1>
          <Badge className="bg-amber-500 hover:bg-amber-600">Coming Soon</Badge>
        </div>
        <p className="text-muted-foreground">
          Analyze properties with one click directly from your favorite real estate listing sites without leaving the page.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              One-Click Analysis
            </CardTitle>
            <CardDescription>
              Instant property evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Analyze any property with a single click while browsing Zillow, Redfin, Realtor.com, and other popular listing sites.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Seamless Integration
            </CardTitle>
            <CardDescription>
              Works with your favorite sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Compatible with major real estate platforms including Zillow, Redfin, Realtor.com, MLS, Loopnet, and more.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Auto Deal Import
            </CardTitle>
            <CardDescription>
              Save time on data entry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Automatically imports property details, photos, and listing information directly to your GenieOS dashboard.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Enhanced Listing View
            </CardTitle>
            <CardDescription>
              See what others don't
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Get Genie's instant assessment overlaid on listing pages, showing deal score, estimated ARV, repair costs, and more.</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Browser Compatibility</AlertTitle>
        <AlertDescription>
          The Genie Chrome Extension works with Google Chrome, Microsoft Edge, and other Chromium-based browsers. Safari and Firefox support coming later.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Seamless integration with your property search workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="browse">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="analyze">Analyze</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="save">Save</TabsTrigger>
            </TabsList>
            <TabsContent value="browse" className="space-y-4 py-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">1. Browse listings normally</p>
                <p className="text-sm text-muted-foreground">Visit your preferred real estate websites as you normally would. The Genie icon will appear in the corner of compatible listing pages.</p>
              </div>
            </TabsContent>
            <TabsContent value="analyze" className="space-y-4 py-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">2. Click the Genie button</p>
                <p className="text-sm text-muted-foreground">When you find a property you're interested in, simply click the Genie icon to instantly analyze the property without leaving the page.</p>
              </div>
            </TabsContent>
            <TabsContent value="review" className="space-y-4 py-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">3. Review insights</p>
                <p className="text-sm text-muted-foreground">A sidebar will appear with Genie's analysis, including deal score, estimated values, potential returns, and AI recommendations.</p>
              </div>
            </TabsContent>
            <TabsContent value="save" className="space-y-4 py-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">4. Save to your dashboard</p>
                <p className="text-sm text-muted-foreground">With one more click, save the property and all analysis data to your GenieOS dashboard for further review or to generate an offer.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button disabled className="flex items-center gap-2">
            <Chrome className="h-4 w-4" />
            Join the Waitlist
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Extension Preview</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-slate-900 p-2 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div className="ml-4 bg-slate-800 rounded text-center text-xs text-slate-400 py-1 px-2 flex-1">
              zillow.com/homes/for_sale/123-example-st
            </div>
          </div>
          <div className="aspect-video bg-slate-100 relative flex items-center justify-center">
            <div className="absolute top-3 right-3 bg-primary text-white p-2 rounded-full">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div className="text-center space-y-2">
              <Laptop className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Property listing preview with Genie overlay</p>
            </div>
            <div className="absolute right-0 h-full w-1/3 border-l bg-white/90 p-4 hidden md:block">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Genie Analysis</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Deal Score</p>
                  <div className="h-2 rounded-full bg-primary/20 w-full">
                    <div className="h-2 rounded-full bg-primary w-3/4"></div>
                  </div>
                  <p className="text-xs text-right">75/100</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">List Price</p>
                    <p className="font-medium">$275,000</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Est. ARV</p>
                    <p className="font-medium">$350,000</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Repairs</p>
                    <p className="font-medium">$25,000-$35,000</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Offer</p>
                    <p className="font-medium text-primary">$230,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Analyze dozens of properties in minutes instead of hours, allowing you to evaluate more deals and find hidden gems faster.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Eliminate manual data entry and switching between tabs to dramatically streamline your property analysis workflow.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Competitive Edge</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Make faster, more confident decisions with instant AI-powered insights while other investors are still crunching numbers.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 