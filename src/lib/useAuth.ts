import { useState, useEffect, useCallback, useRef } from 'react';
// Import createBrowserClient and CookieOptions from @supabase/ssr
import { createBrowserClient, type CookieOptions } from '@supabase/ssr'; 
// Remove the unused import for getSupabaseBrowserClient
// import { getSupabaseBrowserClient } from './supabase';
import { type Database } from '@/types/supabase';
// Import SignUpOptions type
import { createClientComponentClient, Session, User } from '@supabase/auth-helpers-nextjs'; 
// Consolidate imports: Core types from supabase-js, specific client creator from auth-helpers
import { SupabaseClient, AuthChangeEvent, Session as SupabaseSession } from '@supabase/supabase-js';

// Create a global variable for the Supabase client instance
let supabaseInstance: SupabaseClient<Database> | null = null;
const globalInitializationComplete = false;

function getSupabaseClient() {
  if (!supabaseInstance) {
    // console.log('[useAuth] Initializing Supabase client (via getSupabaseClient - SSR version)...');
    if (typeof window === 'undefined') {
        // Keep this warning as it indicates a potential issue
        console.warn('[useAuth] Attempted to create Supabase client on server side within hook. Returning null.');
        return null;
    }
    // Use createBrowserClient directly from @supabase/ssr
    supabaseInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { // Provide cookie handling for ssr client
                get(name: string) {
                    // Implement cookie retrieval logic here
                    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
                    return match ? decodeURIComponent(match[2]) : undefined;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Implement cookie setting logic here
                    let cookieString = encodeURIComponent(name) + "=" + encodeURIComponent(value) + ";";
                    options.expires = options.maxAge ? new Date(Date.now() + options.maxAge * 1000) : undefined;
                    if (options.expires) cookieString += "expires=" + options.expires.toUTCString() + ";";
                    if (options.path) cookieString += "path=" + options.path + ";";
                    if (options.domain) cookieString += "domain=" + options.domain + ";";
                    // Secure flag should be set in production
                    if (options.secure === undefined) options.secure = window.location.protocol === 'https:';
                    if (options.secure) cookieString += "secure;";
                    cookieString += "samesite=" + (options.sameSite || 'Lax') + ";";
                    document.cookie = cookieString;
                },
                remove(name: string, options: CookieOptions) {
                    // Implement cookie removal logic here
                    document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (options.path || '/') + ';' + (options.domain ? ' domain=' + options.domain + ';' : '');
                },
            },
            // Optional: configure storage if needed, otherwise defaults to localStorage
            // storage: window.localStorage, 
        }
    );
    // console.log('[useAuth] Supabase client (SSR browser version) initialized.');
  }
  return supabaseInstance;
}

