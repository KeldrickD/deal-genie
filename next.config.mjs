/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Disable any experimental features that might be causing issues
    serverActions: true,
  },
  // Handle build-time environment variables
  env: {
    NEXT_PUBLIC_ENABLE_GENIE_NET: process.env.NEXT_PUBLIC_ENABLE_GENIE_NET || "false",
  }
};

export default nextConfig; 