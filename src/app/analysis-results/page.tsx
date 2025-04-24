'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AnalysisResult from '@/components/AnalysisResult';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';

// Mock data for demonstration - in a real app, this would be fetched from the backend
const mockAnalysisData = {
  arv: 285000,
  repairCostLow: 35000,
  repairCostHigh: 42000,
  cashOnCashROI: 18.3,
  flipPotential: 76,
  rentalPotential: 85,
  mao: 157500,
  recommendation: 'GO' as 'GO' | 'NO_GO',
  reasoning: 'This property shows strong potential as a BRRRR investment with an attractive ARV based on recent comps and neighborhood trends. Repairs needed are moderate and the expected rental income provides a healthy cash flow. The location has good school ratings and low crime, which should maintain tenant demand and property appreciation.',
  confidenceLevel: 82,
  _timestamp: new Date().toISOString()
};

export default function AnalysisResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const analysisId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }
      
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [router]);
  
  // Fetch analysis data after auth check
  useEffect(() => {
    if (!authChecked) return;
    
    // In a real app, we would fetch the analysis data from the server
    // For demonstration, we're using mock data after a short delay
    const fetchData = async () => {
      try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, fetch the data from the API instead
        // const response = await fetch(`/api/analysis/${analysisId}`);
        // if (!response.ok) throw new Error('Failed to fetch analysis data');
        // const data = await response.json();
        
        setAnalysis({
          ...mockAnalysisData,
          _timestamp: analysisId || mockAnalysisData._timestamp
        });
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching analysis data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [analysisId, authChecked]);
  
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Loading analysis...</h2>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error || 'Analysis not found'}
            </div>
            <Link 
              href="/dashboard"
              className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Property Analysis</h1>
          <p className="text-gray-600">Review your property analysis and next steps</p>
        </div>
        
        <AnalysisResult 
          analysis={analysis} 
          propertyAddress="123 Main Street, Houston, TX 77002" 
        />
      </div>
    </div>
  );
} 