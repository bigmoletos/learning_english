/**
 * Firebase Functions - AI English Trainer Backend
 * @version 1.0.0
 * @date 2025-11-27
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialiser Firebase Admin
admin.initializeApp();

// Créer l'app Express
const app = express();

// CORS - Autoriser Cloudflare Pages et GitHub Pages
app.use(
  cors({
    origin: [
      "https://learning-english.iaproject.fr",
      "https://learning-english-b7d.pages.dev",
      "https://bigmoletos.github.io",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "firebase-functions",
    project: "ia-project-91c03",
  });
});

// Importer et utiliser les routes existantes
// ⚠️ TEMPORAIRE : Routes SQLite commentées (à adapter pour Firestore)
try {
  // Routes qui utilisent SQLite (à adapter pour Firestore plus tard)
  // app.use("/api/auth", require("./routes/auth")); // ❌ Utilise Sequelize/SQLite
  // app.use("/api/exercises", require("./routes/exercises")); // ❌ Utilise Sequelize/SQLite
  // app.use("/api/progress", require("./routes/progress")); // ❌ Utilise Sequelize/SQLite
  // app.use("/api/speaking-agent", require("./routes/speakingAgent")); // ❌ Utilise Sequelize/SQLite
  // app.use("/api/conversation", require("./routes/conversation")); // ❌ Utilise Sequelize/SQLite

  // Routes qui fonctionnent sans SQLite (utilisent des services externes)
  // Note: Pas de préfixe /api car l'URL Firebase Functions se termine déjà par /api
  app.use("/text-to-speech", require("./routes/textToSpeech")); // ✅ Google Cloud TTS
  app.use("/speech-to-text", require("./routes/speechToText")); // ✅ Web Speech API
} catch (error) {
  console.error("Erreur chargement des routes:", error);
}

// Exporter comme Cloud Function
exports.api = functions
  .region("europe-west1") // Région européenne
  .runWith({
    timeoutSeconds: 60, // Timeout max gratuit
    memory: "256MB", // Mémoire max gratuit
  })
  .https.onRequest(app);

