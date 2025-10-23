#!/usr/bin/env node

/**
 * Script to fix production image loading issues
 * This script updates the image configuration for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing production image loading issues...');

// Update config.js to use backend instead of CDN for production
const configPath = path.join(__dirname, '../config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace CDN usage with backend for production
configContent = configContent.replace(
  /if \(isProduction\) \{\s*\/\/ Production: Always use DigitalOcean Spaces CDN\s*return `\$\{doSpacesCdnBase\}\/uploads\/\$\{uploadType\}\/\$\{filename\}`;/,
  `if (isProduction) {
      // Production: Use backend instead of CDN to avoid connectivity issues
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303';
      return \`\${backendUrl}/uploads/\${uploadType}/\${filename}\`;`
);

fs.writeFileSync(configPath, configContent);
console.log('✅ Updated config.js to use backend for production images');

// Update next.config.js to add backend remote patterns
const nextConfigPath = path.join(__dirname, '../next.config.js');
let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

// Add backend remote pattern if not already present
if (!nextConfigContent.includes('aroma-shore-backend-dirk7.ondigitalocean.app')) {
  const remotePatternsMatch = nextConfigContent.match(/remotePatterns: \[([\s\S]*?)\]/);
  if (remotePatternsMatch) {
    const newPattern = `      // Add DigitalOcean backend for production
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

console.log('🎉 Production image loading fixes applied!');
console.log('📝 Next steps:');
console.log('   1. Deploy the updated code to DigitalOcean');
console.log('   2. Ensure backend is serving static files from /uploads');
console.log('   3. Test image loading on mobile devices');

