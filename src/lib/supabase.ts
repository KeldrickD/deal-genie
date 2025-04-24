import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '@/types/supabase';

// Ensure environment variables are loaded (handle potential undefined values)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

console.log('[supabase.ts] Supabase URL:', supabaseUrl);

// Singleton instance for the browser client
// Use the specific return type from createClientComponentClient
let browserClientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

/**
 * Creates and/or returns a singleton Supabase client instance for browser-side operations.
 * Uses @supabase/auth-helpers-nextjs for robust session management with cookies (default).
 */
export function getSupabaseBrowserClient(): ReturnType<typeof createClientComponentClient<Database>> {
  // REMOVED: This check is no longer needed as useAuth defers initialization
  // if (typeof window === 'undefined') {
  //    throw new Error('getSupabaseBrowserClient should only be called on the client.');
  // }
  
  if (browserClientInstance) {
    // console.log('[supabase.ts] Returning existing singleton browser client (Auth Helpers - Cookie Default).');
    return browserClientInstance;
  }

  console.log('[supabase.ts] Creating singleton browser Supabase client (Auth Helpers - Cookie Default)...');
  browserClientInstance = createClientComponentClient<Database>({ 
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
      // Let Auth Helpers handle cookies by default, do not provide cookieOptions or storage
      isSingleton: true, // Let Auth helpers manage the singleton behavior internally
  });
  console.log('[supabase.ts] Browser Supabase client instance created (Auth Helpers - Cookie Default).');
  
  return browserClientInstance;
}

// Optional: Export the initialized client directly if preferred
// export const supabase = getSupabaseBrowserClient();

// REMOVE unused server client function causing lint errors
// export function createServerClient() {
//   const { supabaseUrl, supabaseKey } = getSupabaseEnv();
//   // Use the standard Supabase client for server-side
//   return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
// }