'use client';

import React, { useState } from 'react';
import AddressSearch from '@/components/AddressSearch';
import PropertyAnalysisResults from '@/components/PropertyAnalysisResults';

export default function AnalyzeDemo() {
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchAddress: string) => {
    setAddress(searchAddress);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: searchAddress }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze property');
      }
      
      const data = await response.json();
      setAnalysisData(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred while analyzing the property');
      setAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Property Analysis Demo</h1>
        <p className="text-muted-foreground">
          Enter an address to get real-time property analysis using RentCast and GPT-4o.
        </p>
        
        <div className="pt-4">
          <AddressSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {address && (analysisData || isLoading) && (
          <PropertyAnalysisResults
            data={analysisData || {}}
            address={address}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
} 