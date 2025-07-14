const { Sequelize } = require('sequelize')

// Connexion MySQL
const sequelize = new Sequelize('skills5', 'root', 'root', {
  host: 'localhost', 
  dialect: 'mysql',
  logging: true,    
    define: {
    freezeTableName: true,
  },
 
})

module.exports = sequelize;

