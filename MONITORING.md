# Système de Monitoring - AI English Trainer

**Version** : 1.0.0 | **Date** : 2025-11-05

---

## 📊 Vue d'ensemble

Le système de monitoring comprend :
- **Logging structuré** avec Winston (rotation des fichiers)
- **Métriques Prometheus** (application, base de données, système)
- **Visualisation Grafana** (dashboards personnalisés)
- **Alertes par email** via Alertmanager
- **Monitoring Firebase** (appels API)

---

## 🚀 Installation

### Prérequis

- Docker et Docker Compose installés
- Node.js >= 18.0.0
- Backend démarré sur le port 5010

### Étapes d'installation

1. **Installer les dépendances du backend**

```bash
cd backend
npm install
```

2. **Configurer les variables d'environnement**

Ajoutez dans votre fichier `.env` à la racine du projet :

```env
# Monitoring
LOG_LEVEL=info
ALERT_EMAIL_TO=votre-email@example.com
ALERT_EMAIL_FROM=alerts@learning-english.local

# Grafana (optionnel - valeurs par défaut)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

3. **Démarrer les services de monitoring**

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

4. **Vérifier que tout fonctionne**

- Prometheus : http://localhost:9090
- Grafana : http://localhost:3001 (admin/admin)
- Alertmanager : http://localhost:9093

---

## 📝 Logging avec Winston

### Configuration

Le système de logging est configuré dans `backend/utils/logger.js`. Les logs sont écrits dans :
- `logs/combined.log` : Tous les logs (niveau info et supérieur)
- `logs/error.log` : Erreurs uniquement
- `logs/access.log` : Logs d'accès HTTP

### Utilisation

```javascript
const logger = require('./utils/logger');

// Logs de base
logger.info('Message informatif', { userId: 123, action: 'login' });
logger.error('Erreur détectée', { error: err.message, stack: err.stack });

// Logs spécialisés
logger.http('Requête HTTP', { method: 'GET', path: '/api/users' });
logger.db('Requête SQL', { query: 'SELECT * FROM users' });
logger.metrics('Métrique enregistrée', { metric: 'active_users', value: 42 });
logger.alert('Alerte déclenchée', { severity: 'critical', type: 'database' });
```

### Rotation des fichiers

Les fichiers de logs sont automatiquement rotés :
- Taille max : 5MB par fichier
- Nombre max de fichiers : 5-10 selon le type
- Format : JSON structuré pour faciliter l'analyse

---

## 📈 Métriques Prometheus

### Endpoint des métriques

Les métriques sont exposées sur : `http://localhost:5010/metrics`

### Métriques disponibles

#### Métriques HTTP
- `http_request_duration_seconds` : Durée des requêtes HTTP
- `http_requests_total` : Nombre total de requêtes
- `http_requests_in_progress` : Requêtes en cours

#### Métriques Base de données
- `db_query_duration_seconds` : Durée des requêtes SQL
- `db_queries_total` : Nombre total de requêtes SQL
- `db_connections_active` : Connexions actives
- `db_connections_total` : Total de connexions

#### Métriques Authentification
- `auth_attempts_total` : Tentatives d'authentification
- `auth_tokens_issued_total` : Tokens JWT émis

#### Métriques Firebase
- `firebase_api_calls_total` : Appels API Firebase
- `firebase_api_duration_seconds` : Durée des appels Firebase

#### Métriques Application
- `active_users_total` : Utilisateurs actifs
- `exercises_completed_total` : Exercices complétés
- `application_errors_total` : Erreurs applicatives

#### Métriques Système
- `system_memory_usage_bytes` : Utilisation mémoire
- `system_cpu_usage_percent` : Utilisation CPU
- `system_disk_usage_bytes` : Utilisation disque

### Utilisation dans le code

```javascript
const metrics = require('./utils/metrics');

// Incrémenter un compteur
metrics.metrics.app.exercisesCompleted.inc({ type: 'qcm', level: 'B2' });

// Enregistrer une durée
metrics.metrics.db.queryDuration.observe({ operation: 'SELECT', table: 'users' }, 0.5);

// Définir une valeur
metrics.metrics.app.activeUsers.set(42);
```

---

## 🎨 Dashboards Grafana

### Accès

1. Ouvrir http://localhost:3001
2. Se connecter avec `admin` / `admin` (ou vos identifiants)
3. Les dashboards sont automatiquement chargés

### Dashboards disponibles

#### 1. Application - Métriques Backend
- Taux de requêtes HTTP
- Latence HTTP (p50, p95, p99)
- Réponses par code de statut
- Taux d'erreurs applicatives
- Erreurs par type et sévérité

#### 2. Base de Données - Métriques SQLite
- Connexions actives
- Taux de requêtes SQL
- Durée des requêtes (p50, p95, p99)
- Taux d'erreurs SQL
- Erreurs par opération et table

#### 3. Système - Métriques Performance
- Utilisation CPU
- Utilisation mémoire (Heap)
- Utilisation mémoire détaillée
- Historiques CPU et mémoire

### Personnalisation

Les dashboards sont dans `monitoring/grafana/dashboards/`. Vous pouvez :
- Les modifier via l'interface Grafana
- Exporter les modifications en JSON
- Créer de nouveaux dashboards

---

## 🚨 Alertes par Email

### Configuration

Les alertes sont configurées dans :
- `monitoring/prometheus/rules/alerts.yml` : Règles d'alertes
- `monitoring/alertmanager/alertmanager.yml` : Configuration des notifications

