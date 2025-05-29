const { User } = require('../models/associations');
const sequelize = require('../config/db');

async function makeUserAdmin() {
  try {
    // Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Afficher tous les utilisateurs
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'],
      order: [['id', 'ASC']]
    });    console.log('\n=== Utilisateurs disponibles ===');
    users.forEach(user => {
      console.log(`ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Role: ${user.role}`);
    });

    // Pour simplifier, on prend le premier utilisateur trouvé ou on peut spécifier un ID
    const userId = process.argv[2]; // ID passé en argument
    
    if (!userId) {
      console.log('\n💡 Usage: node scripts/make-admin.js <user_id>');
      console.log('Exemple: node scripts/make-admin.js 1');
      process.exit(0);
    }

    const user = await User.findByPk(parseInt(userId));
    
    if (!user) {
      console.log('❌ Utilisateur introuvable');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`✅ ${user.username} est déjà administrateur`);
      process.exit(0);
    }

    // Mettre à jour le rôle
    await user.update({ role: 'admin' });
    console.log(`✅ ${user.username} est maintenant administrateur !`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
}

// Lancer le script
makeUserAdmin();
