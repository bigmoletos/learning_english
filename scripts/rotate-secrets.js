/**
 * Script de rotation automatique des secrets
 * Usage: node rotate-secrets.js [options]
 *
 * Options:
 *   --project=PROJECT    Nom du projet Infisical
 *   --env=ENV           Environnement
 *   --key=KEY           Clé spécifique à faire tourner
 */

const { execSync } = require("child_process");
const crypto = require("crypto");

// Configuration
const DEFAULT_PROJECT = "tech4elles";
const DEFAULT_ENV = "production";

// Parse des arguments
const args = process.argv.slice(2);
const options = {
  project: DEFAULT_PROJECT,
  env: DEFAULT_ENV,
  key: null,
};

args.forEach((arg) => {
  if (arg.startsWith("--project=")) {
    options.project = arg.split("=")[1];
  } else if (arg.startsWith("--env=")) {
    options.env = arg.split("=")[1];
  } else if (arg.startsWith("--key=")) {
    options.key = arg.split("=")[1];
  }
});

// Fonction pour générer un secret aléatoire
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString("base64");
}

// Fonction pour générer un secret hexadécimal
function generateHexSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

// Fonction pour faire tourner un secret
function rotateSecret(key, project, env) {
  console.log(`🔄 Rotation de ${key}...`);

  // Générer un nouveau secret selon le type
  let newSecret;
  if (key.includes("JWT") || key.includes("SECRET")) {
    newSecret = generateHexSecret(64);
  } else if (key.includes("PASSWORD")) {
    newSecret = generateSecret(32);
  } else {
    newSecret = generateSecret(32);
  }

  // Mettre à jour dans Infisical
  try {
    const command = `infisical secrets set ${key} "${newSecret}" --project=${project} --env=${env}`;
    execSync(command, { stdio: "inherit" });
    console.log(`  ✅ ${key} mis à jour`);
    return true;
  } catch (error) {
    console.error(`  ❌ Erreur lors de la mise à jour de ${key}: ${error.message}`);
    return false;
  }
}

// Fonction principale
function main() {
  console.log("🔄 Rotation des secrets Infisical");
  console.log("===================================");
  console.log("");
  console.log(`Projet: ${options.project}`);
  console.log(`Environnement: ${options.env}`);
  console.log("");

  // Vérifier que Infisical CLI est installé
  try {
    execSync("infisical --version", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ Infisical CLI non installé ou non dans le PATH");
    process.exit(1);
  }

  if (options.key) {
    // Rotation d'une clé spécifique
    rotateSecret(options.key, options.project, options.env);
  } else {
    // Liste des clés à faire tourner régulièrement
    const keysToRotate = [
      "JWT_SECRET",
      "JWT_REFRESH_SECRET",
      "JWT_AUTH_SECRET",
      "SESSION_SECRET",
      "APP_KEY",
      "ENCRYPTION_KEY",
    ];

    console.log("📋 Clés à faire tourner:");
    keysToRotate.forEach((key) => console.log(`  - ${key}`));
    console.log("");

    // Demander confirmation
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "⚠️  Continuer la rotation de toutes ces clés ? (o/n): ",
      (answer) => {
        if (answer.toLowerCase() !== "o") {
          console.log("Rotation annulée.");
          rl.close();
          process.exit(0);
        }

        rl.close();

        let successCount = 0;
        let errorCount = 0;

        keysToRotate.forEach((key) => {
          if (rotateSecret(key, options.project, options.env)) {
            successCount++;
          } else {
            errorCount++;
          }
        });

        console.log("");
        console.log("========================================");
        console.log("📊 Résumé de la rotation:");
        console.log(`  ✅ Succès: ${successCount}`);
        console.log(`  ❌ Erreurs: ${errorCount}`);
        console.log("");

        if (errorCount === 0) {
          console.log("✅ Rotation terminée avec succès !");
          console.log("⚠️  IMPORTANT: Mettez à jour vos applications avec les nouveaux secrets.");
        } else {
          console.log("⚠️  Rotation terminée avec des erreurs.");
        }
      }
    );
  }
}

// Exécuter
main();

