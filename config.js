// Environment-based configuration
const isDev = process.env.NODE_ENV === 'development' && process.env.NODE_ENV !== 'production';
const apiUrl = isDev ? 'http://localhost:3303/api' : (process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303/api');
const backendDomain = isDev ? 'localhost' : (process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'aroma-shore-backend-dirk7.ondigitalocean.app');
const siteUrl = isDev ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://aroma-shore-frontend-dirk7.ondigitalocean.app');

// DigitalOcean Spaces configuration
// Always use CDN in production, regardless of NODE_ENV
const isProduction = !isDev || process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.DIGITALOCEAN_APP_ID;
// Always use the correct CDN domain, ignore any environment variables that might point to old domains
const doSpacesCdnBase = 'https://aroma-shore.nyc3.cdn.digitaloceanspaces.com';

// Image URL helper function with better fallback handling
const getImageUrl = (filename, uploadType = 'products') => {
  if (!filename) return '/app/assets/images/200.svg';
  
  // If the value points to our placeholder (even when incorrectly prefixed by CDN/backend paths),
  // always return the local placeholder path so Next/Image does not try to rewrite it
  try {
    if (String(filename).includes('/app/assets/images/200.svg')) {
      return '/app/assets/images/200.svg';
    }
  } catch (_) {}
  
  // Handle different image data types
  if (filename.startsWith('data:')) {
    return filename; // Base64 image
  } else if (filename.startsWith('http')) {
    // If it's already a full URL, check if it's the old domain and fix it
    if (filename.includes('primesmell.com')) {
      const filePath = filename.split('/').slice(-2).join('/'); // Get the last two parts (uploads/products/filename)
      return `${doSpacesCdnBase}/${filePath}`;
    }
    
    // Check if it's a backend URL that should be rewritten to CDN
    try {
      const url = new URL(filename);
      const normalizedPath = url.pathname.replace(/\/+/g, '/').replace(/\/+/, '/');
      
      // Match common legacy upload path patterns
      const patterns = [
        /\/(?:api\/)?public\/uploads\/(products|labels|employees|customers|purchases)\/(.+)$/,
        /\/uploads\/(products|labels|employees|customers|purchases)\/(.+)$/
      ];
      
      for (const pattern of patterns) {
        const m = normalizedPath.match(pattern);
        if (m && isProduction) {
          const type = m[1];
          const file = m[2];
          return `${doSpacesCdnBase}/uploads/${type}/${file}`;
        }
      }
    } catch (_) {}
    
    return filename; // Already a full URL with correct domain
  } else {
    // File-based image - use backend for production to avoid CDN issues
    if (isProduction) {
      // Production: Use backend instead of CDN to avoid connectivity issues
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303';
      return `${backendUrl}/uploads/${uploadType}/${filename}`;
    } else {
      // Development: Use local backend
      return `${uploadsBase}${uploadType}/${filename}`;
    }
  }
};

// Use backend for uploads to avoid CDN connectivity issues
// This ensures product images load reliably from backend
let uploadsBase = isDev 
  ? 'http://localhost:3303/uploads/' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303') + '/uploads/';

// Backward-compat: product images live under uploads/products
const globalProductImageAddress = `${uploadsBase}products/`;

// Log configuration for debugging
console.log('Frontend Configuration:');
console.log('API URL:', apiUrl);
console.log('Uploads Base:', uploadsBase);
console.log('Product Image Base:', globalProductImageAddress);
console.log('Backend Domain:', backendDomain);
console.log('Site URL:', siteUrl);
console.log('DO Spaces CDN Base:', doSpacesCdnBase);
console.log('Is Production:', isProduction);

// Specific helper functions for different image types
const getProductImageUrl = (filename) => {
  if (!filename || filename === '/app/assets/images/200.svg') {
    return '/app/assets/images/200.svg';
  }
  return getImageUrl(filename, 'products');
};
const getLabelImageUrl = (filename) => {
  if (!filename || filename === '/app/assets/images/200.svg') {
    return '/app/assets/images/200.svg';
  }
  return getImageUrl(filename, 'labels');
};
const getCustomerImageUrl = (filename) => {
  if (!filename || filename === '/app/assets/images/200.svg') {
    return '/app/assets/images/200.svg';
  }
  return getImageUrl(filename, 'customers');
};
const getEmployeeImageUrl = (filename) => {
  if (!filename || filename === '/app/assets/images/200.svg') {
    return '/app/assets/images/200.svg';
  }
  return getImageUrl(filename, 'employees');
};
const getPurchaseImageUrl = (filename) => {
  if (!filename || filename === '/app/assets/images/200.svg') {
    return '/app/assets/images/200.svg';
  }
  return getImageUrl(filename, 'purchases');
};

export { 
  apiUrl, 
  globalProductImageAddress, 
  backendDomain, 
  siteUrl, 
  uploadsBase, 
  getImageUrl,
  getProductImageUrl,
  getLabelImageUrl,
  getCustomerImageUrl,
  getEmployeeImageUrl,
  getPurchaseImageUrl,
  isProduction,
  doSpacesCdnBase
};
