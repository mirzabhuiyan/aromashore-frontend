/** @type {import('next').NextConfig} */

// Get environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3303/api";
const backendDomain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'localhost:3303';
const isProduction = process.env.NODE_ENV === 'production';

// Parse the API URL to get protocol and domain
const url = new URL(apiUrl);
const protocol = url.protocol.slice(0, -1); // Remove trailing ':'
const hostname = url.hostname;
const port = url.port;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
        port: port || '',
        pathname: '/uploads/products/**',
      },
      {
        protocol: protocol,
        hostname: hostname,
        port: port || '',
        pathname: '/product/**',
      },
    ],
  },
  eslint: {
    // Prevent lint errors from failing production builds
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_BACKEND_DOMAIN: backendDomain,
  },
};

module.exports = nextConfig;
