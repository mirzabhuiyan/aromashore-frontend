// Dev Server
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3303/api";
const globalProductImageAddress = process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE || 'http://localhost:3303/uploads/products/';

// Prod Server
// const apiUrl = "https://primesmell.com/api";
// const globalProductImageAddress = 'https://primesmell.com/product/';

export { apiUrl, globalProductImageAddress };