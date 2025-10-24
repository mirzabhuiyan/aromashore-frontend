#!/usr/bin/env node

/**
 * Script to clear cache and restart development server
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Clearing cache and restarting development server...');

// Clear Next.js cache
const nextCachePath = path.join(__dirname, '../.next');
if (fs.existsSync(nextCachePath)) {
    console.log('🗑️  Clearing .next cache...');
    fs.rmSync(nextCachePath, { recursive: true, force: true });
}

// Clear node_modules cache
const nodeModulesPath = path.join(__dirname, '../node_modules/.cache');
if (fs.existsSync(nodeModulesPath)) {
    console.log('🗑️  Clearing node_modules cache...');
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
}

console.log('✅ Cache cleared!');
console.log('📝 Please restart your development server with: npm run dev');
console.log('🌐 Then hard refresh your browser with Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