### Types d'alertes

#### Alertes Critiques
- **HighErrorRate** : Taux d'erreurs critiques élevé (> 0.1/sec pendant 5min)
- **DatabaseConnectionFailure** : Échec de connexion à la base de données
- Envoi immédiat par email avec priorité critique

#### Alertes Système
- **HighCPUUsage** : CPU > 80% pendant 5min
- **HighMemoryUsage** : Mémoire > 85% pendant 5min
- **HighDiskUsage** : Disque > 80GB pendant 5min

#### Alertes Application
- **HighHTTPLatency** : Latence HTTP p95 > 2s
- **HighHTTPRequestRate** : Taux > 100 req/sec
- **SlowDatabaseQueries** : Requêtes SQL p95 > 1s

#### Alertes Sécurité
- **SuspiciousAuthAttempts** : Tentatives d'authentification suspectes

#### Alertes Firebase
- **HighFirebaseErrorRate** : Taux d'erreurs Firebase élevé
- **HighFirebaseLatency** : Latence Firebase élevée

### Configuration Email

Modifiez `monitoring/alertmanager/alertmanager.yml` avec vos paramètres SMTP :

```yaml
receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'votre-email@example.com'
        from: 'alerts@learning-english.local'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'votre-email@gmail.com'
        auth_password: 'votre-mot-de-passe-app'
```

### Réinitialiser la configuration Alertmanager

```bash
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

---

## 🔧 Maintenance

### Arrêter les services

```bash
docker-compose -f docker-compose.monitoring.yml down
```

### Redémarrer les services

```bash
docker-compose -f docker-compose.monitoring.yml restart
```

### Voir les logs

```bash
# Tous les services
docker-compose -f docker-compose.monitoring.yml logs -f

# Un service spécifique
docker-compose -f docker-compose.monitoring.yml logs -f prometheus
```

### Nettoyer les données

⚠️ **Attention** : Cela supprime toutes les données de monitoring !

```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

### Sauvegarder les données Prometheus

Les données sont stockées dans le volume Docker `prometheus_data`. Pour sauvegarder :

```bash
docker run --rm -v learning_english_prometheus_data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz -C /data .
```

---

## 🐛 Dépannage

### Prometheus ne peut pas scraper le backend

**Problème** : `Error: context deadline exceeded`

**Solution** :
1. Vérifier que le backend est démarré : `curl http://localhost:5010/health`
2. Vérifier que les métriques sont accessibles : `curl http://localhost:5010/metrics`
3. Sur Windows/Mac, utiliser `host.docker.internal:5010` dans `prometheus.yml`
4. Sur Linux, utiliser l'IP du host ou `172.17.0.1:5010`

### Grafana ne trouve pas Prometheus

**Problème** : Datasource Prometheus non accessible

**Solution** :
1. Vérifier que Prometheus est démarré : `docker ps | grep prometheus`
2. Vérifier la configuration dans `monitoring/grafana/provisioning/datasources/prometheus.yml`
3. Redémarrer Grafana : `docker-compose restart grafana`

### Les alertes ne sont pas envoyées

**Problème** : Pas d'emails reçus

**Solution** :
1. Vérifier les logs d'Alertmanager : `docker logs learning_english_alertmanager`
2. Vérifier la configuration SMTP dans `alertmanager.yml`
3. Tester avec un email de test
4. Vérifier que Prometheus trouve Alertmanager : http://localhost:9090/config

### Les dashboards sont vides

**Problème** : Aucune donnée affichée

**Solution** :
1. Vérifier que Prometheus collecte des données : http://localhost:9090/graph
2. Exécuter une requête de test : `http_requests_total`
3. Vérifier l'intervalle de temps dans Grafana (coin supérieur droit)
4. Vérifier que le backend génère des métriques

---

## 📚 Ressources

- [Documentation Prometheus](https://prometheus.io/docs/)
- [Documentation Grafana](https://grafana.com/docs/)
- [Documentation Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Documentation Winston](https://github.com/winstonjs/winston)

---

## 🔐 Sécurité

### Recommandations

1. **Changer les mots de passe par défaut** de Grafana
2. **Restreindre l'accès** aux ports de monitoring (firewall)
3. **Utiliser HTTPS** en production
4. **Chiffrer les credentials** SMTP dans Alertmanager
5. **Ne pas exposer** les endpoints `/metrics` publiquement en production

### Variables d'environnement sensibles

Ne pas commiter les fichiers `.env` contenant :
- `SMTP_PASSWORD`
- `GRAFANA_ADMIN_PASSWORD`
- `JWT_SECRET`

---

## ✅ Checklist de Déploiement

- [ ] Docker et Docker Compose installés
- [ ] Variables d'environnement configurées
- [ ] Backend démarré et accessible sur le port 5010
- [ ] Services de monitoring démarrés (`docker-compose up -d`)
- [ ] Prometheus accessible sur http://localhost:9090
- [ ] Grafana accessible sur http://localhost:3001
- [ ] Dashboards chargés automatiquement
- [ ] Alertes configurées avec un email valide
- [ ] Test d'alerte effectué et validé
- [ ] Logs vérifiés dans `logs/`

---

**Note** : Ce système de monitoring est conçu pour le développement et la production. En production, considérez l'utilisation d'un service de monitoring cloud (Datadog, New Relic, etc.) pour une meilleure scalabilité.

<<<END>>>




