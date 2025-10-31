/**
 * Script pour vérifier un utilisateur dans la base de données
 * Usage: node scripts/checkUser.js [email]
 * Exemple: node scripts/checkUser.js desmedtfranck@gmail.com
 */

const path = require('path');
const fs = require('fs');

// Trouver et charger le .env
let envPath = path.resolve(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(__dirname, '../.env');
}
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const User = require('../models/User');
const sequelize = require('../database/connection');

async function checkUser(email) {
  try {
    await sequelize.authenticate();
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🔍 Vérification Utilisateur - AI English Trainer');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    if (email) {
      // Chercher un utilisateur spécifique
      const user = await User.findOne({ 
        where: { email: email.toLowerCase().trim() },
        attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'currentLevel', 'targetLevel', 'isEmailVerified', 'createdAt', 'updatedAt', 'lastLogin', 'isActive']
      });
      
      if (user) {
        console.log('✅ Utilisateur trouvé :');
        console.log(JSON.stringify(user.toJSON(), null, 2));
      } else {
        console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      }
    } else {
      // Lister tous les utilisateurs
      const users = await User.findAll({ 
        attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'currentLevel', 'targetLevel', 'isEmailVerified', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`📊 Total d'utilisateurs: ${users.length}`);
      console.log('');
      
      if (users.length > 0) {
        console.log('Liste des utilisateurs:');
        users.forEach((user, index) => {
          console.log(`\n${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Rôle: ${user.role}`);
          console.log(`   Niveau actuel: ${user.currentLevel}`);
          console.log(`   Niveau cible: ${user.targetLevel}`);
          console.log(`   Email vérifié: ${user.isEmailVerified ? '✅ Oui' : '❌ Non'}`);
          console.log(`   Créé le: ${user.createdAt.toLocaleString('fr-FR')}`);
        });
      } else {
        console.log('Aucun utilisateur dans la base de données.');
      }
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
checkUser(email);

