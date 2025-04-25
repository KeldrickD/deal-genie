/** @type {import('next').NextConfig} */
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
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 