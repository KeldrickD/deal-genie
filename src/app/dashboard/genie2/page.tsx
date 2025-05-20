'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Genie2Dashboard() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to main dashboard with Genie 2.0 view
    router.push('/dashboard?view=genie2');
  }, [router]);
  
  // Loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4 mx-auto"></div>
        <p className="text-lg text-gray-600">Redirecting to Genie 2.0 Dashboard...</p>
      </div>
    </div>
  );
} 