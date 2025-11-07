/**
 * Script de seeding - Créer le compte administrateur
 * @version 1.0.0
 */

require('dotenv').config({ path: '../.env' });
const sequelize = require('./connection');
const User = require('../models/User');

async function seed() {
  try {
    console.log('🌱 Démarrage du seeding...');

    // Synchroniser la base de données
    await sequelize.sync({ force: false });

    // Vérifier si l'admin existe déjà
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learning-english.local';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('⚠️  Compte administrateur déjà existant');
      console.log(`   Email: ${adminEmail}`);
      return;
    }

    // Créer l'admin
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD non défini dans .env');
      console.error('   Ajoutez : ADMIN_PASSWORD=VotreMotDePasse123!');
      process.exit(1);
    }

    const admin = await User.create({
      email: adminEmail,
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      currentLevel: 'C1',
      targetLevel: 'C1'
    });

    console.log('✅ Compte administrateur créé avec succès !');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe: (défini dans .env)');
    console.log('👤 Rôle: admin');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('Vous pouvez maintenant vous connecter avec ces identifiants.');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();

