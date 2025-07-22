'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('User', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'User biography/description'
    });

    await queryInterface.addColumn('User', 'address', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'User address/location'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('User', 'bio');
    await queryInterface.removeColumn('User', 'address');
  }
};
