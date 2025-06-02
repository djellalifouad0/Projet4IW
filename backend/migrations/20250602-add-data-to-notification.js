'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Vérifier si la colonne 'data' existe déjà
      const tableDescription = await queryInterface.describeTable('Notifications');
      
      if (!tableDescription.data) {
        await queryInterface.addColumn('Notifications', 'data', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        console.log('Colonne "data" ajoutée à la table Notifications');
      } else {
        console.log('Colonne "data" existe déjà dans la table Notifications');
      }
    } catch (error) {
      console.error('Erreur lors de la migration des notifications:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableDescription = await queryInterface.describeTable('Notifications');
      
      if (tableDescription.data) {
        await queryInterface.removeColumn('Notifications', 'data');
        console.log('Colonne "data" supprimée de la table Notifications');
      }
    } catch (error) {
      console.error('Erreur lors du rollback de la migration:', error);
      throw error;
    }
  }
};
