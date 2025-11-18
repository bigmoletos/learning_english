/**
 * Script de test d'envoi d'emails
 * AI English Trainer - Version 1.0.0
 * 
 * Usage: node scripts/testEmail.js [email]
 * 
 * Exemples:
 *   node scripts/testEmail.js test@example.com
 *   node scripts/testEmail.js
 */

const path = require("path");
const fs = require("fs");

// Trouver le fichier .env (chercher depuis le répertoire actuel jusqu'à la racine)
let envPath = null;
let currentDir = __dirname;

while (currentDir !== path.dirname(currentDir)) {
  const potentialEnv = path.join(currentDir, ".env");
  if (fs.existsSync(potentialEnv)) {
    envPath = potentialEnv;
    break;
  }
  currentDir = path.dirname(currentDir);
}

// Si .env trouvé, le charger
if (envPath) {
  require("dotenv").config({ path: envPath });
} else {
  // Fallback : essayer depuis le répertoire parent du script
  const fallbackPath = path.resolve(__dirname, "../../.env");
  if (fs.existsSync(fallbackPath)) {
    require("dotenv").config({ path: fallbackPath });
  } else {
    // Dernière tentative : charger depuis le répertoire courant
    require("dotenv").config();
  }
}

const nodemailer = require("nodemailer");

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Vérifier la configuration
async function testConnection() {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  📧 Test de Configuration Email");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  
  // Vérifier les variables d'environnement
  const passwordLength = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 0;
  console.log("📋 Configuration SMTP:");
  console.log(`   Host: ${process.env.SMTP_HOST || "smtp.gmail.com"}`);
  console.log(`   Port: ${process.env.SMTP_PORT || 587}`);
  console.log(`   User: ${process.env.SMTP_USER || "NON DÉFINI"}`);
  if (process.env.SMTP_PASSWORD) {
    console.log(`   Password: ***défini*** (${passwordLength} caractères)`);
    if (passwordLength !== 16) {
      console.log("   ⚠️  ATTENTION: Un App Password Gmail doit avoir exactement 16 caractères");
      console.log("   Format attendu: xxxx xxxx xxxx xxxx (sans espaces = 16 caractères)");
      console.log(`   Votre mot de passe a ${passwordLength} caractères`);
    }
  } else {
    console.log("   Password: NON DÉFINI");
  }
  console.log(`   From: ${process.env.EMAIL_FROM || "NON DÉFINI"}`);
  console.log("");
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("❌ ERREUR: SMTP_USER ou SMTP_PASSWORD non défini dans .env");
    console.log("");
    console.log("💡 Pour configurer Gmail:");
    console.log("   1. Activez la validation en 2 étapes sur votre compte Google");
    console.log("   2. Allez dans Paramètres → Mots de passe d'application");
    console.log("   3. Créez un mot de passe pour \"Application personnalisée\"");
    console.log("   4. Ajoutez dans .env:");
    console.log("      SMTP_USER=votre-email@gmail.com");
    console.log("      SMTP_PASSWORD=le-mot-de-passe-d-application");
    console.log("");
    process.exit(1);
  }
  
  // Tester la connexion
  console.log("🔌 Test de connexion au serveur SMTP...");
  try {
    await transporter.verify();
    console.log("✅ Connexion SMTP réussie !");
    console.log("");
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion SMTP:");
    console.error(`   ${error.message}`);
    console.log("");
    
    if (error.code === "EAUTH" || error.message.includes("Application-specific password")) {
      console.log("💡 Problème d'authentification:");
      console.log("   • Gmail nécessite un \"App Password\" (pas votre mot de passe normal)");
      console.log("   • Guide disponible: backend/scripts/createGmailAppPassword.md");
      console.log("   • Lien direct: https://myaccount.google.com/apppasswords");
      console.log("");
      console.log("📋 Étapes rapides:");
      console.log("   1. Activez la validation en 2 étapes (si pas déjà fait)");
      console.log("   2. Allez sur: https://myaccount.google.com/apppasswords");
      console.log("   3. Créez un App Password pour \"Application personnalisée\"");
      console.log("   4. Nommez-le: \"AI English Trainer\"");
      console.log("   5. Copiez le mot de passe (16 caractères)");
      console.log("   6. Remplacez SMTP_PASSWORD dans .env");
      console.log("");
    } else if (error.code === "ECONNREFUSED") {
      console.log("💡 Problème de connexion:");
      console.log("   • Vérifiez SMTP_HOST et SMTP_PORT");
      console.log("   • Vérifiez votre connexion internet");
    }
    console.log("");
    return false;
  }
}

