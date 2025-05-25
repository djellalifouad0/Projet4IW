console.log('Testing imports...');

try {
  const app = require('./app');
  console.log('✅ App imported successfully');
  
  const http = require('http');
  console.log('✅ HTTP imported successfully');
  
  const socketIo = require('socket.io');
  console.log('✅ Socket.IO imported successfully');
  
  const jwt = require('jsonwebtoken');
  console.log('✅ JWT imported successfully');
  
  console.log('🚀 All imports working!');
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error(error.stack);
}
