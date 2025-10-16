#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting development server...');

// Kill any existing processes on port 3000
const killProcess = spawn('netstat', ['-ano'], { shell: true });
let output = '';

killProcess.stdout.on('data', (data) => {
  output += data.toString();
});

killProcess.on('close', () => {
  const lines = output.split('\n');
  const port3000Lines = lines.filter(line => line.includes(':3000') && line.includes('LISTENING'));
  
  if (port3000Lines.length > 0) {
    const pids = port3000Lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return parts[parts.length - 1];
    });
    
    console.log(`🔪 Killing processes: ${pids.join(', ')}`);
    
    pids.forEach(pid => {
      spawn('taskkill', ['/F', '/PID', pid], { shell: true });
    });
  }
  
  // Wait a moment then start the server
  setTimeout(() => {
    console.log('🚀 Starting development server...');
    const devServer = spawn('npm', ['run', 'dev'], { 
      shell: true, 
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit'
    });
    
    devServer.on('error', (err) => {
      console.error('❌ Failed to start development server:', err);
    });
  }, 2000);
});
