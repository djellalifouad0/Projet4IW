const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

const SERVER_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY';

// Fonction pour générer un token de test
function generateTestToken(userId, profileToken) {
    return jwt.sign(
        { userId, profileToken },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

async function simpleTest() {
    console.log('🧪 Test WebSocket simple...');
    
    try {
        const token = generateTestToken(1, 'test-profile-1');
        const socket = io(SERVER_URL, {
            transports: ['websocket'],
            auth: { token }
        });
        
        // Test de connexion
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
            
            socket.on('connect', () => {
                console.log('✅ Connexion réussie');
                clearTimeout(timeout);
                resolve();
            });
            
            socket.on('connect_error', (error) => {
                console.log('❌ Erreur:', error.message);
                clearTimeout(timeout);
                reject(error);
            });
        });
        
        // Test utilisateurs en ligne
        socket.on('online-users', (users) => {
            console.log('📱 Utilisateurs en ligne:', users);
        });
        
        socket.emit('get-online-users');
        
        setTimeout(() => {
            socket.disconnect();
            console.log('👋 Test terminé');
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

simpleTest();