export function useAuth() {
  // State variables
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null); // Use SupabaseClient type
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Start true: loading initial state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initialized = useRef(false); // Track if the initial setup ran
  const globalInitialized = useRef(false); // Track if *any* instance has initialized

  // --- State Update Helper ---
  const updateAuthState = useCallback((newUser: User | null, newSession: Session | null) => {
    const wasAuthenticated = isAuthenticated;
    const newIsAuthenticated = !!(newUser && newSession);
    
    setUser(newUser);
    setSession(newSession);
    setIsAuthenticated(newIsAuthenticated);

    if (loading) setLoading(false); 

  }, [isAuthenticated, loading]);

  // --- Initialization Effect ---
  useEffect(() => {
    // Prevent re-initialization within the same hook instance
    if (initialized.current) return;
    initialized.current = true;
    
    // Prevent multiple global initializations if hook runs multiple times quickly
    if (globalInitialized.current) {
        // console.log('[useAuth] Auth already initialized globally, skipping re-init logic.');
        // Still need to set loading false if this instance hasn't loaded yet
        // This can happen if the component using the hook unmounts/remounts
        if (loading) {
            // console.log('[useAuth] Setting loading=false for remounted instance.');
            setLoading(false); 
        }
        return; 
    }
    globalInitialized.current = true;
    // console.log('[useAuth] Initializing Supabase client (via getSupabaseClient - SSR version)...');
    const client = getSupabaseClient(); // Get the browser client
    setSupabase(client);
    // console.log('[useAuth] Supabase client (SSR browser version) initialized.');

    let authListener: any = null;

    const setupAuth = async (client: SupabaseClient<Database>) => {
      // console.log('[useAuth] Setting up initial auth state and listener (Supabase client available)...');
      // Get initial session
      try {
        const { data: initialSessionData, error: initialSessionError } = await client.auth.getSession();
        if (initialSessionError) {
          console.error('[useAuth] Error fetching initial session:', initialSessionError);
          updateAuthState(null, null); // Assume not authenticated on error
        } else if (initialSessionData?.session) {
          // console.log('[useAuth] Initial getSession() completed. Found initial session.');
          updateAuthState(initialSessionData.session.user, initialSessionData.session);
        } else {
          // console.log('[useAuth] Initial getSession() completed. No initial session found.');
          updateAuthState(null, null);
        }
      } catch (e) {
           console.error('[useAuth] Exception during initial getSession:', e);
           updateAuthState(null, null);
      }

      // Set up listener for auth changes AFTER initial check
      // Add explicit types for event and session
      const { data: listenerData } = client.auth.onAuthStateChange((event: AuthChangeEvent, session: SupabaseSession | null) => {
        // console.log(`[useAuth] onAuthStateChange event received: ${event}, Session: ${session ? 'Exists' : 'null'}`);
        // Directly update the state based on the session provided by the listener
        const newUser = session?.user ?? null;
        const newSession = session ?? null;
        updateAuthState(newUser, newSession);
      });
      authListener = listenerData.subscription;
      // console.log('[useAuth] Initial auth setup complete.');
    };

    // Check if client exists before setting up auth
    if (client) {
       // console.log('[useAuth] Waiting for Supabase client initialization...');
       // Slight delay to ensure client is fully ready, might not be necessary
       // setTimeout(setupAuth, 0); 
       setupAuth(client);
    } else {
       console.error('[useAuth] Supabase client failed to initialize immediately.');
       setLoading(false); // Can't load auth state
    }
    
    // Cleanup listener on unmount
    return () => {
      if (authListener) {
        // console.log('[useAuth] Unsubscribing from auth state changes.');
        authListener.unsubscribe();
      }
      // Reset global init flag if desired, or manage differently if hook is reused across app lifetimes
      // globalInitialized.current = false; 
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // --- Auth Action Callbacks ---

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      console.error('[useAuth] Supabase client not initialized for signIn.');
      return { success: false, error: new Error('Client not ready') };
    }
    // console.log(`[useAuth] Attempting sign in for: ${email}`);
    setLoading(true);
    // console.log(`[useAuth] Credentials for signIn: email='${email}', password='${password.substring(0, 2)}...' (length: ${password.length})`);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[useAuth] Sign in error:', error);
        return { success: false, error };
      }
      // console.log(`[useAuth] Sign in successful: ${data.user?.email}`);
      // Session update is handled by the listener, just return success
      return { success: true, data };
    } catch (err) {
      console.error('[useAuth] Unexpected sign in error:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Sign Up - Accept a third argument for options (typed as any for now)
  const signUp = useCallback(async (email: string, password: string, options?: any) => { 
    if (!supabase) {
      console.error('[useAuth] Supabase client not initialized for signUp.');
      return { success: false, error: new Error('Client not ready') };
    }
    // console.log(`[useAuth] Attempting sign up for: ${email}`);
    setLoading(true);
    try {
      // Pass options (including data for metadata) to Supabase signUp
      const { data, error } = await supabase.auth.signUp({ email, password, options });

      if (error) {
        console.error('[useAuth] Sign up error:', error);
        return { success: false, error };
      }

      // Check if user object exists but session is null (indicates email confirmation needed)
      if (data.user && !data.session) {
        // console.log(`[useAuth] Sign up requires email confirmation for: ${data.user.email}`);
        return { success: true, data, message: 'Please check your email to confirm sign up.' };
      }
      
      // If session exists, signup was successful and likely auto-confirmed (or confirmation disabled)
      // console.log(`[useAuth] Sign up successful and session created for: ${data.user?.email}`);
      return { success: true, data };
    } catch (err) {
      console.error('[useAuth] Unexpected sign up error:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [supabase]); // No change in dependencies needed

  // Sign Out
  const signOut = useCallback(async () => {
    if (!supabase) {
      console.error('[useAuth] Supabase client not initialized for signOut.');
      return { success: false, error: new Error('Client not ready') };
    }
    // console.log('[useAuth] Attempting sign out...');
    setLoading(true); // Indicate loading during sign out
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('[useAuth] Sign out error:', error);
          return { success: false, error };
        } 
        // console.log('[useAuth] Sign out successful.');
        // State updates (user=null, session=null) are handled by the auth listener
        // Manually trigger update just in case listener is slow or fails
        // updateAuthState(null, null); 
        return { success: true };
    } catch (err) {
        console.error('[useAuth] Unexpected sign out error:', err);
        return { success: false, error: err };
    } finally {
        setLoading(false); // Ensure loading is false after sign out attempt
    }
  }, [supabase]); // Removed updateAuthState dependency as listener should handle it

  // Return values from the hook
  return {
    supabase,
    user,
    session,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
}