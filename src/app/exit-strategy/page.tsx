'use client';

import React, { Suspense } from 'react';
import ExitStrategySimulator from '@/components/ExitStrategySimulator';
import { useSearchParams } from 'next/navigation';

function ExitStrategyContent() {
  const searchParams = useSearchParams();
  
  // Parse query parameters if provided from a deal
  const initialData = {
    purchasePrice: searchParams.get('purchasePrice') ? parseFloat(searchParams.get('purchasePrice')!) : undefined,
    rehabCost: searchParams.get('rehabCost') ? parseFloat(searchParams.get('rehabCost')!) : undefined,
    arv: searchParams.get('arv') ? parseFloat(searchParams.get('arv')!) : undefined,
    estimatedRent: searchParams.get('estimatedRent') ? parseFloat(searchParams.get('estimatedRent')!) : undefined,
    propertyType: searchParams.get('propertyType') || undefined,
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Exit Strategy Simulator</h1>
      <p className="text-gray-600 mb-8">
        Compare different real estate investment strategies to find the best exit option for your deals.
      </p>
      
      <ExitStrategySimulator initialData={initialData} />
    </div>
  );
}

export default function ExitStrategyPage() {
  return (
    <Suspense fallback={<div>Loading simulator...</div>}>
      <ExitStrategyContent />
    </Suspense>
  );
} 