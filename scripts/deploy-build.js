#!/usr/bin/env node

/**
 * Deployment-specific build script
 * This script is optimized for deployment environments with proper error handling
 * and dependency management for production builds.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Ì∫Ä Starting deployment build...');
console.log('Ì≥¶ Node version:', process.version);
console.log('Ì≥¶ NPM version:', process.env.npm_version || 'unknown');

// Set environment variables for deployment
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303';

console.log('Ì≥° API URL:', process.env.NEXT_PUBLIC_API_URL);

try {
  // Clean install dependencies for deployment
  console.log('Ì∑π Cleaning node_modules...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  console.log('Ì≥¶ Installing dependencies with npm ci...');
  execSync('npm ci --legacy-peer-deps --no-audit --no-fund', {
    stdio: 'inherit',
    timeout: 300000, // 5 minutes
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  console.log('‚úÖ Dependencies installed successfully');
  
  // Build the application
  console.log('Ì¥® Building application...');
  execSync('next build', {
    stdio: 'inherit',
    timeout: 300000, // 5 minutes
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  console.log('‚úÖ Build completed successfully!');
  
} catch (error) {
  console.error('‚ùå Build failed:', error.message);
  
  // Try fallback build with npm install instead of npm ci
  if (error.message.includes('npm ci') || error.message.includes('lockfile')) {
    console.log('Ì¥Ñ Trying fallback with npm install...');
    
    try {
      execSync('npm install --legacy-peer-deps --no-audit --no-fund', {
        stdio: 'inherit',
        timeout: 300000,
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=4096'
        }
      });
      
      execSync('next build', {
        stdio: 'inherit',
        timeout: 300000,
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=4096'
        }
      });
      
      console.log('‚úÖ Fallback build completed successfully!');
      
    } catch (fallbackError) {
      console.error('‚ùå Fallback build also failed:', fallbackError.message);
      process.exit(1);
    }
  } else {
    console.error('‚ùå Build failed with non-dependency error');
    process.exit(1);
  }
}

console.log('Ìæâ Deployment build completed successfully!');
