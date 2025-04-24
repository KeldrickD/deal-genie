'use client';

import { useEffect, useState } from 'react';
import OfferGenerator from '@/components/OfferGenerator';
import { Button } from '@/components/ui/button';
import { StructuredAnalysis } from '@/app/ai/actions';
import { useAuthContext } from '@/components/AuthProvider';

interface DealOfferGeneratorProps {
  dealId: string;
  dealData: any; // Type this better in a real implementation
  analysisData?: StructuredAnalysis | null;
}

export default function DealOfferGenerator({ 
  dealId, 
  dealData,
  analysisData
}: DealOfferGeneratorProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const { supabase } = useAuthContext();
  
  // If needed, fetch the most recent analysis from supabase here
  // and pass it to the OfferGenerator

  if (!showGenerator) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Generate Offer Documents</h3>
        <p className="text-gray-600 max-w-md mb-6">
          Create professional offer documents, emails, and PDFs based on this deal's information.
        </p>
        <Button onClick={() => setShowGenerator(true)}>
          Create Offer Documents
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4">
        <Button variant="outline" onClick={() => setShowGenerator(false)}>
          ← Back to Options
        </Button>
      </div>
      
      <OfferGenerator 
        dealData={dealData} 
        analysisData={analysisData} 
      />
    </div>
  );
} 