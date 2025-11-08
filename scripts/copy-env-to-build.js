/**
 * Script pour générer le fichier de configuration Firebase avant le build
 * Ce script est exécuté AVANT le build React pour inclure les credentials
 * @version 1.0.0
 * @date 07-11-2025
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ''
};

// Générer le fichier TypeScript
const configContent = `/**
 * Configuration Firebase générée automatiquement
 * ⚠️ NE PAS MODIFIER CE FICHIER MANUELLEMENT
 * Il est généré par scripts/copy-env-to-build.js
 */

export const firebaseConfigGenerated = ${JSON.stringify(firebaseConfig, null, 2)};
`;

// Écrire dans src/services/firebase/
const configPath = path.join(__dirname, '..', 'src', 'services', 'firebase', 'firebaseConfig.generated.ts');
fs.writeFileSync(configPath, configContent);

console.log('✅ Configuration Firebase générée dans src/services/firebase/firebaseConfig.generated.ts');

