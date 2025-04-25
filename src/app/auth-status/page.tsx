'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import Link from 'next/link';

export default function AuthStatusPage() {
  const { user, session, isAuthenticated, loading, debugAuthState } = useAuthContext();
  const [storageInfo, setStorageInfo] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Log detailed auth state
    debugAuthState();
    
    // Gather localStorage info
    if (typeof window !== 'undefined') {
      try {
        const storage: Record<string, string> = {};
        
        // Check common auth keys
        const keys = [
          'Deal Genie_session',
          'supabase_session',
          'Deal Genie_user',
          'supabase.auth.token'
        ];
        
        keys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const parsed = JSON.parse(value);
              storage[key] = `Found (${typeof parsed === 'object' ? 'object' : typeof parsed})`;
            } catch (e) {
              storage[key] = `Found (raw string, ${value.length} chars)`;
            }
          } else {
            storage[key] = 'Not found';
          }
        });
        
        setStorageInfo(storage);
      } catch (e) {
        console.error('Error checking localStorage:', e);
      }
    }
  }, [debugAuthState]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="py-6 bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">🔮 Deal Genie</span>
            </Link>
            <div>
              <Link 
                href={isAuthenticated ? '/dashboard' : '/login'} 
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Authentication Status</h1>
          
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p>Loading authentication state...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Current Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-md bg-gray-50">
                    <p className="text-sm font-medium">Authentication Status</p>
                    <p className={`text-lg ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                      {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-md bg-gray-50">
                    <p className="text-sm font-medium">User Email</p>
                    <p className="text-lg">{user?.email || 'No user'}</p>
                  </div>
                  
                  {session && (
                    <>
                      <div className="p-3 rounded-md bg-gray-50">
                        <p className="text-sm font-medium">Token Expiration</p>
                        <p className="text-lg">
                          {session.expires_at 
                            ? new Date(session.expires_at * 1000).toLocaleString() 
                            : 'Unknown'}
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-md bg-gray-50">
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-lg">
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Local Storage State</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Key</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(storageInfo).map(([key, value]) => (
                        <tr key={key} className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">{key}</td>
                          <td className="py-2 px-4">
                            <span className={value.includes('Not found') ? 'text-red-600' : 'text-green-600'}>
                              {value}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Link
                  href="/login"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-block mr-4"
                >
                  Go to Login
                </Link>
                
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
                >
                  Go to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      
      <footer className="py-6 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Deal Genie. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 