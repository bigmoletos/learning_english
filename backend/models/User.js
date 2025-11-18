/**
 * Modèle Utilisateur
 * @version 1.0.0
 */

const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../database/connection");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user"
  },
  currentLevel: {
    type: DataTypes.ENUM("A2", "B1", "B2", "C1"),
    defaultValue: "B1"
  },
  targetLevel: {
    type: DataTypes.ENUM("A2", "B1", "B2", "C1"),
    defaultValue: "C1"
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "users",
  timestamps: true
});

// Hook avant sauvegarde : hasher le mot de passe et normaliser l'email
User.beforeSave(async (user) => {
  // Normaliser l'email en minuscules
  if (user.email) {
    user.email = user.email.toLowerCase().trim();
  }
  
  // Hasher le mot de passe si modifié
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Méthode pour comparer les mots de passe
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour masquer le mot de passe dans les réponses JSON
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.emailVerificationToken;
  delete values.passwordResetToken;
  return values;
};

module.exports = User;

