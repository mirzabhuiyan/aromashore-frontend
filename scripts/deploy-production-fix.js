#!/usr/bin/env node

/**
 * Production deployment fix for image loading issues
 * This script ensures the production site uses backend for images instead of CDN
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying production image loading fix...');

// Update config.js to force backend usage in production
const configPath = path.join(__dirname, '../config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Force backend usage for production
configContent = configContent.replace(
  /if \(isProduction\) \{\s*\/\/ Production: Use CDN with backend fallback\s*return `\$\{doSpacesCdnBase\}\/uploads\/\$\{uploadType\}\/\$\{filename\}`;/,
  `if (isProduction) {
      // Production: Use backend instead of CDN to avoid connectivity issues
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303';
      return \`\${backendUrl}/uploads/\${uploadType}/\${filename}\`;`
);

// Update uploadsBase to use backend
configContent = configContent.replace(
  /let uploadsBase = isDev \s*\? 'http:\/\/localhost:3303\/uploads\/' \s*: `\$\{doSpacesCdnBase\}\/uploads\/`;/,
  `let uploadsBase = isDev 
  ? 'http://localhost:3303/uploads/' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303') + '/uploads/';`
);

fs.writeFileSync(configPath, configContent);
console.log('✅ Updated config.js to use backend for production images');

// Update next.config.js to prioritize backend
const nextConfigPath = path.join(__dirname, '../next.config.js');
let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

// Ensure backend is first in remote patterns
if (!nextConfigContent.includes('aroma-shore-backend-dirk7.ondigitalocean.app')) {
  const remotePatternsMatch = nextConfigContent.match(/remotePatterns: \[([\s\S]*?)\]/);
  if (remotePatternsMatch) {
    const newPattern = `      // Add DigitalOcean backend for production (primary)
      {
        protocol: 'https',
        hostname: 'aroma-shore-backend-dirk7.ondigitalocean.app',
        port: '3303',
        pathname: '/uploads/**',
      },`;
    
    nextConfigContent = nextConfigContent.replace(
      /remotePatterns: \[([\s\S]*?)\]/,
      `remotePatterns: [
$1${newPattern}`
    );
  }
}

fs.writeFileSync(nextConfigPath, nextConfigContent);
console.log('✅ Updated next.config.js with backend remote patterns');

// Create production environment file
const envContent = `NEXT_PUBLIC_API_URL=https://aroma-shore-backend-dirk7.ondigitalocean.app:3303/api
NEXT_PUBLIC_BACKEND_DOMAIN=aroma-shore-backend-dirk7.ondigitalocean.app:3303
NEXT_PUBLIC_SITE_URL=https://primesmell.com
NODE_ENV=production`;

fs.writeFileSync(path.join(__dirname, '../.env.production'), envContent);
console.log('✅ Created .env.production file');

console.log('🎉 Production image loading fix deployed!');
console.log('📝 Next steps:');
console.log('   1. Deploy the updated code to DigitalOcean');
console.log('   2. Verify backend is serving images at: https://aroma-shore-backend-dirk7.ondigitalocean.app:3303/uploads/products/');
console.log('   3. Test image loading on production site');
console.log('   4. Check browser console for any remaining errors');
