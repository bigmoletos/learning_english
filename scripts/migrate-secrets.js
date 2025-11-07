/**
 * Script de migration des secrets depuis .env_old vers Infisical
 * Usage: node migrate-secrets.js [options]
 *
 * Options:
 *   --project=PROJECT    Nom du projet Infisical (défaut: tech4elles)
 *   --env=ENV           Environnement (development, staging, production)
 *   --dry-run           Simulation sans modification
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const ENV_FILE = path.join(__dirname, "..", ".env_old");
const DEFAULT_PROJECT = "tech4elles";
const DEFAULT_ENV = "development";

// Parse des arguments
const args = process.argv.slice(2);
const options = {
  project: DEFAULT_PROJECT,
  env: DEFAULT_ENV,
  dryRun: false,
};

args.forEach((arg) => {
  if (arg.startsWith("--project=")) {
    options.project = arg.split("=")[1];
  } else if (arg.startsWith("--env=")) {
    options.env = arg.split("=")[1];
  } else if (arg === "--dry-run") {
    options.dryRun = true;
  }
});

// Catégories de secrets
const SECRET_CATEGORIES = {
  database: {
    pattern: /^(POSTGRES_|MYSQL_|DB_|DATABASE_)/i,
    description: "Base de données",
  },
  auth: {
    pattern: /^(JWT_|SESSION_|AUTH_|LOGIN_)/i,
    description: "Authentification",
  },
  firebase: {
    pattern: /^FIREBASE_/i,
    description: "Firebase",
  },
  smtp: {
    pattern: /^SMTP_/i,
    description: "SMTP/Email",
  },
  api: {
    pattern: /^(APP_KEY|API_KEY|PORT|HOST)/i,
    description: "API/Application",
  },
  hosting: {
    pattern: /^(KABIA_|SERVER_|DEPLOY_)/i,
    description: "Hébergement/Déploiement",
  },
  other: {
    pattern: /.*/,
    description: "Autres",
  },
};

// Fonction pour parser le fichier .env
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const secrets = {};
  const lines = content.split("\n");

  let currentCategory = "other";
  let inMultiline = false;
  let multilineKey = null;
  let multilineValue = [];

  lines.forEach((line, index) => {
    // Ignorer les commentaires et lignes vides
    if (line.trim().startsWith("#") || line.trim() === "") {
      return;
    }

    // Détection de clés multilignes (comme FIREBASE_PRIVATE_KEY)
    if (line.includes('="-----BEGIN') || line.includes("-----BEGIN")) {
      inMultiline = true;
      const match = line.match(/^([A-Z_]+)=/);
      if (match) {
        multilineKey = match[1];
        multilineValue = [line];
      }
      return;
    }

    if (inMultiline) {
      multilineValue.push(line);
      if (line.includes("-----END")) {
        secrets[multilineKey] = multilineValue.join("\n");
        inMultiline = false;
        multilineKey = null;
        multilineValue = [];
      }
      return;
    }

    // Parser ligne normale KEY=VALUE
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2];

      // Retirer les guillemets
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      secrets[key] = value;

      // Catégoriser
      for (const [category, config] of Object.entries(SECRET_CATEGORIES)) {
        if (config.pattern.test(key)) {
          currentCategory = category;
          break;
        }
      }
    }
  });

  return secrets;
}

// Fonction pour exécuter une commande Infisical
function runInfisicalCommand(command) {
  try {
    if (options.dryRun) {
      console.log(`[DRY-RUN] ${command}`);
      return { success: true, output: "[simulation]" };
    }
    const output = execSync(command, { encoding: "utf-8" });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || error.stderr,
    };
  }
}

// Fonction pour migrer un secret
function migrateSecret(key, value, category) {
  const command = `infisical secrets set ${key} "${value.replace(
    /"/g,
    '\\"'
  )}" --project=${options.project} --env=${options.env}`;

  const result = runInfisicalCommand(command);

  if (result.success) {
    console.log(`  ✅ ${key} (${SECRET_CATEGORIES[category].description})`);
    return true;
  } else {
    console.error(`  ❌ ${key}: ${result.error}`);
    return false;
  }
}

// Fonction principale
function main() {
  console.log("🔐 Migration des secrets vers Infisical");
  console.log("========================================");
  console.log("");
  console.log(`Projet: ${options.project}`);
  console.log(`Environnement: ${options.env}`);
  console.log(`Mode: ${options.dryRun ? "Simulation (dry-run)" : "Réel"}`);
  console.log("");

  // Vérifier que le fichier .env_old existe
  if (!fs.existsSync(ENV_FILE)) {
    console.error(`❌ Fichier .env_old introuvable: ${ENV_FILE}`);
    process.exit(1);
  }

  // Vérifier que Infisical CLI est installé
  try {
    execSync("infisical --version", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ Infisical CLI non installé ou non dans le PATH");
    console.error("   Installez-le avec: ./scripts/setup-cli.sh ou setup-cli.ps1");
    process.exit(1);
  }

  // Parser le fichier .env
  console.log("📖 Lecture du fichier .env_old...");
  const secrets = parseEnvFile(ENV_FILE);
  console.log(`✅ ${Object.keys(secrets).length} secrets trouvés`);
  console.log("");

  // Grouper par catégorie
  const secretsByCategory = {};
  Object.entries(secrets).forEach(([key, value]) => {
    let category = "other";
    for (const [cat, config] of Object.entries(SECRET_CATEGORIES)) {
      if (config.pattern.test(key)) {
        category = cat;
        break;
      }
    }
    if (!secretsByCategory[category]) {
      secretsByCategory[category] = [];
    }
    secretsByCategory[category].push({ key, value });
  });

  // Afficher le résumé
  console.log("📊 Résumé par catégorie:");
  Object.entries(secretsByCategory).forEach(([category, items]) => {
    console.log(
      `  ${SECRET_CATEGORIES[category].description}: ${items.length} secrets`
    );
  });
  console.log("");

  // Demander confirmation
  if (!options.dryRun) {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "⚠️  Continuer la migration ? (o/n): ",
      (answer) => {
        if (answer.toLowerCase() !== "o") {
          console.log("Migration annulée.");
          rl.close();
          process.exit(0);
        }

        rl.close();
        performMigration(secretsByCategory);
      }
    );
  } else {
    performMigration(secretsByCategory);
  }
}

// Fonction pour effectuer la migration
function performMigration(secretsByCategory) {
  console.log("");
  console.log("🚀 Début de la migration...");
  console.log("");

  let successCount = 0;
  let errorCount = 0;

  Object.entries(secretsByCategory).forEach(([category, items]) => {
    console.log(
      `📦 ${SECRET_CATEGORIES[category].description} (${items.length} secrets):`
    );

    items.forEach(({ key, value }) => {
      if (migrateSecret(key, value, category)) {
        successCount++;
      } else {
        errorCount++;
      }
    });
    console.log("");
  });

  // Résumé final
  console.log("========================================");
  console.log("📊 Résumé de la migration:");
  console.log(`  ✅ Succès: ${successCount}`);
  console.log(`  ❌ Erreurs: ${errorCount}`);
  console.log(`  📦 Total: ${successCount + errorCount}`);
  console.log("");

  if (errorCount === 0) {
    console.log("✅ Migration terminée avec succès !");
  } else {
    console.log("⚠️  Migration terminée avec des erreurs.");
    console.log("   Vérifiez les erreurs ci-dessus.");
  }
}

// Exécuter
main();

