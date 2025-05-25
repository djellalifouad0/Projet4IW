const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Configuration de test avec un vrai token JWT
const TEST_TOKEN = jwt.sign(
  { userId: 1, profileToken: 'test-profile-1' },
  process.env.JWT_SECRET || 'SECRET_KEY'
);

const TEST_TOKEN_2 = jwt.sign(
  { userId: 2, profileToken: 'test-profile-2' },
  process.env.JWT_SECRET || 'SECRET_KEY'
);

console.log('🔧 Test WebSocket - Démarrage...');
console.log('Token 1:', TEST_TOKEN);
console.log('Token 2:', TEST_TOKEN_2);

// Connexion au serveur WebSocket
const socket = io('http://localhost:5000', {
  auth: {
    token: TEST_TOKEN
  }
});

socket.on('connect', () => {
  console.log('✅ Connecté au serveur WebSocket');
  
  // Test rejoindre une conversation
  socket.emit('join-conversation', 1);
  
  // Test envoyer un message
  setTimeout(() => {
    socket.emit('send-message', {
      conversationId: 1,
      message: {
        id: Date.now(),
        content: 'Message de test WebSocket',
        senderName: 'TestUser',
        createdAt: new Date().toISOString()
      }
    });
  }, 1000);
  
  // Test indicateur de frappe
  setTimeout(() => {
    socket.emit('typing', {
      conversationId: 1,
      isTyping: true
    });
    
    setTimeout(() => {
      socket.emit('typing', {
        conversationId: 1,
        isTyping: false
      });
    }, 2000);
  }, 2000);
});

socket.on('new-message', (message) => {
  console.log('📨 Nouveau message reçu:', message);
});

socket.on('user-typing', (data) => {
  console.log('⌨️ Indicateur de frappe:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erreur de connexion:', error.message);
});

socket.on('disconnect', () => {
  console.log('❌ Déconnecté du serveur');
});

// Test avec deux utilisateurs simultanément
function testMultipleUsers() {
  console.log('\n🔧 Test avec plusieurs utilisateurs...');
  
  // Utilisateur 1
  const user1 = io('http://localhost:5000', {
    auth: { token: TEST_TOKEN }
  });
  
  // Utilisateur 2  
  const user2 = io('http://localhost:5000', {
    auth: { token: TEST_TOKEN_2 }
  });
  
  user1.on('connect', () => {
    console.log('✅ User 1 connecté');
    user1.emit('join-conversation', 1);
  });
  
  user2.on('connect', () => {
    console.log('✅ User 2 connecté');
    user2.emit('join-conversation', 1);
    
    // User 2 envoie un message après 2 secondes
    setTimeout(() => {
      user2.emit('send-message', {
        conversationId: 1,
        message: {
          id: Date.now(),
          content: 'Hello depuis User 2!',
          senderName: 'TestUser2',
          createdAt: new Date().toISOString()
        }
      });
    }, 2000);
  });
  
  user1.on('new-message', (message) => {
    console.log('👤 User 1 a reçu:', message.content);
  });
  
  user2.on('new-message', (message) => {
    console.log('👤 User 2 a reçu:', message.content);
  });
  
  // Test statuts utilisateurs
  user1.on('user-connected', (data) => {
    console.log('🟢 User connecté:', data.userId);
  });
  
  user1.on('user-disconnected', (data) => {
    console.log('🔴 User déconnecté:', data.userId);
  });
  
  // Déconnecter après 8 secondes
  setTimeout(() => {
    user1.disconnect();
    user2.disconnect();
  }, 8000);
}

// Lancer le test multiple après le test principal
setTimeout(() => {
  testMultipleUsers();
}, 5000);

// Arrêter le test après 15 secondes
setTimeout(() => {
  console.log('🔧 Test terminé');
  socket.disconnect();
  process.exit(0);
}, 15000);
