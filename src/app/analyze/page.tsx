'use client';

import { useState, useEffect } from 'react';
import AnalyzerForm from '@/components/AnalyzerForm';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function AnalyzePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [router]);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Property Analyzer</h1>
            <p className="text-gray-600">Enter a property address to get a comprehensive investment analysis</p>
          </div>
          
          <AnalyzerForm />
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-indigo-100 rounded-full h-12 w-12 flex items-center justify-center mb-3">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Enter Address</h3>
                <p className="text-gray-600 text-sm">
                  Input a single property address or upload a CSV file with multiple properties
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-indigo-100 rounded-full h-12 w-12 flex items-center justify-center mb-3">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Our AI analyzes property data, comps, and market trends to provide a comprehensive report
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-indigo-100 rounded-full h-12 w-12 flex items-center justify-center mb-3">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Get Results</h3>
                <p className="text-gray-600 text-sm">
                  Receive a detailed analysis with ARV, repair costs, ROI, and a buy/pass recommendation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 