/**
 * Système de métriques Prometheus
 * @version 1.0.0
 * @date 2025-11-05
 * @description Collecte et exposition des métriques pour Prometheus
 */

const client = require("prom-client");
const os = require("os");

// Créer un registre de métriques
const register = new client.Registry();

// Ajouter les métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({
  register,
  prefix: "nodejs_",
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// ==================================
// MÉTRIQUES PERSONNALISÉES
// ==================================

// Métriques HTTP
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Durée des requêtes HTTP en secondes",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
});

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Nombre total de requêtes HTTP",
  labelNames: ["method", "route", "status_code"]
});

const httpRequestInProgress = new client.Gauge({
  name: "http_requests_in_progress",
  help: "Nombre de requêtes HTTP en cours",
  labelNames: ["method", "route"]
});

// Métriques de base de données
const dbQueryDuration = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "Durée des requêtes SQL en secondes",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2]
});

const dbQueryTotal = new client.Counter({
  name: "db_queries_total",
  help: "Nombre total de requêtes SQL",
  labelNames: ["operation", "table", "status"]
});

const dbConnectionsActive = new client.Gauge({
  name: "db_connections_active",
  help: "Nombre de connexions actives à la base de données"
});

const dbConnectionsTotal = new client.Counter({
  name: "db_connections_total",
  help: "Nombre total de connexions à la base de données",
  labelNames: ["status"]
});

// Métriques d'authentification
const authAttemptsTotal = new client.Counter({
  name: "auth_attempts_total",
  help: "Nombre total de tentatives d'authentification",
  labelNames: ["method", "status"]
});

const authTokensIssued = new client.Counter({
  name: "auth_tokens_issued_total",
  help: "Nombre total de tokens JWT émis",
  labelNames: ["type"]
});

// Métriques Firebase (pour les appels API côté frontend - trackés via middleware)
const firebaseApiCallsTotal = new client.Counter({
  name: "firebase_api_calls_total",
  help: "Nombre total d'appels API Firebase",
  labelNames: ["service", "operation", "status"]
});

const firebaseApiDuration = new client.Histogram({
  name: "firebase_api_duration_seconds",
  help: "Durée des appels API Firebase en secondes",
  labelNames: ["service", "operation"],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Métriques d'application
const activeUsers = new client.Gauge({
  name: "active_users_total",
  help: "Nombre d'utilisateurs actifs"
});

const exercisesCompleted = new client.Counter({
  name: "exercises_completed_total",
  help: "Nombre total d'exercices complétés",
  labelNames: ["type", "level"]
});

const errorsTotal = new client.Counter({
  name: "application_errors_total",
  help: "Nombre total d'erreurs applicatives",
  labelNames: ["type", "severity"]
});

// Métriques système
const systemMemoryUsage = new client.Gauge({
  name: "system_memory_usage_bytes",
  help: "Utilisation de la mémoire système en octets",
  labelNames: ["type"]
});

const systemCpuUsage = new client.Gauge({
  name: "system_cpu_usage_percent",
  help: "Utilisation du CPU en pourcentage"
});

const systemDiskUsage = new client.Gauge({
  name: "system_disk_usage_bytes",
  help: "Utilisation du disque en octets",
  labelNames: ["path"]
});

// Enregistrer toutes les métriques
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestInProgress);
register.registerMetric(dbQueryDuration);
register.registerMetric(dbQueryTotal);
register.registerMetric(dbConnectionsActive);
register.registerMetric(dbConnectionsTotal);
register.registerMetric(authAttemptsTotal);
register.registerMetric(authTokensIssued);
register.registerMetric(firebaseApiCallsTotal);
register.registerMetric(firebaseApiDuration);
register.registerMetric(activeUsers);
register.registerMetric(exercisesCompleted);
register.registerMetric(errorsTotal);
register.registerMetric(systemMemoryUsage);
register.registerMetric(systemCpuUsage);
register.registerMetric(systemDiskUsage);

// Fonction pour mettre à jour les métriques système
function updateSystemMetrics() {
  // Mémoire
  const memUsage = process.memoryUsage();
  systemMemoryUsage.set({ type: "rss" }, memUsage.rss);
  systemMemoryUsage.set({ type: "heapTotal" }, memUsage.heapTotal);
  systemMemoryUsage.set({ type: "heapUsed" }, memUsage.heapUsed);
  systemMemoryUsage.set({ type: "external" }, memUsage.external);

  // CPU (approximation simple)
  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return acc + (1 - idle / total);
  }, 0) / cpus.length * 100;
  systemCpuUsage.set(cpuUsage);
}

// Mettre à jour les métriques système toutes les 10 secondes
setInterval(updateSystemMetrics, 10000);
updateSystemMetrics(); // Initialiser immédiatement

// Middleware Express pour capturer les métriques HTTP
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  const route = req.route ? req.route.path : req.path;

  // Incrémenter les requêtes en cours
  httpRequestInProgress.inc({ method: req.method, route });

  // Capturer la fin de la requête
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode;

    // Enregistrer les métriques
    httpRequestDuration.observe(
      { method: req.method, route, status_code: statusCode },
      duration
    );
    httpRequestTotal.inc({ method: req.method, route, status_code: statusCode });
    httpRequestInProgress.dec({ method: req.method, route });
  });

  next();
}

// Fonction pour obtenir les métriques au format Prometheus
async function getMetrics() {
  return await register.metrics();
}

module.exports = {
  register,
  metrics: {
    http: {
      duration: httpRequestDuration,
      total: httpRequestTotal,
      inProgress: httpRequestInProgress
    },
    db: {
      queryDuration: dbQueryDuration,
      queryTotal: dbQueryTotal,
      connectionsActive: dbConnectionsActive,
      connectionsTotal: dbConnectionsTotal
    },
    auth: {
      attemptsTotal: authAttemptsTotal,
      tokensIssued: authTokensIssued
    },
    firebase: {
      apiCallsTotal: firebaseApiCallsTotal,
      apiDuration: firebaseApiDuration
    },
    app: {
      activeUsers,
      exercisesCompleted,
      errorsTotal
    },
    system: {
      memoryUsage: systemMemoryUsage,
      cpuUsage: systemCpuUsage,
      diskUsage: systemDiskUsage
    }
  },
  middleware: metricsMiddleware,
  getMetrics
};




