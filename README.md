# Infrastructure de Gestion de Secrets - Infisical

**Version** : 1.0.0 | **Date** : Novembre 2025

---

## 🎯 Vue d'ensemble

Ce projet fournit une infrastructure complète et sécurisée pour la gestion centralisée de secrets applicatifs via **Infisical** (auto-hébergé).

### Fonctionnalités

- ✅ **Gestion centralisée** : Un seul point d'accès pour tous vos projets
- ✅ **Auto-hébergé** : Contrôle total sur vos données
- ✅ **Sécurisé** : Chiffrement au repos et en transit, RBAC, audit logs
- ✅ **Multi-projets** : Support web, mobile, Kubernetes, CI/CD
- ✅ **Bastion** : Reverse proxy sécurisé avec authentification
- ✅ **Documentation complète** : Guides d'installation et d'utilisation

---

## 📋 Prérequis

- Docker et Docker Compose installés
- Serveur Linux avec au moins 2GB RAM et 10GB disque
- Domaine pointant vers le serveur (pour HTTPS)
- Accès root ou sudo pour configuration réseau

---

## 🚀 Démarrage rapide

### 1. Installation sur le serveur

```bash
# Cloner ou copier ce projet sur votre serveur
cd /opt/gestion_secrets

# Configurer les variables d'environnement
cp infisical/.env.example infisical/.env
nano infisical/.env  # Modifier les valeurs

# Démarrer Infisical
cd infisical
docker-compose up -d

# Configurer le bastion
cd ../bastion
./setup.sh
```

### 2. Installation du client CLI

**Windows (PowerShell) :**
```powershell
.\scripts\setup-cli.ps1
```

**Linux :**
```bash
chmod +x scripts/setup-cli.sh
./scripts/setup-cli.sh
```

### 3. Migration des secrets

```bash
# Analyser et migrer les secrets depuis .env_old
node scripts/migrate-secrets.js
```

---

## 📚 Documentation

- **[INSTALLATION.md](docs/INSTALLATION.md)** : Guide d'installation détaillé
- **[USAGE.md](docs/USAGE.md)** : Guide d'utilisation pour développeurs
- **[INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)** : Comment intégrer dans un projet
- **[BASTION_SETUP.md](docs/BASTION_SETUP.md)** : Configuration du bastion
- **[SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md)** : Checklist sécurité

---

## 🏗️ Structure du projet

```
gestion_secrets/
├── .env_old                    # Référence des secrets à migrer
├── infisical/                  # Configuration Infisical
│   ├── docker-compose.yml
│   ├── .env.example
│   └── nginx.conf
├── bastion/                    # Configuration bastion/jump host
│   ├── nginx.conf
│   ├── setup.sh
│   └── firewall-rules.sh
├── scripts/                    # Scripts utilitaires
│   ├── setup-cli.sh
│   ├── setup-cli.ps1
│   ├── migrate-secrets.js
│   └── rotate-secrets.js
├── k8s/                        # Intégration Kubernetes
│   ├── external-secrets/
│   └── infisical-sync/
├── templates/                  # Templates réutilisables
│   └── ci-cd/
└── docs/                       # Documentation
```

---

## 🔐 Sécurité

- **Chiffrement au repos** : PostgreSQL avec chiffrement AES-256
- **Chiffrement en transit** : HTTPS/TLS avec Let's Encrypt
- **Authentification** : MFA supportée
- **Audit** : Logs complets de tous les accès
- **RBAC** : Contrôle d'accès basé sur les rôles
- **Bastion** : Reverse proxy avec authentification forte

---

## 📖 Utilisation

### Ajouter un secret

```bash
infisical secrets set SECRET_NAME "secret_value" --project=mon-projet --env=production
```

### Récupérer un secret

```bash
infisical secrets get SECRET_NAME --project=mon-projet --env=production
```

### Lister tous les secrets

```bash
infisical secrets list --project=mon-projet --env=production
```

---

## 🔗 Intégration dans vos projets

Voir [docs/INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md) pour :

- Intégration Backend Node.js
- Intégration Frontend React
- Intégration Mobile (Android/iOS)
- Intégration Kubernetes
- Intégration CI/CD (GitHub Actions, GitLab CI)

---

## 🆘 Support

Pour toute question ou problème :

1. Consulter la documentation dans `docs/`
2. Vérifier les logs : `docker-compose logs -f` dans `infisical/`
3. Consulter la [documentation officielle Infisical](https://infisical.com/docs)

---

## 📝 Licence

Ce projet est fourni "tel quel" pour usage interne.

---

**Auteur** : Infrastructure DevOps
**Date** : Novembre 2025
