'use client';

import { useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthProvider';

export default function SignupPage() {
  const { isAuthenticated, loading } = useAuthContext();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show redirection UI if authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-white rounded shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Already logged in</h2>
          <p className="mb-4">Redirecting to dashboard...</p>
          <Link 
            href="/dashboard" 
            className="block w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-center"
          >
            Go to Dashboard Now
          </Link>
        </div>
      </div>
    );
  }

  // Normal signup form for non-authenticated users
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="py-6">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">🔮 Deal Genie</span>
          </Link>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <AuthForm mode="signup" />
      </div>
      
      <footer className="py-6 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Deal Genie. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 