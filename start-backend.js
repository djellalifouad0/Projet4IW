// Quick script to start the backend server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server...');

const serverProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
});

serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
});

serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});

console.log('✅ Backend server started in background');
