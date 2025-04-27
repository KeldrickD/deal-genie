import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Adapter to make Clerk-style auth functions work with Supabase
 * This allows us to keep our API code compatible with Clerk while using Supabase
 */
export const getAuth = () => {
  // Get Supabase client
  const supabase = createRouteHandlerClient({ cookies });
  
  // Return a promise that resolves to the userId
  return {
    userId: null, // Will be populated in API routes
    getSessionId: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id || null;
    },
    // Helper method to get the current session data
    getSession: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  };
};

// For server components and route handlers
export async function withAuth(callback: (userId: string) => Promise<any>) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    return null;
  }
  
  return callback(session.user.id);
} 