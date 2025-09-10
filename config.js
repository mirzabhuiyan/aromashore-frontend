// Environment-based configuration
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3303/api";
const globalProductImageAddress = process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE || 'http://localhost:3303/uploads/products/';
const backendDomain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'localhost:3303';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Log configuration for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Frontend Configuration:');
  console.log('API URL:', apiUrl);
  console.log('Product Image Base:', globalProductImageAddress);
  console.log('Backend Domain:', backendDomain);
  console.log('Site URL:', siteUrl);
}

export { apiUrl, globalProductImageAddress, backendDomain, siteUrl };
