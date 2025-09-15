// Environment-based configuration
const isDev = process.env.NODE_ENV === 'development';
const apiUrl = isDev ? 'http://localhost:3303/api' : process.env.NEXT_PUBLIC_API_URL;
const globalProductImageAddress = process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE;
const backendDomain = isDev ? 'localhost' : process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
const siteUrl = isDev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_SITE_URL;

// Log configuration for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Frontend Configuration:');
  console.log('API URL:', apiUrl);
  console.log('Product Image Base:', globalProductImageAddress);
  console.log('Backend Domain:', backendDomain);
  console.log('Site URL:', siteUrl);
}

export { apiUrl, globalProductImageAddress, backendDomain, siteUrl };
