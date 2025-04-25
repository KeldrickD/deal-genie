'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, TrendingUp, Users, Map, Activity, PieChart, BarChart2, AlertTriangle, Filter, Building, Radio, Zap, InfoIcon, MapPin, Share2, Clock, LineChart, BarChart4, Eye, Network, Radar, Flame } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import GenieNetWaitlistForm from '@/components/GenieNetWaitlistForm';
import ComingSoonFeature from '@/components/ComingSoonFeature';
import { useFeatureFlags } from '@/lib/featureFlags';
import AnimatedChart from '@/components/AnimatedChart';
import ResponsiveMapContainer from '@/components/ResponsiveMapContainer';

export default function GenieNetPage() {
  const { enableGenieNet } = useFeatureFlags();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  
  // Simulate loading states
  useEffect(() => {
    if (activeTab === 'map' || activeTab === 'analytics') {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab]);
  
  const handleJoinWaitlist = () => {
    // Scroll to waitlist form
    const waitlistSection = document.getElementById('waitlist-section');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleRetryMap = () => {
    setIsLoading(true);
    setMapError(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // 20% chance of failure for demo purposes
      if (Math.random() < 0.2) {
        setMapError('Failed to load map data. Server returned an error.');
      }
    }, 1500);
  };
  
  const handleRetryChart = () => {
    setIsLoading(true);
    setChartError(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // 20% chance of failure for demo purposes
      if (Math.random() < 0.2) {
        setChartError('Failed to load chart data. Please check your connection.');
      }
    }, 1500);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center mb-6 md:mb-8"
      >
        <Globe className="h-6 w-6 md:h-8 md:w-8 text-primary mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold">GenieNet</h1>
        <div className="ml-3 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">Beta</div>
      </motion.div>
      
      <ComingSoonFeature 
        title="GenieNet is coming soon"
        description="Our real-time investor network and market intelligence platform is currently in closed beta."
        isEnabled={enableGenieNet}
        onWaitlistClick={handleJoinWaitlist}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Market Map</TabsTrigger>
            <TabsTrigger value="deals">Deal Flow</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Community Deal Flow
                  </CardTitle>
                  <CardDescription>
                    Opt-in deal sharing network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>See anonymized deal flow from other investors who opt into the network. Gain real-time insights into what properties are being analyzed, their key metrics, and market activity.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Market Heatmaps
                  </CardTitle>
                  <CardDescription>
                    Visual market insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Visualize market hotspots with interactive heatmaps showing deal activity, price trends, and investment potential across regions. Drill down to zip code level data.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Regional Analytics
                  </CardTitle>
                  <CardDescription>
                    Data-driven insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Access detailed analytics on regional trends, including price movements, days on market, investor activity, and GenieScore (our proprietary market strength indicator).</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Investor Network
                  </CardTitle>
                  <CardDescription>
                    Connect with other investors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Build your network of local investors, share opportunities, and collaborate on deals. Find partners with complementary skills and resources.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="map">
            {enableGenieNet ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-3">Investment Activity Heatmap</h3>
                  <p className="text-gray-600 mb-4">View real-time investment activity across markets and neighborhoods.</p>
                  
                  <ResponsiveMapContainer 
                    isLoading={isLoading}
                    error={mapError}
                    onRetry={handleRetryMap}
                    height={{ mobile: '250px', desktop: '400px' }}
                  >
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
                      {/* This would be your actual map component */}
                      <div className="text-center p-4">
                        <Map className="h-10 w-10 mx-auto mb-2 text-indigo-500" />
                        <p>Interactive map would display here in production</p>
                      </div>
                    </div>
                  </ResponsiveMapContainer>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white">
                      <span className="h-2 w-2 rounded-full bg-red-400 mr-1"></span> High Activity
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></span> Moderate
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span> Emerging
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <ComingSoonFeature
                title="Interactive Market Map"
                description="Our detailed market heatmap will be available in the full GenieNet release."
              />
            )}
          </TabsContent>
          
          <TabsContent value="deals">
            <ComingSoonFeature
              title="Community Deal Flow"
              description="View aggregated and anonymized deal data from the Deal Genie community."
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            {enableGenieNet ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-3">Market Performance Trends</h3>
                  <p className="text-gray-600 mb-4">Track market performance metrics over time.</p>
                  
                  <AnimatedChart 
                    isLoading={isLoading}
                    error={chartError}
                    onRetry={handleRetryChart}
                    height="300px"
                  >
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
                      {/* This would be your actual chart component */}
                      <div className="text-center p-4">
                        <LineChart className="h-10 w-10 mx-auto mb-2 text-indigo-500" />
                        <p>Interactive chart would display here in production</p>
                      </div>
                    </div>
                  </AnimatedChart>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-3">Investment Types</h3>
                    <p className="text-gray-600 mb-4">Breakdown of deal types in the network.</p>
                    
                    <AnimatedChart 
                      isLoading={isLoading}
                      height="250px"
                    >
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
                        {/* This would be your actual chart component */}
                        <div className="text-center p-4">
                          <BarChart2 className="h-10 w-10 mx-auto mb-2 text-indigo-500" />
                          <p>Chart would display here</p>
                        </div>
                      </div>
                    </AnimatedChart>
                  </div>
                  
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-3">Deal Activity</h3>
                    <p className="text-gray-600 mb-4">Weekly network activity trends.</p>
                    
                    <AnimatedChart 
                      isLoading={isLoading}
                      height="250px"
                    >
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
                        {/* This would be your actual chart component */}
                        <div className="text-center p-4">
                          <Activity className="h-10 w-10 mx-auto mb-2 text-indigo-500" />
                          <p>Chart would display here</p>
                        </div>
                      </div>
                    </AnimatedChart>
                  </div>
                </div>
              </div>
            ) : (
              <ComingSoonFeature
                title="Market Analytics"
                description="Comprehensive market analytics and trend data will be available soon."
              />
            )}
          </TabsContent>
        </Tabs>
      </ComingSoonFeature>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-gray-50 rounded-lg p-4 md:p-8 mt-8"
        id="waitlist-section"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">Join the GenieNet Community</h2>
            <p className="text-gray-600 mb-4">
              GenieNet provides real estate investors with unparalleled market intelligence and community insights. 
              By joining the waitlist, you'll be among the first to access:
            </p>
            <ul className="space-y-2 mb-6 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span> 
                <span>Anonymized deal flow from the Deal Genie community</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span> 
                <span>Interactive market heatmaps and trend analysis</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span> 
                <span>Early notifications of high-potential deals</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span> 
                <span>Connections with other investors in your target markets</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 md:p-6 border">
            <h3 className="text-lg md:text-xl font-semibold mb-4">Join the Waitlist</h3>
            <GenieNetWaitlistForm />
          </div>
        </div>
      </motion.div>
    </div>
  );
} 