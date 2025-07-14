const fs = require('fs')
const path = require('path')
const sequelize = require('../config/db')
const { Sequelize } = require('sequelize')

const db = { sequelize, Sequelize }

// Charger tous les modèles de ce dossier
fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js'  && file !== 'associations.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))
    db[model.name] = model
  })

// Appeler .associate() si défini dans le modèle
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

module.exports = db
