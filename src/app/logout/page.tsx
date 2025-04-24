'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';

export default function LogoutPage() {
  const { signOut, loading, redirecting } = useAuthContext();
  
  // Automatically sign out when the page loads
  useEffect(() => {
    const performLogout = async () => {
      console.log('Logout page - Signing out user');
      await signOut();
    };
    
    if (!loading && !redirecting) {
      performLogout();
    }
  }, [loading, redirecting, signOut]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing you out...</p>
      </div>
    </div>
  );
} 