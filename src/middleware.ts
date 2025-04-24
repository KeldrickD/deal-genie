import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/analysis-results',
  '/profile',
  '/deals',
];

const authPages = [
  '/login',
  '/signup',
];

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Request received for: ${request.nextUrl.pathname}`);

  // Create a response object *once* upfront
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client
  console.log('[Middleware] Creating Supabase server client...');
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Forward cookies to the browser
          request.cookies.set({ name, value, ...options }); // Still useful for subsequent operations within the same middleware run
          response.cookies.set({ name, value, ...options }); // Set cookie on the response
        },
        remove(name: string, options: CookieOptions) {
          // Delete cookies from the browser
          request.cookies.set({ name, value: '', ...options }); // Still useful for subsequent operations
          response.cookies.set({ name, value: '', ...options }); // Set cookie on the response to remove it
        },
      },
    }
  );

  // Refresh session using getUser, which also handles cookie updates via the handlers above
  console.log('[Middleware] Getting user / refreshing session...');
  const { data: { user } } = await supabase.auth.getUser();
  console.log(`[Middleware] User status after getUser: ${user ? 'Authenticated (User ID: ' + user.id + ')' : 'Not Authenticated'}`);

  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );
  console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Is Protected: ${isProtectedRoute}`);

  // Check if the requested path is an auth page
  const isAuthPage = authPages.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );
  console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Is Auth Page: ${isAuthPage}`);

  // Redirect to login if accessing a protected route without auth
  if (isProtectedRoute && !user) {
    console.log('[Middleware] Redirecting unauthenticated user from protected route to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if already logged in and accessing auth pages
  if (isAuthPage && user) {
    console.log('[Middleware] Redirecting authenticated user from auth page to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log(`[Middleware] No redirect needed for ${request.nextUrl.pathname}. Proceeding.`);
  // Return the response (which might have updated cookies)
  return response;
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analysis-results/:path*',
    '/profile/:path*',
    '/deals/:path*',
    '/login',
    '/signup',
    '/', // Match the root page as well if needed
    // Exclude static assets and API routes if not needed for auth checks
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 