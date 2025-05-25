// Complete test script for WebSocket functionality
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'votre_clé_secrète';

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(express.static('.'));

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email, password });
    
    // Simple test authentication
    if (email === 'test@test.com' && password === 'test123') {
        const token = jwt.sign({
            id: 1,
            userId: 1,
            role: 'user',
            profileToken: 'test-profile-token-123'
        }, JWT_SECRET, { expiresIn: '2h' });
        
        console.log('✅ Login successful, token generated');
        res.json({ token });
    } else {
        console.log('❌ Login failed - invalid credentials');
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// WebSocket authentication middleware
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        console.log('🔍 Authenticating WebSocket connection...');
        
        if (!token) {
            console.log('❌ No token provided');
            return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verified:', decoded);
        
        socket.userId = decoded.userId || decoded.id;
        socket.profileToken = decoded.profileToken;
        socket.role = decoded.role;
        
        next();
    } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        next(new Error('Invalid authentication token'));
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.userId} connected with socket ${socket.id}`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Broadcast user connection
    socket.broadcast.emit('user-connected', { 
        userId: socket.userId,
        socketId: socket.id 
    });

    // Handle joining conversations
    socket.on('join-conversation', (conversationId) => {
        console.log(`👥 User ${socket.userId} joining conversation ${conversationId}`);
        socket.join(`conversation_${conversationId}`);
        socket.currentConversation = conversationId;
        
        socket.emit('conversation-joined', { 
            conversationId,
            message: `Joined conversation ${conversationId}` 
        });
    });

    // Handle new messages
    socket.on('new-message', (data) => {
        console.log(`💬 New message from user ${socket.userId}:`, data);
        
        const messageData = {
            id: Date.now(),
            content: data.content,
            senderId: socket.userId,
            senderName: `User ${socket.userId}`,
            conversationId: data.conversationId,
            timestamp: new Date().toISOString()
        };

        // Broadcast to conversation room
        io.to(`conversation_${data.conversationId}`).emit('new-message', messageData);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        console.log(`⌨️ User ${socket.userId} typing:`, data);
        
        socket.to(`conversation_${data.conversationId}`).emit('user-typing', {
            userId: socket.userId,
            isTyping: data.isTyping,
            conversationId: data.conversationId
        });
    });

    // Handle get online users
    socket.on('get-online-users', () => {
        const onlineUsers = Array.from(io.sockets.sockets.keys()).map(socketId => {
            const sock = io.sockets.sockets.get(socketId);
            return sock ? sock.userId : null;
        }).filter(Boolean);
        
        console.log('👥 Online users requested:', onlineUsers);
        socket.emit('online-users', onlineUsers);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`❌ User ${socket.userId} disconnected`);
        
        socket.broadcast.emit('user-disconnected', { 
            userId: socket.userId,
            socketId: socket.id 
        });
    });
});

// Serve test files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-jwt-correction.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-chat.html'));
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} for JWT test`);
    console.log(`💬 Open http://localhost:${PORT}/chat for chat test`);
    console.log(`🔍 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log('');
    console.log('🧪 Test Instructions:');
    console.log('1. Open http://localhost:5000 in your browser');
    console.log('2. Use email: test@test.com, password: test123');
    console.log('3. Click "Se connecter (simuler)" to get a JWT token');
    console.log('4. Click "Tester Connexion WebSocket" to test WebSocket');
    console.log('5. Open http://localhost:5000/chat in another tab to test chat');
});
