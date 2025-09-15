/** @type {import('next').NextConfig} */

// Get environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const backendDomain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

// Parse the API URL to get protocol and domain
let protocol = 'https';
let hostname = 'aroma-shore-backend-dirk7.ondigitalocean.app';
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
  // Increase build timeout to handle slow API responses
  staticPageGenerationTimeout: 120, // 2 minutes instead of default 60 seconds
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
  // Add experimental features for better build performance
  experimental: {
    // Disable Critters to avoid runtime errors during HTML post-processing
    optimizeCss: false,
  },
  // Add webpack configuration for better error handling
  webpack: (config, { isServer }) => {
    // Add timeout handling for server-side operations
    if (isServer) {
      // Set timeout for webpack compilation
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
};

module.exports = nextConfig;
