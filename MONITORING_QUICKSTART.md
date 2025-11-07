# 🔍 Système de Monitoring - Guide Rapide

## Démarrage Rapide

1. **Installer les dépendances**
```bash
cd backend && npm install
```

2. **Démarrer le backend**
```bash
cd backend && npm start
```

3. **Démarrer le monitoring**
```bash
./start-monitoring.sh
# ou
docker-compose -f docker-compose.monitoring.yml up -d
```

4. **Accéder aux interfaces**
- Grafana : http://localhost:3001 (admin/admin)
- Prometheus : http://localhost:9090
- Alertmanager : http://localhost:9093

## Configuration Email

Ajoutez dans `.env` :
```env
ALERT_EMAIL_TO=votre-email@example.com
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-app-password
```

## Documentation Complète

Voir [MONITORING.md](./MONITORING.md) pour la documentation complète.



