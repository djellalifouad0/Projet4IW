const { spawn } = require('child_process');
const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

console.log('🚀 Démarrage du test WebSocket complet...\n');

// Démarrer le serveur
const server = spawn('node', ['server.js'], { 
  cwd: process.cwd(),
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  console.log(`[SERVER] ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data.toString().trim()}`);
});

// Attendre que le serveur démarre
setTimeout(() => {
  console.log('\n🔧 Démarrage des tests WebSocket...\n');
  runTests();
}, 3000);

function runTests() {
  // Créer des tokens JWT valides
  const token1 = jwt.sign(
    { userId: 1, profileToken: 'test-1' },
    process.env.JWT_SECRET || 'SECRET_KEY'
  );
  
  const token2 = jwt.sign(
    { userId: 2, profileToken: 'test-2' },
    process.env.JWT_SECRET || 'SECRET_KEY'
  );

  console.log('Token User 1:', token1);
  console.log('Token User 2:', token2);
  console.log('');

  // Test avec User 1
  const user1 = io('http://localhost:5000', {
    auth: { token: token1 }
  });

  // Test avec User 2
  const user2 = io('http://localhost:5000', {
    auth: { token: token2 }
  });

  user1.on('connect', () => {
    console.log('✅ User 1 connecté (ID: 1)');
    user1.emit('join-conversation', 1);
    user1.emit('get-online-users');
  });

  user2.on('connect', () => {
    console.log('✅ User 2 connecté (ID: 2)');
    user2.emit('join-conversation', 1);
    
    // Test message après 2 secondes
    setTimeout(() => {
      console.log('📤 User 2 envoie un message...');
      user2.emit('send-message', {
        conversationId: 1,
        message: {
          id: Date.now(),
          content: 'Salut ! Message de test depuis User 2',
          senderName: 'TestUser2',
          createdAt: new Date().toISOString()
        }
      });
    }, 2000);

    // Test indicateur de frappe après 4 secondes
    setTimeout(() => {
      console.log('⌨️  User 2 commence à taper...');
      user2.emit('typing', {
        conversationId: 1,
        isTyping: true
      });
      
      setTimeout(() => {
        console.log('⌨️  User 2 arrête de taper...');
        user2.emit('typing', {
          conversationId: 1,
          isTyping: false
        });
      }, 2000);
    }, 4000);
  });

  // User 1 répond au message
  user1.on('new-message', (message) => {
    console.log(`📨 User 1 a reçu: "${message.content}" de ${message.senderName}`);
    
    // User 1 répond
    setTimeout(() => {
      console.log('📤 User 1 répond...');
      user1.emit('send-message', {
        conversationId: 1,
        message: {
          id: Date.now() + 1,
          content: 'Hello ! Réponse de User 1',
          senderName: 'TestUser1',
          createdAt: new Date().toISOString()
        }
      });
    }, 1000);
  });

  user2.on('new-message', (message) => {
    console.log(`📨 User 2 a reçu: "${message.content}" de ${message.senderName}`);
  });

  // Gestion des indicateurs de frappe
  user1.on('user-typing', (data) => {
    if (data.isTyping) {
      console.log(`⌨️  User 1 voit: User ${data.userId} tape...`);
    } else {
      console.log(`⌨️  User 1 voit: User ${data.userId} a arrêté de taper`);
    }
  });

  user2.on('user-typing', (data) => {
    if (data.isTyping) {
      console.log(`⌨️  User 2 voit: User ${data.userId} tape...`);
    } else {
      console.log(`⌨️  User 2 voit: User ${data.userId} a arrêté de taper`);
    }
  });

  // Gestion des utilisateurs en ligne
  user1.on('online-users', (users) => {
    console.log(`👥 Utilisateurs en ligne: [${users.join(', ')}]`);
  });

  user1.on('user-connected', (data) => {
    console.log(`🟢 User ${data.userId} s'est connecté`);
  });

  user1.on('user-disconnected', (data) => {
    console.log(`🔴 User ${data.userId} s'est déconnecté`);
  });

  // Gestion des erreurs
  [user1, user2].forEach((socket, index) => {
    socket.on('connect_error', (error) => {
      console.error(`❌ Erreur connexion User ${index + 1}:`, error.message);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User ${index + 1} déconnecté`);
    });
  });

  // Terminer le test après 15 secondes
  setTimeout(() => {
    console.log('\n🏁 Test terminé ! Fermeture des connexions...');
    user1.disconnect();
    user2.disconnect();
    
    setTimeout(() => {
      console.log('🔴 Arrêt du serveur...');
      server.kill();
      process.exit(0);
    }, 1000);
  }, 15000);
}

process.on('exit', () => {
  console.log('\n👋 Au revoir !');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt forcé...');
  server.kill();
  process.exit(0);
});
