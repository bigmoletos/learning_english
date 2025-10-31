/**
 * Modèle Résultats d'Évaluation
 * @version 1.0.0
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./User');

const AssessmentResult = sequelize.define('AssessmentResult', {
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
  assessmentType: {
    type: DataTypes.ENUM('initial', 'progress', 'final'),
    defaultValue: 'initial'
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  listeningScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  readingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  writingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  speakingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  overallScore: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assessedLevel: {
    type: DataTypes.ENUM('A2', 'B1', 'B2', 'C1'),
    allowNull: false
  },
  weakAreas: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  strongAreas: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  answers: {
    type: DataTypes.JSON,
    comment: 'Détails de toutes les réponses'
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'assessment_results',
  timestamps: true
});

// Association avec User
AssessmentResult.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AssessmentResult, { foreignKey: 'userId', as: 'assessments' });

module.exports = AssessmentResult;

