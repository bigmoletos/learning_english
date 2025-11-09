/**
 * Script de vérification des ports et configuration
 * @version 1.0.0
 * @date 2025-11-08
 */

const http = require('http');
const https = require('https');

const PORTS = {
  frontend: 3000,
  backend: 5010
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function checkPort(port, name) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve({ port, name, status: 'running', code: res.statusCode });
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        resolve({ port, name, status: 'not_running', error: 'Connection refused' });
      } else {
        resolve({ port, name, status: 'error', error: err.message });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ port, name, status: 'timeout', error: 'Request timeout' });
    });

    req.end();
  });
}

async function checkHealth(port, name) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ port, name, health: json, status: 'healthy' });
        } catch {
          resolve({ port, name, health: data, status: 'healthy' });
        }
      });
    });

    req.on('error', () => {
      resolve({ port, name, status: 'no_health_endpoint' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ port, name, status: 'timeout' });
    });

    req.end();
  });
}

async function main() {
  console.log(`${COLORS.blue}=== Vérification des ports et services ===${COLORS.reset}\n`);

  // Vérifier le frontend
  console.log(`${COLORS.yellow}Vérification du frontend (port ${PORTS.frontend})...${COLORS.reset}`);
  const frontendCheck = await checkPort(PORTS.frontend, 'Frontend');
  if (frontendCheck.status === 'running') {
    console.log(`${COLORS.green}✅ Frontend: En cours d'exécution sur le port ${PORTS.frontend}${COLORS.reset}`);
  } else {
    console.log(`${COLORS.red}❌ Frontend: Non accessible sur le port ${PORTS.frontend}${COLORS.reset}`);
    console.log(`   ${frontendCheck.error || 'Service non démarré'}`);
  }

  console.log('');

  // Vérifier le backend
  console.log(`${COLORS.yellow}Vérification du backend (port ${PORTS.backend})...${COLORS.reset}`);
  const backendCheck = await checkPort(PORTS.backend, 'Backend');
  if (backendCheck.status === 'running') {
    console.log(`${COLORS.green}✅ Backend: En cours d'exécution sur le port ${PORTS.backend}${COLORS.reset}`);

    // Vérifier le health endpoint
    const healthCheck = await checkHealth(PORTS.backend, 'Backend');
    if (healthCheck.status === 'healthy') {
      console.log(`${COLORS.green}✅ Backend Health: OK${COLORS.reset}`);
      if (healthCheck.health) {
        console.log(`   ${JSON.stringify(healthCheck.health, null, 2)}`);
      }
    }
  } else {
    console.log(`${COLORS.yellow}⚠️  Backend: Non accessible sur le port ${PORTS.backend}${COLORS.reset}`);
    console.log(`   ${backendCheck.error || 'Service non démarré'}`);
    console.log(`   ${COLORS.yellow}Note: Le backend est optionnel si vous utilisez Firebase Auth uniquement${COLORS.reset}`);
  }

  console.log('');

  // Résumé
  console.log(`${COLORS.blue}=== Résumé ===${COLORS.reset}`);
  console.log(`Frontend (React): ${frontendCheck.status === 'running' ? `${COLORS.green}✅ OK${COLORS.reset}` : `${COLORS.red}❌ Non démarré${COLORS.reset}`}`);
  console.log(`Backend (Node.js): ${backendCheck.status === 'running' ? `${COLORS.green}✅ OK${COLORS.reset}` : `${COLORS.yellow}⚠️  Optionnel${COLORS.reset}`}`);
  console.log('');
  console.log(`${COLORS.blue}Configuration attendue:${COLORS.reset}`);
  console.log(`  - Frontend: http://localhost:${PORTS.frontend}`);
  console.log(`  - Backend:  http://localhost:${PORTS.backend} (optionnel avec Firebase Auth)`);
  console.log('');
}

main().catch(console.error);

