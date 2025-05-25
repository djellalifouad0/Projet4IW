// Migration pour ajouter le champ parentId à Comment
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Comments');
    if (!tableDescription.parentId) {
      await queryInterface.addColumn('Comments', 'parentId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      });
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Comments', 'parentId');
  }
};
