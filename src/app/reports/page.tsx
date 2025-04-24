import React from 'react';
import { AlertCircle, PieChart, Calendar, BarChart3, Download, Lock } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center mb-8 gap-3">
        <PieChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="ml-3 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
          Coming Soon
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-center">
        <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />
        <p className="text-amber-800">
          The Reports feature is currently in development and will be available in Q1 2024. 
          This feature will provide comprehensive analytics and reporting for your real estate investment activities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FeatureCard 
          icon={<BarChart3 className="h-6 w-6 text-primary" />}
          title="Performance Analytics"
          description="Track key metrics like deal flow, conversion rates, and ROI across your portfolio."
        />
        <FeatureCard 
          icon={<Calendar className="h-6 w-6 text-primary" />}
          title="Periodic Reports"
          description="Generate weekly, monthly, and quarterly reports to monitor your investment activities."
        />
        <FeatureCard 
          icon={<PieChart className="h-6 w-6 text-primary" />}
          title="Portfolio Breakdown"
          description="Visualize your portfolio composition by property type, location, and investment strategy."
        />
        <FeatureCard 
          icon={<Download className="h-6 w-6 text-primary" />}
          title="Export & Share"
          description="Download reports in PDF, CSV, or Excel format, or share them directly with team members."
        />
      </div>
      
      <div className="bg-gray-100 rounded-lg p-8">
        <div className="text-center mb-6">
          <Lock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-700">Premium Feature</h3>
          <p className="text-gray-600">Advanced reporting will be available as part of our Professional subscription tier.</p>
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