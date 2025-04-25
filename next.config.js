/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com;
  child-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
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
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // IMPORTANT: Customize this policy based on your specific needs!
            // Allow Google Analytics, allow inline scripts/styles (common for UI libs/Next.js),
            // allow all images and connections for now.
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(), 
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
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