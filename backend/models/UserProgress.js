/**
 * Modèle Progression Utilisateur
 * @version 1.0.0
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./User');

const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  exerciseId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  exerciseType: {
    type: DataTypes.ENUM('qcm', 'cloze', 'writing', 'listening', 'reading', 'speaking'),
    allowNull: false
  },
  questionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAnswer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Temps en secondes'
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.ENUM('A2', 'B1', 'B2', 'C1'),
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_progress',
  timestamps: true
});

// Association avec User
UserProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(UserProgress, { foreignKey: 'userId', as: 'progress' });

module.exports = UserProgress;

