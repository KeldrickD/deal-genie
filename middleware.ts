import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://your-production-domain.com', // Replace with your actual production domain
  'http://localhost:3000',
  // Add any other origins that need access (e.g., staging domains)
];

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const origin = requestHeaders.get('origin');

  // Create response object (we might modify headers later)
  const response = NextResponse.next(); 

  // Handle CORS Preflight requests (OPTIONS)
  if (request.method === 'OPTIONS' && origin && ALLOWED_ORIGINS.includes(origin)) {
    console.log(`Handling OPTIONS request for origin: ${origin}`);
    // Return immediate response for OPTIONS with CORS headers
    return new NextResponse(null, {
      status: 204, // No Content
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key', // Add any custom headers your API expects
        'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
      },
    });
  }

  // Add CORS headers to actual requests from allowed origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    console.log(`Adding CORS header for origin: ${origin}`);
    response.headers.set('Access-Control-Allow-Origin', origin);
    // Optionally add other CORS headers if needed for non-preflight requests
    // response.headers.set('Access-Control-Allow-Credentials', 'true'); 
  } else if (origin) {
    console.warn(`Origin ${origin} not in allowed list.`);
  }

  // Add other security headers (these might also be set in next.config.js, ensure no conflicts)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Note: CSP and HSTS are often better handled in next.config.js for broader coverage

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*', // Apply middleware only to API routes
}; 