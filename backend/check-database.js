// Script pour vérifier et réparer la base de données
const sequelize = require('./config/db');
const User = require('./models/user');
const crypto = require('crypto');

async function checkAndRepairDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');
    
    // Test de connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier si la table Users existe et a la colonne profileToken
    const [results] = await sequelize.query(
      "PRAGMA table_info(Users);"
    );
    
    console.log('📋 Colonnes de la table Users:');
    results.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} (nullable: ${!col.notnull})`);
    });
    
    // Vérifier si profileToken existe
    const hasProfileToken = results.some(col => col.name === 'profileToken');
    
    if (!hasProfileToken) {
      console.log('⚠️  Colonne profileToken manquante, ajout...');
      
      // Ajouter la colonne profileToken
      await sequelize.query(
        "ALTER TABLE Users ADD COLUMN profileToken VARCHAR(255);"
      );
      
      console.log('✅ Colonne profileToken ajoutée');
      
      // Générer des profileTokens pour les utilisateurs existants
      const users = await User.findAll();
      console.log(`🔄 Mise à jour de ${users.length} utilisateur(s)...`);
      
      for (const user of users) {
        if (!user.profileToken) {
          user.profileToken = crypto.randomBytes(16).toString('hex');
          await user.save();
          console.log(`  ✅ ProfileToken généré pour ${user.username}: ${user.profileToken}`);
        }
      }
      
      // Rendre la colonne unique après avoir ajouté les valeurs
      await sequelize.query(
        "CREATE UNIQUE INDEX idx_users_profile_token ON Users(profileToken);"
      );
      
      console.log('✅ Index unique créé pour profileToken');
    } else {
      console.log('✅ Colonne profileToken existe déjà');
      
      // Vérifier que tous les utilisateurs ont un profileToken
      const usersWithoutToken = await User.findAll({
        where: {
          profileToken: null
        }
      });
      
      if (usersWithoutToken.length > 0) {
        console.log(`🔄 ${usersWithoutToken.length} utilisateur(s) sans profileToken trouvé(s), génération...`);
        
        for (const user of usersWithoutToken) {
          user.profileToken = crypto.randomBytes(16).toString('hex');
          await user.save();
          console.log(`  ✅ ProfileToken généré pour ${user.username}: ${user.profileToken}`);
        }
      }
    }
    
    // Afficher tous les utilisateurs avec leurs profileTokens
    const allUsers = await User.findAll({
      attributes: ['id', 'username', 'email', 'profileToken']
    });
    
    console.log('\n👥 Utilisateurs dans la base de données:');
    allUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Token: ${user.profileToken}`);
    });
    
    console.log('\n✅ Base de données vérifiée et réparée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données:', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter la vérification
checkAndRepairDatabase();
