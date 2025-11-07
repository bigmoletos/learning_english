# Guide d'Installation - Infrastructure Infisical

**Version** : 1.0.0 | **Date** : Novembre 2025

---

## 🎯 Vue d'ensemble

Ce guide vous accompagne dans l'installation complète d'Infisical sur votre serveur auto-hébergé, avec configuration du bastion et sécurisation.

---

## 📋 Prérequis

### Serveur

- **OS** : Ubuntu 20.04+ ou Debian 11+ (recommandé)
- **RAM** : Minimum 2GB (4GB recommandé)
- **Disque** : Minimum 10GB libres
- **Réseau** : Domaine pointant vers le serveur (pour HTTPS)
- **Accès** : Root ou sudo

### Logiciels

- Docker 20.10+
- Docker Compose 2.0+
- Nginx (sera installé)
- Certbot (sera installé)
- OpenSSL (pour générer les clés)

---

## 🚀 Installation étape par étape

### Étape 1 : Préparation du serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker --version
docker-compose --version
```

### Étape 2 : Configuration Infisical

```bash
# Cloner ou copier ce projet sur le serveur
cd /opt
git clone <votre-repo> gestion_secrets
cd gestion_secrets/infisical

# Créer le fichier .env à partir de l'exemple
cp env.example .env
nano .env  # Éditer avec vos valeurs
```

**Génération des clés de chiffrement :**

```bash
# Générer toutes les clés nécessaires
openssl rand -base64 32  # Pour ENCRYPTION_KEY
openssl rand -base64 32  # Pour JWT_SIGNUP_SECRET
openssl rand -base64 32  # Pour JWT_REFRESH_SECRET
openssl rand -base64 32  # Pour JWT_AUTH_SECRET
openssl rand -base64 32  # Pour JWT_SERVICE_SECRET
openssl rand -base64 32  # Pour POSTGRES_PASSWORD
openssl rand -base64 32  # Pour REDIS_PASSWORD
```

**Configuration du fichier .env :**

```env
POSTGRES_USER=infisical
POSTGRES_PASSWORD=<clé générée>
POSTGRES_DB=infisical

REDIS_PASSWORD=<clé générée>

SERVER_URL=https://infisical.votre-domaine.com
SITE_URL=https://infisical.votre-domaine.com

ENCRYPTION_KEY=<clé générée>
JWT_SIGNUP_SECRET=<clé générée>
JWT_REFRESH_SECRET=<clé générée>
JWT_AUTH_SECRET=<clé générée>
JWT_SERVICE_SECRET=<clé générée>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=votre-email@gmail.com
SMTP_PASSWORD=votre-app-password-gmail
SMTP_FROM_EMAIL=noreply@votre-domaine.com
SMTP_FROM_NAME=Infisical
```

### Étape 3 : Démarrage d'Infisical

```bash
# Créer les dossiers nécessaires
mkdir -p logs backups

# Démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

**Vérification :**

```bash
# Vérifier que tous les conteneurs sont en cours d'exécution
docker-compose ps

# Tester l'API
curl http://localhost:8080/api/health
```

### Étape 4 : Configuration du Bastion

```bash
# Aller dans le dossier bastion
cd ../bastion

# Rendre le script exécutable
chmod +x setup.sh

# Exécuter le script de configuration
sudo ./setup.sh
```

Le script va :
1. Installer Nginx
2. Configurer le reverse proxy
3. Configurer l'authentification basique
4. Installer Certbot et générer les certificats SSL
5. Configurer le firewall

### Étape 5 : Configuration du Firewall

```bash
# Rendre le script exécutable
chmod +x firewall-rules.sh

# Exécuter le script
sudo ./firewall-rules.sh
```

### Étape 6 : Configuration DNS

Configurer votre DNS pour pointer vers votre serveur :

```
A     infisical.votre-domaine.com    ->    IP_DU_SERVEUR
```

### Étape 7 : Premier accès

1. Ouvrir https://infisical.votre-domaine.com
2. Créer le premier compte administrateur
3. Configurer votre organisation et projets

---

## 🔧 Configuration avancée

### Sauvegarde automatique

Les sauvegardes PostgreSQL sont automatiques (toutes les 24h). Pour restaurer :

```bash
cd infisical
docker-compose exec postgres psql -U infisical -d infisical < backups/infisical-backup-YYYYMMDD-HHMMSS.sql.gz
```

### Monitoring

```bash
# Voir les logs en temps réel
docker-compose logs -f infisical-server

# Vérifier l'utilisation des ressources
docker stats
```

### Mise à jour

```bash
cd infisical
docker-compose pull
docker-compose up -d
```

---

## 🔐 Sécurité

### Recommandations

1. **Changer tous les mots de passe par défaut**
2. **Activer MFA** pour tous les comptes administrateurs
3. **Configurer les IP whitelist** dans le bastion
4. **Activer les logs d'audit** dans Infisical
5. **Régulièrement faire tourner les secrets** (rotation)

### Rotation des secrets

```bash
# Utiliser le script de rotation
node ../scripts/rotate-secrets.js --project=mon-projet --env=production
```

---

## 🐛 Dépannage

### Infisical ne démarre pas

```bash
# Vérifier les logs
docker-compose logs infisical-server

# Vérifier la connexion à la base de données
docker-compose exec postgres psql -U infisical -d infisical -c "SELECT 1"
```

### Erreur SSL

```bash
# Régénérer les certificats
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Problème de connexion

```bash
# Vérifier que les ports sont ouverts
sudo netstat -tlnp | grep -E '8080|443|80'

# Vérifier le firewall
sudo ufw status
```

---

## 📚 Ressources

- [Documentation officielle Infisical](https://infisical.com/docs)
- [Guide d'utilisation](USAGE.md)
- [Guide d'intégration](INTEGRATION_GUIDE.md)

---

**Auteur** : Infrastructure DevOps
**Date** : Novembre 2025

