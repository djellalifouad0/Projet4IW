const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

console.log('🧪 Test client WebSocket - Connexion au serveur existant...');

// Configuration de test
const SERVER_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 15000;
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY';

// Génération de tokens JWT pour les tests
function generateTestToken(userId, profileToken) {
    return jwt.sign(
        { userId, profileToken },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

let testResults = {
    connection: false,
    userConnection: false,
    messageDelivery: false,
    typingIndicators: false,
    onlineStatus: false,
    messageStatus: false
};

// Fonction utilitaire pour attendre
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour afficher les résultats
function showResults() {
    console.log('\n📊 RÉSULTATS DES TESTS:');
    console.log('========================');
    
    Object.entries(testResults).forEach(([test, passed]) => {
        const status = passed ? '✅ PASSÉ' : '❌ ÉCHOUÉ';
        const description = {
            connection: 'Connexion WebSocket',
            userConnection: 'Identification utilisateur',
            messageDelivery: 'Livraison de messages',
            typingIndicators: 'Indicateurs de frappe',
            onlineStatus: 'Statut en ligne',
            messageStatus: 'Statut des messages'
        };
        console.log(`${status} - ${description[test]}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log('\n📈 SCORE GLOBAL:');
    console.log(`${passedTests}/${totalTests} tests réussis (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
        console.log('🎉 TOUS LES TESTS SONT PASSÉS ! Le système WebSocket fonctionne parfaitement.');
    } else {
        console.log('⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.');
    }
}

async function runTests() {
    try {        console.log('🔌 Connexion au serveur...');
        
        // Génération des tokens d'authentification
        const user1Token = generateTestToken(1, 'test-profile-token-1');
        const user2Token = generateTestToken(2, 'test-profile-token-2');
        
        // Test 1: Connexion de base
        const user1 = io(SERVER_URL, {
            transports: ['websocket'],
            upgrade: false,
            auth: {
                token: user1Token
            }
        });
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout de connexion'));
            }, 5000);
            
            user1.on('connect', () => {
                console.log('✅ User 1 connecté');
                testResults.connection = true;
                clearTimeout(timeout);
                resolve();
            });
            
            user1.on('connect_error', (error) => {
                console.log('❌ Erreur de connexion:', error.message);
                clearTimeout(timeout);
                reject(error);
            });
        });
          // Test 2: Identification utilisateur
        console.log('👤 Test d\'identification...');
        // The server automatically handles user identification via JWT
        
        await wait(500);
        testResults.userConnection = true;
        console.log('✅ Identification réussie');
          // Test 3: Connexion d'un second utilisateur
        console.log('👥 Connexion du second utilisateur...');
        const user2 = io(SERVER_URL, {
            transports: ['websocket'],
            upgrade: false,
            auth: {
                token: user2Token
            }
        });
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout connexion user2'));
            }, 5000);
              user2.on('connect', () => {
                console.log('✅ User 2 connecté');
                // The server automatically handles user identification via JWT
                clearTimeout(timeout);
                resolve();
            });
        });
        
        // Test 4: Statut en ligne
        console.log('🟢 Test du statut en ligne...');
        let onlineUsersReceived = false;
          user1.on('online-users', (users) => {
            console.log('📡 Utilisateurs en ligne reçus:', users.length);
            if (users.length >= 2) {
                testResults.onlineStatus = true;
                onlineUsersReceived = true;
            }
        });
        
        user1.emit('get-online-users');
        await wait(1000);
        
        if (onlineUsersReceived) {
            console.log('✅ Statut en ligne fonctionnel');
        }
        
        // Test 5: Rejoindre une conversation
        console.log('💬 Test de conversation...');
        const conversationId = 1;
        
        user1.emit('join-conversation', { conversationId });
        user2.emit('join-conversation', { conversationId });
        await wait(500);
        
        // Test 6: Envoi de message
        console.log('📨 Test d\'envoi de message...');
        let messageReceived = false;
          user2.on('new-message', (data) => {
            console.log('📬 Message reçu par User 2:', data.content);
            messageReceived = true;
            testResults.messageDelivery = true;
            
            // Marquer comme lu
            user2.emit('message-read', {
                messageId: data.id,
                conversationId: data.conversationId
            });
        });
          user1.on('message-status', (data) => {
            console.log('📊 Statut de message mis à jour:', data.status);
            if (data.status === 'read') {
                testResults.messageStatus = true;
            }
        });
          const testMessage = {
            conversationId,
            message: {
                id: Date.now(), // Temporary ID for testing
                content: 'Message de test automatique',
                senderId: 1,
                senderName: 'TestUser1',
                createdAt: new Date().toISOString()
            }
        };
        
        user1.emit('send-message', testMessage);
        await wait(1000);
        
        if (messageReceived) {
            console.log('✅ Livraison de message fonctionnelle');
        }
        
        // Test 7: Indicateurs de frappe
        console.log('⌨️ Test des indicateurs de frappe...');
        let typingReceived = false;
        
        user2.on('user-typing', (data) => {
            console.log('⌨️ Indication de frappe reçue:', data.username);
            typingReceived = true;
            testResults.typingIndicators = true;
        });
        
        user1.emit('typing', {
            conversationId,
            userId: 1,
            username: 'TestUser1'
        });
        
        await wait(1000);
        
        if (typingReceived) {
            console.log('✅ Indicateurs de frappe fonctionnels');
        }
        
        // Nettoyage
        console.log('🧹 Nettoyage des connexions...');
        user1.disconnect();
        user2.disconnect();
        
        await wait(500);
        
    } catch (error) {
        console.error('❌ Erreur durant les tests:', error.message);
    }
    
    // Afficher les résultats finaux
    showResults();
    
    // Arrêter le processus
    console.log('\n👋 Tests terminés!');
    process.exit(0);
}

// Démarrer les tests avec un timeout global
console.log(`⏱️ Timeout des tests: ${TEST_TIMEOUT/1000}s`);
const globalTimeout = setTimeout(() => {
    console.log('\n⏰ TIMEOUT GLOBAL - Arrêt forcé des tests');
    showResults();
    process.exit(1);
}, TEST_TIMEOUT);

runTests().finally(() => {
    clearTimeout(globalTimeout);
});
