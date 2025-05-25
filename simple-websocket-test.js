// Simple WebSocket test using existing backend
// Run this from the backend directory: node ../simple-websocket-test.js

const path = require('path');
const { spawn } = require('child_process');

console.log('🧪 Simple WebSocket Test');
console.log('========================');
console.log('');

console.log('📋 Instructions to test the WebSocket functionality:');
console.log('');
console.log('1. 🚀 Start the backend server:');
console.log('   cd backend');
console.log('   node server.js');
console.log('');
console.log('2. 🌐 Open the test page in your browser:');
console.log('   Open: file:///c:/Users/Samuel/Documents/GitHub/Projet4IW/test-jwt-correction.html');
console.log('');
console.log('3. 🔐 Test the login:');
console.log('   - Email: test@test.com');
console.log('   - Password: test123');
console.log('   - Click "Se connecter (simuler)"');
console.log('');
console.log('4. 🔌 Test WebSocket connection:');
console.log('   - Click "Tester Connexion WebSocket"');
console.log('');
console.log('5. 💬 Test chat functionality:');
console.log('   Open: file:///c:/Users/Samuel/Documents/GitHub/Projet4IW/test-chat.html');
console.log('   - Paste the JWT token from step 3');
console.log('   - Click "Se connecter"');
console.log('   - Join a conversation (ID: 1)');
console.log('   - Send messages');
console.log('');
console.log('🔍 Expected Results:');
console.log('✅ JWT token should be generated with: id, userId, role, profileToken');
console.log('✅ WebSocket connection should succeed');
console.log('✅ Messages should be sent and received');
console.log('✅ Online users should be displayed');
console.log('✅ Typing indicators should work');
console.log('');

// Check if backend server is running
const { exec } = require('child_process');

exec('netstat -ano | findstr :5000', (error, stdout, stderr) => {
    if (stdout.trim()) {
        console.log('🟢 Backend server appears to be running on port 5000');
    } else {
        console.log('🔴 Backend server is not running on port 5000');
        console.log('   Please start it with: cd backend && node server.js');
    }
    console.log('');
});

// Open test files in browser
console.log('🌐 Opening test files in browser...');

setTimeout(() => {
    try {
        const { exec } = require('child_process');
        
        // Open JWT test page
        exec(`start "" "file:///c:/Users/Samuel/Documents/GitHub/Projet4IW/test-jwt-correction.html"`, (error) => {
            if (error) console.log('Could not open JWT test page automatically');
        });
        
        // Open chat test page
        setTimeout(() => {
            exec(`start "" "file:///c:/Users/Samuel/Documents/GitHub/Projet4IW/test-chat.html"`, (error) => {
                if (error) console.log('Could not open chat test page automatically');
            });
        }, 2000);
        
    } catch (error) {
        console.log('Could not open browsers automatically. Please open the URLs manually.');
    }
}, 1000);
