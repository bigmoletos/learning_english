/**
 * Modèle Plan d'Apprentissage
 * @version 1.0.0
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./User');

const LearningPlan = sequelize.define('LearningPlan', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('high', 'medium', 'low'),
    defaultValue: 'medium'
  },
  targetLevel: {
    type: DataTypes.ENUM('A2', 'B1', 'B2', 'C1'),
    allowNull: false
  },
  estimatedWeeks: {
    type: DataTypes.INTEGER,
    defaultValue: 4
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  exerciseTypes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  domains: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAutoAdapted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'learning_plans',
  timestamps: true
});

// Association avec User
LearningPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(LearningPlan, { foreignKey: 'userId', as: 'learningPlans' });

module.exports = LearningPlan;

