/** @type {import('next').NextConfig} */

const path = require('path');

// Get environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const backendDomain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

// Parse the API URL to get protocol and domain
let protocol = 'https';
let hostname = backendDomain;
let port = '';

try {
  if (apiUrl) {
    const url = new URL(apiUrl);
    protocol = url.protocol.slice(0, -1); // Remove trailing ':'
    hostname = url.hostname;
    port = url.port || '';
  }
} catch (error) {
  console.warn('Invalid API URL, using defaults:', error.message);
}

function buildRemotePattern(pathname) {
  const pattern = { protocol, hostname, pathname };
  if (port) pattern.port = port; // Only include port if explicitly set
  return pattern;
}

const nextConfig = {
  reactStrictMode: true,
  // Increase build timeout to handle slow API responses
  staticPageGenerationTimeout: 120, // 2 minutes instead of default 60 seconds
  // Fix HMR issues
  devIndicators: {
    buildActivity: false,
  },
  images: {
    remotePatterns: [
      buildRemotePattern('/uploads/products/**'),
      buildRemotePattern('/product/**'),
      // Add localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3303',
        pathname: '/uploads/products/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3303',
        pathname: '/uploads/**',
      },
      // Add DigitalOcean Spaces CDN for production
      {
        protocol: 'https',
        hostname: 'aroma-shore.nyc3.cdn.digitaloceanspaces.com',
        pathname: '/uploads/**',
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
  // Add webpack configuration for better error handling and build caching
  webpack: (config, { isServer, dev }) => {
    // Reduce noise in server logs
    if (isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }

    // Fix Windows file watching issues
    if (process.platform === 'win32') {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/C:/pagefile.sys',
          '**/C:/hiberfil.sys',
          '**/C:/swapfile.sys',
          '**/C:/System Volume Information/**',
          '**/C:/$Recycle.Bin/**',
        ],
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      };
    }

    // Fix HMR connection issues
    if (dev) {
      config.devServer = {
        ...config.devServer,
        hot: true,
        liveReload: true,
        client: {
          webSocketURL: 'ws://localhost:3000/_next/webpack-hmr',
        },
      };
    }

    // Enable filesystem build cache for faster rebuilds
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.resolve('.next/cache/webpack'),
      buildDependencies: {
        config: [__filename],
      },
      name: `${isServer ? 'server' : 'client'}-${dev ? 'development' : 'production'}`,
    };

    return config;
  },
};

module.exports = nextConfig;
