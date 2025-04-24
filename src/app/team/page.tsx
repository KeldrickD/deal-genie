import React from 'react';
import { AlertCircle, Users, Shield, BarChart3, UserPlus, Lock } from 'lucide-react';

export default function TeamDashboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center mb-8 gap-3">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <div className="ml-3 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
          Coming Soon
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-center">
        <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />
        <p className="text-amber-800">
          Team Dashboard is currently in development and will be available in Q4 2023. 
          This feature will allow collaborative deal analysis and team management.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FeatureCard 
          icon={<UserPlus className="h-6 w-6 text-primary" />}
          title="Team Member Management"
          description="Invite team members, partners, and agents to collaborate on deals with customizable roles."
        />
        <FeatureCard 
          icon={<Shield className="h-6 w-6 text-primary" />}
          title="Permission Controls"
          description="Set granular access controls for team members to protect sensitive deal information."
        />
        <FeatureCard 
          icon={<BarChart3 className="h-6 w-6 text-primary" />}
          title="Team Analytics"
          description="Track team performance with detailed analytics on deal volume, conversion rates, and more."
        />
        <FeatureCard 
          icon={<Users className="h-6 w-6 text-primary" />}
          title="Collaborative Deal Room"
          description="Work together on deals in real-time with shared notes, documents, and communication tools."
        />
      </div>
      
      <div className="bg-gray-100 rounded-lg p-8">
        <div className="text-center mb-6">
          <Lock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-700">Premium Feature</h3>
          <p className="text-gray-600">Team Dashboard will be available as part of our Business subscription tier.</p>
        </div>
        
        <div className="flex justify-center">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            Join Waitlist
          </button>
        </div>
      </div>
    </div>
  );
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