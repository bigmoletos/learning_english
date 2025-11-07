/**
 * Configuration de la connexion à la base de données
 * @version 1.0.0
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Configuration SQLite (développement)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database/learning_english.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

// Pour PostgreSQL (production) :
/*
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});
*/

// Test de connexion
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données établie');
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à la base de données:', err);
  });

module.exports = sequelize;

