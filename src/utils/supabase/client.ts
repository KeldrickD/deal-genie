import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/types/supabase';
import { CookieOptions } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Store client instances to prevent multiple instances
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  // Return existing instance if available (prevents multiple GoTrueClient instances)
  if (clientInstance) {
    return clientInstance;
  }
  
  // Create new client instance
  clientInstance = createBrowserClient<Database>(url, key, {
    cookies: {
      get(name: string) {
        try {
          if (typeof document === 'undefined') return '';
          
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [cookieName, ...rest] = cookie.split('=').map(c => c.trim());
            // Join the rest with '=' in case the value contains '='
            const cookieValue = rest.join('=');
            
            if (cookieName === name) {
              // Don't try to parse the cookie value as JSON if it starts with base64-
              if (cookieValue.startsWith('base64-')) {
                return cookieValue;
              }
              // For normal values, decode URI component
              return decodeURIComponent(cookieValue);
            }
          }
        } catch (error) {
          console.error('Error getting cookie:', error);
        }
        return '';
      },
      set(name: string, value: string, options: CookieOptions) {
        if (typeof document === 'undefined') return;
        try {
          document.cookie = `${name}=${encodeURIComponent(value)}; path=${options.path || '/'}; max-age=${options.maxAge || 315360000}; SameSite=${options.sameSite || 'Lax'}; ${options.secure ? 'Secure;' : ''} ${options.domain ? `domain=${options.domain};` : ''}`;
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      },
      remove(name: string, options: CookieOptions) {
        if (typeof document === 'undefined') return;
        try {
          document.cookie = `${name}=; path=${options.path || '/'}; max-age=0; SameSite=${options.sameSite || 'Lax'}; ${options.secure ? 'Secure;' : ''} ${options.domain ? `domain=${options.domain};` : ''}`;
        } catch (error) {
          console.error('Error removing cookie:', error);
        }
      }
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  return clientInstance;
} 