// Envoyer un email de test
async function sendTestEmail(email) {
  const testEmail = email || process.env.SMTP_USER;
  
  if (!testEmail) {
    console.error("❌ ERREUR: Aucun email fourni");
    console.log("");
    console.log("Usage: node scripts/testEmail.js [email]");
    console.log("   Exemple: node scripts/testEmail.js test@example.com");
    console.log("");
    process.exit(1);
  }
  
  console.log("📤 Envoi d'un email de test...");
  console.log(`   Destinataire: ${testEmail}`);
  console.log("");
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "AI English Trainer"}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: testEmail,
    subject: "Test Email - AI English Trainer",
    text: `
Bonjour,

Ceci est un email de test depuis AI English Trainer.

Si vous recevez ce message, cela signifie que la configuration email fonctionne correctement.

Configuration:
- Serveur SMTP: ${process.env.SMTP_HOST || "smtp.gmail.com"}
- Port: ${process.env.SMTP_PORT || 587}
- Date: ${new Date().toLocaleString("fr-FR")}

Bonne journée !
AI English Trainer
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Test Email - AI English Trainer</h1>
    </div>
    <div class="content">
      <h2>Bonjour,</h2>
      <p>Ceci est un email de test depuis AI English Trainer.</p>
      <p><strong>Si vous recevez ce message, cela signifie que la configuration email fonctionne correctement.</strong></p>
      
      <h3>Configuration:</h3>
      <ul>
        <li>Serveur SMTP: ${process.env.SMTP_HOST || "smtp.gmail.com"}</li>
        <li>Port: ${process.env.SMTP_PORT || 587}</li>
        <li>Date: ${new Date().toLocaleString("fr-FR")}</li>
      </ul>
    </div>
    <div class="footer">
      <p>AI English Trainer - Système d'envoi d'emails opérationnel</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec succès !");
    console.log("");
    console.log("📊 Informations d'envoi:");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log("");
    console.log("✅ Configuration email opérationnelle !");
    console.log("");
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:");
    console.error(`   ${error.message}`);
    console.log("");
    
    if (error.code === "EAUTH") {
      console.log("💡 Problème d'authentification:");
      console.log("   • Vérifiez vos identifiants dans .env");
      console.log("   • Pour Gmail: utilisez un \"App Password\"");
    } else if (error.code === "EENVELOPE") {
      console.log("💡 Problème avec l'adresse email:");
      console.log("   • Vérifiez que l'adresse email est valide");
    }
    console.log("");
    return false;
  }
}

// Fonction principale
async function main() {
  const email = process.argv[2];
  
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  📧 Test d'Envoi d'Emails - AI English Trainer");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  
  // Test de connexion
  const connectionOk = await testConnection();
  if (!connectionOk) {
    process.exit(1);
  }
  
  // Envoi d'email de test
  const emailSent = await sendTestEmail(email);
  if (!emailSent) {
    process.exit(1);
  }
  
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  ✅ TOUS LES TESTS SONT RÉUSSIS !");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("💡 Le système d'envoi d'emails est prêt pour:");
  console.log("   • Vérification d'email lors de l'inscription");
  console.log("   • Réinitialisation de mot de passe");
  console.log("   • Emails de bienvenue");
  console.log("");
}

// Exécuter
main().catch(error => {
  console.error("Erreur fatale:", error);
  process.exit(1);
});

