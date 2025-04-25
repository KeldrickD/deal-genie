/** @type {import('next').NextConfig} */

// More specific CSP based on known external connections
const ContentSecurityPolicy = `
  default-src 'self'; 
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: blob:; 
  font-src 'self'; 
  connect-src 'self' https://*.supabase.co https://api.openai.com https://www.google-analytics.com; 
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`;

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disable any experimental features that might be causing issues
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001", "localhost:3002"]
    }
  },
  // Handle build-time environment variables
  env: {
    NEXT_PUBLIC_ENABLE_GENIE_NET: process.env.NEXT_PUBLIC_ENABLE_GENIE_NET || "false",
    // Add GA ID to env if needed
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Also disable TypeScript type checking during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Add headers configuration for CSP
  async headers() {
    return [
      {
        source: '/:path*', // Apply security headers to all paths
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(), 
          },
          // X-Content-Type-Options, X-Frame-Options, Referrer-Policy are now handled in middleware.ts for consistency 
          // but can be kept here if you prefer global application via next.config.js
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig; 