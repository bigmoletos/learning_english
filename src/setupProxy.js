/**
 * Configuration du proxy pour React en développement
 * Redirige les requêtes /api/* vers le backend sur http://localhost:5010
 */

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5010",
      changeOrigin: true,
      logLevel: "debug",
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> http://localhost:5010${req.url}`);
      },
      onError: (err, req, res) => {
        console.error("[Proxy] Erreur:", err.message);
        res.status(500).json({ error: "Erreur de proxy", message: err.message });
      },
    })
  );
};
