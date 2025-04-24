/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Disable any experimental features that might be causing issues
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001", "localhost:3002"]
    }
  },
  // Handle build-time environment variables
  env: {
    NEXT_PUBLIC_ENABLE_GENIE_NET: process.env.NEXT_PUBLIC_ENABLE_GENIE_NET || "false",
  }
};

module.exports = nextConfig; 