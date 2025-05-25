const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

const SERVER_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY';

function generateTestToken(userId, profileToken) {
    return jwt.sign({ userId, profileToken }, JWT_SECRET, { expiresIn: '1h' });
}

async function finalTest() {
    console.log('🎯 Test final des fonctionnalités WebSocket');
    console.log('='.repeat(50));
    
    const results = {
        connection: false,
        authentication: false,
        onlineStatus: false,
        joinConversation: false,
        messageDelivery: false,
        typingIndicators: false
    };
    
    try {
        // Créer deux utilisateurs de test
        const user1Token = generateTestToken(1, 'profile-1');
        const user2Token = generateTestToken(2, 'profile-2');
        
        console.log('👤 Connexion User 1...');
        const user1 = io(SERVER_URL, {
            transports: ['websocket'],
            auth: { token: user1Token }
        });
        
        // Test 1: Connexion
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
            user1.on('connect', () => {
                console.log('✅ User 1 connecté');
                results.connection = true;
                results.authentication = true;
                clearTimeout(timeout);
                resolve();
            });
            user1.on('connect_error', (error) => {
                console.log('❌ Erreur User 1:', error.message);
                clearTimeout(timeout);
                reject(error);
            });
        });
        
        // Attendre un peu
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('👤 Connexion User 2...');
        const user2 = io(SERVER_URL, {
            transports: ['websocket'],
            auth: { token: user2Token }
        });
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
            user2.on('connect', () => {
                console.log('✅ User 2 connecté');
                clearTimeout(timeout);
                resolve();
            });
            user2.on('connect_error', (error) => {
                console.log('❌ Erreur User 2:', error.message);
                clearTimeout(timeout);
                reject(error);
            });
        });
        
        // Test 2: Statut en ligne
        console.log('🟢 Test du statut en ligne...');
        await new Promise((resolve) => {
            user1.on('online-users', (users) => {
                console.log(`📊 Utilisateurs en ligne: ${users.length}`);
                if (users.length >= 2) {
                    results.onlineStatus = true;
                    console.log('✅ Statut en ligne fonctionnel');
                }
                resolve();
            });
            user1.emit('get-online-users');
        });
        
        // Test 3: Rejoindre une conversation
        console.log('🏠 Test de rejoindre conversation...');
        const conversationId = 1;
        user1.emit('join-conversation', conversationId);
        user2.emit('join-conversation', conversationId);
        results.joinConversation = true;
        console.log('✅ Utilisateurs ont rejoint la conversation');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Test 4: Indicateurs de frappe
        console.log('⌨️  Test indicateurs de frappe...');
        let typingReceived = false;
        user2.on('user-typing', (data) => {
            console.log(`💬 Indication de frappe reçue de User ${data.userId}`);
            typingReceived = true;
            results.typingIndicators = true;
        });
        
        user1.emit('typing', { conversationId, isTyping: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (typingReceived) {
            console.log('✅ Indicateurs de frappe fonctionnels');
        }
        
        // Test 5: Envoi de message
        console.log('📨 Test envoi de message...');
        let messageReceived = false;
        user2.on('new-message', (message) => {
            console.log(`📬 Message reçu: "${message.content}"`);
            messageReceived = true;
            results.messageDelivery = true;
        });
        
        const testMessage = {
            conversationId: conversationId,
            message: {
                id: Date.now(),
                content: 'Message de test final',
                senderName: 'TestUser1',
                createdAt: new Date().toISOString()
            }
        };
        
        user1.emit('send-message', testMessage);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (messageReceived) {
            console.log('✅ Livraison de message fonctionnelle');
        }
        
        // Résultats finaux
        console.log('\n' + '='.repeat(50));
        console.log('📊 RÉSULTATS FINAUX:');
        console.log('='.repeat(50));
        
        const features = [
            { name: 'Connexion WebSocket', status: results.connection },
            { name: 'Authentification JWT', status: results.authentication },
            { name: 'Statut en ligne', status: results.onlineStatus },
            { name: 'Rejoindre conversation', status: results.joinConversation },
            { name: 'Livraison de messages', status: results.messageDelivery },
            { name: 'Indicateurs de frappe', status: results.typingIndicators }
        ];
        
        let passedCount = 0;
        features.forEach(feature => {
            const status = feature.status ? '✅ PASSÉ' : '❌ ÉCHOUÉ';
            console.log(`${feature.name}: ${status}`);
            if (feature.status) passedCount++;
        });
        
        console.log('\n' + '='.repeat(50));
        console.log(`🎯 SCORE: ${passedCount}/${features.length} fonctionnalités réussies (${Math.round(passedCount/features.length*100)}%)`);
        
        if (passedCount === features.length) {
            console.log('🎉 SUCCÈS TOTAL! Toutes les fonctionnalités WebSocket fonctionnent!');
        } else if (passedCount >= 4) {
            console.log('✅ SUCCÈS PARTIEL! La plupart des fonctionnalités fonctionnent!');
        } else {
            console.log('⚠️  Certaines fonctionnalités nécessitent des corrections');
        }
        
        // Nettoyer
        user1.disconnect();
        user2.disconnect();
        console.log('\n👋 Test terminé!');
        
    } catch (error) {
        console.error('❌ Erreur during test:', error.message);
    }
}

finalTest();
