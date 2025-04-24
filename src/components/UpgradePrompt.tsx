'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  usageType: 'analyses' | 'offers' | 'imports' | 'general';
  currentUsage: number;
  limit: number;
  onDismiss?: () => void;
  compact?: boolean;
}

export default function UpgradePrompt({ 
  usageType, 
  currentUsage, 
  limit, 
  onDismiss,
  compact = false
}: UpgradePromptProps) {
  // Get text based on usage type
  const getUsageText = () => {
    switch (usageType) {
      case 'analyses':
        return {
          title: 'Analysis Limit Reached',
          desc: `You've used ${currentUsage} of ${limit} free property analyses this month.`,
          action: 'Run more analyses',
          benefits: [
            'Unlimited property analyses',
            'Access to detailed ARV and repair estimates',
            'Export analysis reports to PDF'
          ]
        };
      case 'offers':
        return {
          title: 'Offer Generation Limit Reached',
          desc: `You've generated ${currentUsage} of ${limit} free offers this month.`,
          action: 'Generate more offers',
          benefits: [
            'Unlimited offer documents',
            'Custom offer templates',
            'Advanced negotiation insights'
          ]
        };
      case 'imports':
        return {
          title: 'Import Limit Reached',
          desc: `You've imported ${currentUsage} of ${limit} free properties this month.`,
          action: 'Import more properties',
          benefits: [
            'Unlimited property imports',
            'Bulk analysis features',
            'Advanced filtering and sorting'
          ]
        };
      default:
        return {
          title: 'Free Plan Limit Reached',
          desc: `You've reached your free plan limit for this feature.`,
          action: 'Unlock all features',
          benefits: [
            'Unlimited usage of all features',
            'Priority support',
            'Advanced real estate tools'
          ]
        };
    }
  };
  
  const usageInfo = getUsageText();
  const percentUsed = Math.min(100, (currentUsage / limit) * 100);
  
  // Compact version for inline display
  if (compact) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="flex items-center justify-between">
          <span>{usageInfo.desc}</span>
          <Link href="/pricing">
            <Button size="sm" variant="default" className="ml-4">
              <Zap className="mr-1 h-3 w-3" />
              Upgrade
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Full version for modal or dedicated section
  return (
    <Card className="overflow-hidden border-amber-200 shadow-md">
      <CardHeader className="bg-amber-50 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-amber-900">{usageInfo.title}</CardTitle>
            <CardDescription className="text-amber-800">
              {usageInfo.desc}
            </CardDescription>
          </div>
          <Zap className="h-6 w-6 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Usage</span>
            <span>{currentUsage}/{limit}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="h-2 rounded-full bg-amber-500" style={{ width: `${percentUsed}%` }}></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Upgrade to Genie Pro to unlock:</h4>
          <ul className="space-y-1">
            {usageInfo.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50 px-6 py-4">
        {onDismiss && (
          <Button variant="outline" onClick={onDismiss}>
            Not now
          </Button>
        )}
        <Link href="/pricing" className="ml-auto">
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 