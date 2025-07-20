'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter les colonnes manquantes une par une pour éviter les erreurs si elles existent déjà
    try {
      await queryInterface.addColumn('User', 'bio', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User biography'
      });
    } catch (error) {
      console.log('Column bio already exists or error:', error.message);
    }

    try {
      await queryInterface.addColumn('User', 'address', {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'User address'
      });
    } catch (error) {
      console.log('Column address already exists or error:', error.message);
    }

    // Modifier les colonnes avatar et cover pour accepter TEXT au lieu de VARCHAR
    try {
      await queryInterface.changeColumn('User', 'avatar', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL or base64 data of the user avatar image'
      });
    } catch (error) {
      console.log('Error modifying avatar column:', error.message);
    }

    try {
      await queryInterface.changeColumn('User', 'cover', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL or base64 data of the user cover image'
      });
    } catch (error) {
      console.log('Error modifying cover column:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback - supprimer les colonnes ajoutées
    try {
      await queryInterface.removeColumn('User', 'bio');
    } catch (error) {
      console.log('Error removing bio column:', error.message);
    }

    try {
      await queryInterface.removeColumn('User', 'address');
    } catch (error) {
      console.log('Error removing address column:', error.message);
    }

    // Remettre avatar et cover en VARCHAR(255)
    try {
      await queryInterface.changeColumn('User', 'avatar', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      console.log('Error reverting avatar column:', error.message);
    }

    try {
      await queryInterface.changeColumn('User', 'cover', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      console.log('Error reverting cover column:', error.message);
    }
  }
};
