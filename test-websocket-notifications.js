const io = require('socket.io-client');

// Test de connexion WebSocket avec authentification
const testWebSocketNotifications = () => {
  // ⚠️ Remplacez par votre token JWT valide
  const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzIsInVzZXJJZCI6MzIsInJvbGUiOiJ1c2VyIiwicHJvZmlsZVRva2VuIjoiMjFhYzBjNzFhZTI5MjgyMDQzZTEzZGE1ZTc1MzY4Y2QiLCJpYXQiOjE3MzMxODk0NzV9.GQ0SdI3HYkUx5u2_Ge7IzLAO2LhpGCCu7R60PnHXVaQ";
  
  console.log('🔌 Connexion au serveur WebSocket...');
  
  const socket = io('http://localhost:5000', {
    auth: {
      token: AUTH_TOKEN
    }
  });
  
  socket.on('connect', () => {
    console.log('✅ Connecté au serveur WebSocket avec l\'ID:', socket.id);
    
    // Écouter les événements de notification
    socket.on('new-notification', (data) => {
      console.log('🔔 Nouvelle notification reçue:', data);
    });
    
    socket.on('notification-count-update', (count) => {
      console.log('📊 Compteur de notifications mis à jour:', count);
    });
    
    // Demander le nombre de notifications actuelles
    console.log('📋 Demande du nombre de notifications...');
    socket.emit('get-notification-count');
    
    // Simuler une vérification de notifications
    setTimeout(() => {
      console.log('🔍 Demande de vérification des notifications...');
      socket.emit('check-notifications');
    }, 2000);
    
    // Fermer la connexion après 10 secondes
    setTimeout(() => {
      console.log('👋 Fermeture de la connexion test...');
      socket.disconnect();
    }, 10000);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion WebSocket:', error.message);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Déconnecté du serveur WebSocket');
  });
};

// Lancer le test
testWebSocketNotifications();
