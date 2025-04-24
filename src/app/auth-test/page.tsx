'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function AuthTestPage() {
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuthContext();
  const [sessionData, setSessionData] = useState<any>(null);
  const [cookieData, setCookieData] = useState<string>('');
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    // Get direct session data from Supabase
    const checkDirectSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      setSessionData(data.session);
    };

    // Check cookies
    const checkCookies = () => {
      setCookieData(document.cookie);
    };

    // Check localStorage
    const checkLocalStorage = () => {
      try {
        const items: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              const value = localStorage.getItem(key);
              items[key] = value;
            } catch (e) {
              items[key] = 'ERROR_READING';
            }
          }
        }
        setLocalStorageData(items);
      } catch (error) {
        console.error('Error reading localStorage:', error);
      }
    };

    checkDirectSession();
    checkCookies();
    checkLocalStorage();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>User Email:</strong> {user?.email || 'None'}</p>
            <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto max-h-40">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Direct Supabase Session</h2>
          <p><strong>Has Session:</strong> {sessionData ? 'Yes' : 'No'}</p>
          <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto max-h-40">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cookie Data</h2>
          <p className="break-all text-xs">{cookieData || 'No cookies found'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
          <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto max-h-40">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => signOut()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
} 