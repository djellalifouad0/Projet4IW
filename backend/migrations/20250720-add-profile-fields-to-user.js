'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Vérifier si les colonnes existent déjà avant de les ajouter
    const tableDescription = await queryInterface.describeTable('User');
    
    if (!tableDescription.bio) {
      await queryInterface.addColumn('User', 'bio', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User biography'
      });
    }

    if (!tableDescription.address) {
      await queryInterface.addColumn('User', 'address', {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'User address'
      });
    }

    // Modifier le type des colonnes avatar et cover pour supporter les données base64
    if (tableDescription.avatar) {
      await queryInterface.changeColumn('User', 'avatar', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL or base64 data of the user avatar image'
      });
    }

    if (tableDescription.cover) {
      await queryInterface.changeColumn('User', 'cover', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL or base64 data of the user cover image'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revenir aux types précédents ou supprimer les colonnes
    const tableDescription = await queryInterface.describeTable('User');
    
    if (tableDescription.bio) {
      await queryInterface.removeColumn('User', 'bio');
    }
    
    if (tableDescription.address) {
      await queryInterface.removeColumn('User', 'address');
    }

    // Remettre les types STRING pour avatar et cover
    if (tableDescription.avatar) {
      await queryInterface.changeColumn('User', 'avatar', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (tableDescription.cover) {
      await queryInterface.changeColumn('User', 'cover', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  }
};
