'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/useAuth';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase'; // For typing the client
// Remove unused imports for router/pathname
// import { useRouter, usePathname } from 'next/navigation';

// Define the Auth context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean, data?: { user: User | null; session: Session | null; }; error?: any; }>;
  signUp: (email: string, password: string, options?: any) => Promise<{ success: boolean, data?: { user: User | null; session: Session | null; }; error?: any; message?: string }>;
  signOut: () => Promise<{ success: boolean; error?: any; }>;
  // debugAuthState: () => void; // Remove debug function from type
  supabase: SupabaseClient<Database> | null;
  // Remove redirecting and manualRedirect
  // redirecting: boolean;
  // manualRedirect: (path: string) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  // Remove state and hooks related to client-side redirects
  // const [redirecting, setRedirecting] = useState(false);
  // const router = useRouter();
  // const pathname = usePathname();
  
  // Remove the debug useEffect hook
  /*
  useEffect(() => {
    console.log('[AuthProvider] Auth State Update: ', {
      isAuthenticated: auth.isAuthenticated,
      user: auth.user?.email,
      loading: auth.loading
    });
  }, [auth.isAuthenticated, auth.user, auth.loading]);
  */
  
  // Remove manual redirect function
  // const manualRedirect = useCallback((path: string) => { ... }, [router]);
  
  // Remove the entire useEffect hook responsible for client-side redirects
  /*
  useEffect(() => {
    // Don't redirect during initial loading or while already redirecting
    if (auth.loading || redirecting) {
      console.log(`[AuthProvider] Redirect effect skipped (loading: ${auth.loading}, redirecting: ${redirecting})`);
      return;
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isProtectedPage = pathname.startsWith('/dashboard') || 
                             pathname.startsWith('/account') || 
                             pathname.startsWith('/admin');

    let targetPath: string | null = null;

    // If authenticated and on auth pages, redirect to dashboard
    if (auth.isAuthenticated && isAuthPage) {
      console.log(`[AuthProvider] User authenticated (${auth.user?.email}) on auth page (${pathname}). Redirecting to /dashboard.`);
      targetPath = '/dashboard';
    } 
    // If not authenticated and on protected pages, redirect to login
    else if (!auth.isAuthenticated && isProtectedPage) {
      console.log(`[AuthProvider] User not authenticated on protected page (${pathname}). Redirecting to /login.`);
      targetPath = '/login';
    }

    if (targetPath) {
      setRedirecting(true); // Indicate redirection is starting
      console.log(`[AuthProvider] Redirecting immediately to ${targetPath}...`);
      
      // Try direct URL navigation for more reliable redirection
      try {
        // Use window.location for more reliable navigation when dealing with authentication
        window.location.href = targetPath;
      } catch (error) {
        console.error('[AuthProvider] Navigation error:', error);
        // Fallback to Next.js routing
        router.push(targetPath);
      }
    } else {
       // If no redirect needed, ensure redirecting state is false
       if (redirecting) {
          console.log("[AuthProvider] No redirect needed, ensuring redirecting state is false.");
          setRedirecting(false); 
       }
    }
  // Dependencies: run when loading state changes, auth state changes, or path changes
  }, [auth.isAuthenticated, auth.loading, pathname, router, redirecting]); 
  */
  
  // Provide the auth context value without redirect-related props
  const contextValue = {
    ...auth,
    // redirecting, // Remove
    // Ensure debugAuthState is not passed down if it was removed from useAuth
    // signIn: auth.signIn,
    // signUp: auth.signUp,
    // signOut: auth.signOut,
    // debugAuthState: auth.debugAuthState, 
    // manualRedirect // Remove
    supabase: auth.supabase,
  };
  
  // Remove debugAuthState from the returned context if it doesn't exist on auth anymore
  if ('debugAuthState' in contextValue) {
    delete (contextValue as any).debugAuthState;
  }

  return (
    <AuthContext.Provider value={contextValue as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 