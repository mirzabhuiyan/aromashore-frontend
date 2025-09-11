#!/usr/bin/env node

/**
 * Build script with fallback handling for network issues
 * This script attempts to build the application with proper error handling
 * and fallback strategies for when the backend is not available during build time.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables for build
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303';

console.log('� Starting build with fallback handling...');
console.log('� API URL:', process.env.NEXT_PUBLIC_API_URL);

try {
  // Attempt to build with increased timeout
  console.log('⏱️  Building with 2-minute timeout...');
  
  const buildCommand = 'next build';
  const buildProcess = execSync(buildCommand, {
    stdio: 'inherit',
    timeout: 300000, // 5 minutes total timeout
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096' // Increase memory limit
    }
  });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Check if it's a timeout error
  if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
    console.log('� Build timed out, attempting fallback build...');
    
    try {
      // Set a flag to use static content only
      process.env.BUILD_WITH_STATIC_FALLBACK = 'true';
      
      const fallbackBuildCommand = 'next build';
      execSync(fallbackBuildCommand, {
        stdio: 'inherit',
        timeout: 180000, // 3 minutes for fallback
        env: {
          ...process.env,
          BUILD_WITH_STATIC_FALLBACK: 'true'
        }
      });
      
      console.log('✅ Fallback build completed successfully!');
      
    } catch (fallbackError) {
      console.error('❌ Fallback build also failed:', fallbackError.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Build failed with non-timeout error');
    process.exit(1);
  }
}

console.log('� Build process completed!');
