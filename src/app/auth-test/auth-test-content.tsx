'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AuthTestContent() {
  const { isLoaded, userId, sessionId, signOut } = useAuth();
  const [apiAuthStatus, setApiAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkServerAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/whoami');
      const data = await response.json();
      setApiAuthStatus(data);
    } catch (error) {
      console.error('Error checking auth:', error);
      setApiAuthStatus({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      checkServerAuth();
    }
  }, [isLoaded]);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client-Side Auth Status</CardTitle>
            <CardDescription>Authentication state on the browser</CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoaded ? (
              <p>Loading auth state...</p>
            ) : (
              <div className="space-y-2">
                <p><strong>Authenticated:</strong> {userId ? 'Yes' : 'No'}</p>
                <p><strong>User ID:</strong> {userId || 'Not signed in'}</p>
                <p><strong>Session ID:</strong> {sessionId ? '[present]' : 'No session'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server-Side Auth Status</CardTitle>
            <CardDescription>Authentication state from API</CardDescription>
          </CardHeader>
          <CardContent>
            {!apiAuthStatus ? (
              <p>Loading server auth status...</p>
            ) : (
              <div className="space-y-2">
                <p><strong>Authenticated:</strong> {apiAuthStatus.authenticated ? 'Yes' : 'No'}</p>
                <p><strong>User ID:</strong> {apiAuthStatus.userId || 'None'}</p>
                {apiAuthStatus.error && (
                  <p className="text-red-500"><strong>Error:</strong> {apiAuthStatus.error}</p>
                )}
                {apiAuthStatus.message && (
                  <p><strong>Message:</strong> {apiAuthStatus.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-x-4">
        <Button onClick={checkServerAuth} disabled={loading}>
          {loading ? 'Checking...' : 'Refresh Server Auth'}
        </Button>
        
        {userId && (
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        {apiAuthStatus?.debug && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(apiAuthStatus.debug, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
} 