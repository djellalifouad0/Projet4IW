const sequelize = require('./config/db');
const User = require('./models/user');

async function syncDatabase() {
  try {
    console.log('Synchronisation de la base de données...');
    
    // Synchroniser le modèle User avec force: false pour éviter de supprimer les données
    await User.sync({ alter: true });
    
    console.log('Base de données synchronisée avec succès !');
    console.log('Les champs avatar, cover, bio et address ont été ajoutés à la table User.');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    process.exit(1);
  }
}

syncDatabase();
