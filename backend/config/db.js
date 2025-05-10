const { Sequelize } = require('sequelize');

// Connexion avec SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// ➕ Si tu veux utiliser MySQL à la place, décommente ce bloc :
// const sequelize = new Sequelize('nom_bdd', 'utilisateur', 'mot_de_passe', {
//   host: 'localhost',
//   dialect: 'mysql'
// });

module.exports = sequelize;
