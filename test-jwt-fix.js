// Test pour vérifier que les tokens JWT sont correctement formatés
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'votre_clé_secrète';

// Simuler la création d'un token comme dans authController.js
const testUser = {
  id: 1,
  role: 'user',
  profileToken: 'abc123def456'
};

const token = jwt.sign({ 
  id: testUser.id, 
  userId: testUser.id, // Ajouter pour compatibilité WebSocket
  role: testUser.role,
  profileToken: testUser.profileToken 
}, JWT_SECRET, { expiresIn: '2h' });

console.log('🔑 Token généré:', token);

// Tester le décodage côté WebSocket
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token décodé avec succès:');
  console.log('  - userId:', decoded.userId);
  console.log('  - id:', decoded.id);
  console.log('  - role:', decoded.role);
  console.log('  - profileToken:', decoded.profileToken);
} catch (error) {
  console.error('❌ Erreur de décodage:', error.message);
}
