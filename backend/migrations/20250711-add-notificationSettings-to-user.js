module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'notificationSettings', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'JSON string containing user notification preferences'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'notificationSettings');
  }
};
