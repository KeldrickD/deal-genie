import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/types/supabase';
import { CookieOptions } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createBrowserClient<Database>(url, key, {
    cookies: {
      get(name: string) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
          if (cookieName === name) {
            return decodeURIComponent(cookieValue);
          }
        }
        return '';
      },
      set(name: string, value: string, options: CookieOptions) {
        document.cookie = `${name}=${encodeURIComponent(value)}; path=${options.path || '/'}; max-age=${options.maxAge || 315360000}; SameSite=${options.sameSite || 'Lax'}; ${options.secure ? 'Secure;' : ''} ${options.domain ? `domain=${options.domain};` : ''}`;
      },
      remove(name: string, options: CookieOptions) {
        document.cookie = `${name}=; path=${options.path || '/'}; max-age=0; SameSite=${options.sameSite || 'Lax'}; ${options.secure ? 'Secure;' : ''} ${options.domain ? `domain=${options.domain};` : ''}`;
      }
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
} 