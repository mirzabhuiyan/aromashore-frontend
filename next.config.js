/** @type {import('next').NextConfig} */

// Dev Server
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3303',
        pathname: '/product/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3303',
        pathname: '/uploads/products/**',
      },
      {
        protocol: 'https',
        hostname: 'primesmell.com',
        port: '',
        pathname: '/product/**',
      },
    ],
  },
  eslint: {
    // Prevent lint errors from failing production builds
    ignoreDuringBuilds: true,
  },
};

// Prod Server
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'primesmell.com',
//         port: '',
//         pathname: '/product/**',
//       },
//     ],
//   },
// };

module.exports = nextConfig;
