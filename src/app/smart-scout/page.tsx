'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import SmartScoutDashboard from '@/components/SmartScoutDashboard';

export default function SmartScoutPage() {
  const { user, isAuthenticated, loading } = useAuthContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on the server
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show smart scout dashboard for authenticated users
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Smart Scout</h1>
      <SmartScoutDashboard />
    </div>
  );
} 