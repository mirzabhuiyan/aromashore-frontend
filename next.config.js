/** @type {import('next').NextConfig} */

// Get environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3303/api";
const backendDomain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'localhost:3303';

// Parse the API URL to get protocol and domain
let protocol = 'http';
let hostname = 'localhost';
let port = '3303';

try {
  const url = new URL(apiUrl);
  protocol = url.protocol.slice(0, -1); // Remove trailing ':'
  hostname = url.hostname;
  port = url.port || '';
} catch (error) {
  console.warn('Invalid API URL, using defaults:', error.message);
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
        port: port,
        pathname: '/uploads/products/**',
      },
      {
        protocol: protocol,
        hostname: hostname,
        port: port,
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
  // Configure build output
  output: 'standalone',
};

module.exports = nextConfig;
