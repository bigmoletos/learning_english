/**
 * Script d'intégration des métriques Firebase
 * @version 1.0.0
 * @date 2025-11-05
 * @description Middleware pour capturer les métriques Firebase côté backend
 */

const metrics = require("../utils/metrics");

/**
 * Middleware pour capturer les métriques Firebase
 * Utilisez ce middleware dans vos routes qui interagissent avec Firebase
 */
function firebaseMetricsMiddleware(req, res, next) {
  const start = Date.now();

  // Capturer la fin de la requête
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const service = req.firebaseService || "unknown";
    const operation = req.firebaseOperation || "unknown";
    const status = res.statusCode >= 400 ? "error" : "success";

    // Enregistrer les métriques
    metrics.metrics.firebase.apiCallsTotal.inc({
      service,
      operation,
      status
    });
    metrics.metrics.firebase.apiDuration.observe(
      { service, operation },
      duration
    );
  });

  next();
}

/**
 * Fonction helper pour tracker les appels Firebase
 * @param {string} service - Service Firebase (firestore, auth, storage)
 * @param {string} operation - Opération (read, write, delete, etc.)
 * @param {Promise} promise - Promise de l'opération Firebase
 */
async function trackFirebaseCall(service, operation, promise) {
  const start = Date.now();
  try {
    const result = await promise;
    const duration = (Date.now() - start) / 1000;

    metrics.metrics.firebase.apiCallsTotal.inc({
      service,
      operation,
      status: "success"
    });
    metrics.metrics.firebase.apiDuration.observe(
      { service, operation },
      duration
    );

    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;

    metrics.metrics.firebase.apiCallsTotal.inc({
      service,
      operation,
      status: "error"
    });
    metrics.metrics.firebase.apiDuration.observe(
      { service, operation },
      duration
    );

    throw error;
  }
}

module.exports = {
  firebaseMetricsMiddleware,
  trackFirebaseCall
};




