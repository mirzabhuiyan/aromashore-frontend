// Environment-based configuration
const isDev = process.env.NODE_ENV === 'development';
const apiUrl = isDev ? 'http://localhost:3303/api' : process.env.NEXT_PUBLIC_API_URL;
const backendDomain = isDev ? 'localhost' : process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
const siteUrl = isDev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_SITE_URL;

// DigitalOcean Spaces configuration
const isProduction = process.env.NODE_ENV === 'production';
const doSpacesCdnBase = process.env.NEXT_PUBLIC_DO_SPACES_CDN_BASE || 'https://aroma-shore.nyc3.cdn.digitaloceanspaces.com';

// Image URL helper function
const getImageUrl = (filename, uploadType = 'products') => {
  if (!filename) return '/app/assets/images/200.svg';
  
  // Handle different image data types
  if (filename.startsWith('data:')) {
    return filename; // Base64 image
  } else if (filename.startsWith('http')) {
    return filename; // Already a full URL
  } else {
    // File-based image - use appropriate URL based on environment
    if (isProduction) {
      // Production: Use DigitalOcean Spaces CDN
      return `${doSpacesCdnBase}/uploads/${uploadType}/${filename}`;
    } else {
      // Development: Use local API route
      const backendUrl = isDev ? 'http://localhost:3303' : process.env.NEXT_PUBLIC_BACKEND_URL;
      return `${backendUrl}/api/public/uploads/${uploadType}/${filename}`;
    }
  }
};

// Derive uploads base from API URL (strip trailing /api)
let uploadsBase = 'http://localhost:3303/uploads/';
try {
  const url = new URL(apiUrl);
  const basePath = url.pathname.endsWith('/api') ? url.pathname.slice(0, -4) : url.pathname;
  const origin = `${url.protocol}//${url.host}`;
  uploadsBase = `${origin}${basePath}/uploads/`;
} catch (_) {}

// Backward-compat: product images live under uploads/products
const globalProductImageAddress = `${uploadsBase}products/`;

// Log configuration for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Frontend Configuration:');
  console.log('API URL:', apiUrl);
  console.log('Uploads Base:', uploadsBase);
  console.log('Product Image Base:', globalProductImageAddress);
  console.log('Backend Domain:', backendDomain);
  console.log('Site URL:', siteUrl);
  console.log('DO Spaces CDN Base:', doSpacesCdnBase);
  console.log('Is Production:', isProduction);
}

export { 
  apiUrl, 
  globalProductImageAddress, 
  backendDomain, 
  siteUrl, 
  uploadsBase, 
  getImageUrl,
  isProduction,
  doSpacesCdnBase
};
