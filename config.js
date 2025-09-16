// Environment-based configuration
const isDev = process.env.NODE_ENV === 'development';
const apiUrl = isDev ? 'http://localhost:3303/api' : process.env.NEXT_PUBLIC_API_URL;
const backendDomain = isDev ? 'localhost' : process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
const siteUrl = isDev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_SITE_URL;

// Derive uploads base from API URL (strip trailing /api)
let uploadsBase = 'http://localhost:3303/uploads/';
try {
	const url = new URL(apiUrl);
	// Remove '/api' path suffix if present
	const basePath = url.pathname.endsWith('/api') ? url.pathname.slice(0, -4) : url.pathname;
	const origin = `${url.protocol}//${url.host}`;
	uploadsBase = `${origin}${basePath}/uploads/`; // e.g., https://backend/app/uploads/
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
}

export { apiUrl, globalProductImageAddress, backendDomain, siteUrl, uploadsBase };
