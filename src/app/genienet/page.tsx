import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import GenieNetWaitlistForm from '@/components/GenieNetWaitlistForm'
import { 
  Network,
  BarChart3,
  Radar,
  Users,
  Share2,
  TrendingUp,
  Map,
  Building,
  Activity,
  Zap,
  Filter,
  MessageSquare,
  HeartHandshake,
  AlertCircle,
  Globe,
  MapPin,
  Lock
} from 'lucide-react'

export default function GenieNetPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center mb-8 gap-3">
        <Globe className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">GenieNet</h1>
        <div className="ml-3 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
          Coming Soon
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-center">
        <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />
        <p className="text-amber-800">
          GenieNet is currently in development and will be available soon. 
          Join our waitlist to be notified when we launch.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FeatureCard 
          icon={<BarChart3 className="h-6 w-6 text-primary" />}
          title="Real-time Deal Flow"
          description="View anonymized deal analysis from other investors who opt in to share their data, providing unique market insights."
        />
        <FeatureCard 
          icon={<MapPin className="h-6 w-6 text-primary" />}
          title="Regional Trend Analysis"
          description="Track property values, deal volumes, and investor sentiment across zip codes with interactive heat maps."
        />
        <FeatureCard 
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
          title="Genie AI Score Tracking"
          description="Monitor Genie AI scores across different markets to identify emerging investment opportunities."
        />
        <FeatureCard 
          icon={<Users className="h-6 w-6 text-primary" />}
          title="Team Collaboration"
          description="Share deals with agents, partners, and team members with customizable permission levels."
        />
      </div>
      
      <div className="bg-gray-100 rounded-lg p-8">
        <div className="text-center mb-6">
          <Lock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-700">Join the GenieNet Waitlist</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">Be among the first to access GenieNet when we launch. Enter your details below to join our waitlist.</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <GenieNetWaitlistForm />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 