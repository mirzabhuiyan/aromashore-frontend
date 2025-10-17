#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Rebuilding frontend with CDN domain fix...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('.next')) {
    if (process.platform === 'win32') {
      execSync('rmdir /s /q .next', { stdio: 'inherit' });
    } else {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }
  }
  
  // Set environment variables to ensure correct configuration
  process.env.NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_DO_SPACES_CDN_BASE = 'https://aroma-shore.nyc3.cdn.digitaloceanspaces.com';
  
  console.log('🏗️ Building frontend...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_PUBLIC_DO_SPACES_CDN_BASE: 'https://aroma-shore.nyc3.cdn.digitaloceanspaces.com'
    }
  });
  
  console.log('✅ Frontend rebuilt successfully with CDN domain fix!');
  console.log('📝 The configuration now:');
  console.log('   - Always uses CDN domain: https://aroma-shore.nyc3.cdn.digitaloceanspaces.com');
  console.log('   - Fixes any old domain URLs automatically');
  console.log('   - Ensures all product images load from CDN');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
