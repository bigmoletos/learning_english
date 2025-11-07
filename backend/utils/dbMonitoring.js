/**
 * Middleware de monitoring pour Sequelize
 * @version 1.0.0
 * @date 2025-11-05
 * @description Capture les métriques de base de données
 */

const metrics = require("./metrics");

// Hook Sequelize pour capturer les métriques
function setupSequelizeMetrics(sequelize) {
  const { metrics: m } = metrics;

  // Avant chaque requête
  sequelize.addHook("beforeQuery", (options) => {
    options._metricsStartTime = Date.now();
  });

  // Après chaque requête
  sequelize.addHook("afterQuery", (options, query) => {
    const duration = (Date.now() - options._metricsStartTime) / 1000;
    const operation = options.type || "unknown";
    const table = options.model?.tableName || options.table || "unknown";

    m.db.queryDuration.observe({ operation, table }, duration);
    m.db.queryTotal.inc({ operation, table, status: "success" });
  });

  // Gestion des erreurs
  sequelize.addHook("afterQuery", (options, query) => {
    if (query && query.error) {
      const operation = options.type || "unknown";
      const table = options.model?.tableName || options.table || "unknown";
      m.db.queryTotal.inc({ operation, table, status: "error" });
    }
  });

  // Monitoring des connexions
  sequelize.addHook("beforeConnect", () => {
    m.db.connectionsActive.inc();
    m.db.connectionsTotal.inc({ status: "opening" });
  });

  sequelize.addHook("afterConnect", () => {
    m.db.connectionsTotal.inc({ status: "opened" });
  });

  sequelize.addHook("afterDisconnect", () => {
    m.db.connectionsActive.dec();
    m.db.connectionsTotal.inc({ status: "closed" });
  });
}

module.exports = setupSequelizeMetrics;




