import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GenieNetNotFound() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl text-center">
      <div className="py-12 md:py-24">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">GenieNet Page Not Found</h1>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          We couldn't find the GenieNet page you were looking for. It might have been moved or is not available.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Button asChild>
            <Link href="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 