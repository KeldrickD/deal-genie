'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SubscriptionGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function SubscriptionGate({ 
  children, 
  fallback 
}: SubscriptionGateProps) {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10">
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
          Beta
        </Badge>
      </div>
      {children}
    </div>
  );
} 