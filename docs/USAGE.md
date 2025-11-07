# Guide d'Utilisation - Infisical CLI

**Version** : 1.0.0 | **Date** : Novembre 2025

---

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser Infisical CLI pour gérer vos secrets au quotidien.

---

## 📦 Installation

### Windows

```powershell
.\scripts\setup-cli.ps1
```

### Linux

```bash
chmod +x scripts/setup-cli.sh
./scripts/setup-cli.sh
```

---

## 🔐 Authentification

### Première connexion

```bash
# Se connecter à votre serveur Infisical
infisical login

# Entrer les informations :
# - Server URL: https://infisical.votre-domaine.com
# - Email: votre-email@example.com
# - Password: votre-mot-de-passe
```

### Authentification avec Service Token

```bash
infisical login --service-token YOUR_TOKEN --server-url https://infisical.votre-domaine.com
```

---

## 📁 Gestion des projets

### Lister les projets

```bash
infisical projects list
```

### Initialiser un projet

```bash
infisical init

# Sélectionner votre projet et environnement
```

---

## 🔑 Gestion des secrets

### Ajouter un secret

```bash
# Format simple
infisical secrets set SECRET_NAME "secret_value" --project=mon-projet --env=production

# Exemple
infisical secrets set POSTGRES_PASSWORD "MaSuperClé123!" --project=tech4elles --env=production
```

### Récupérer un secret

```bash
# Récupérer un secret spécifique
infisical secrets get SECRET_NAME --project=mon-projet --env=production

# Exemple
infisical secrets get POSTGRES_PASSWORD --project=tech4elles --env=production
```

### Lister tous les secrets

```bash
infisical secrets list --project=mon-projet --env=production
```

### Supprimer un secret

```bash
infisical secrets delete SECRET_NAME --project=mon-projet --env=production
```

### Mettre à jour un secret

```bash
# Utiliser la même commande que pour créer
infisical secrets set SECRET_NAME "nouvelle_valeur" --project=mon-projet --env=production
```

---

## 🔄 Environnements

### Créer un environnement

```bash
# Les environnements sont généralement créés via l'interface web
# Ou via l'API Infisical
```

### Lister les environnements

```bash
infisical environments list --project=mon-projet
```

### Changer d'environnement

```bash
# Utiliser le flag --env
infisical secrets list --project=mon-projet --env=development
infisical secrets list --project=mon-projet --env=staging
infisical secrets list --project=mon-projet --env=production
```

---

## 📥 Récupération en masse

### Exporter tous les secrets

```bash
# Format dotenv (.env)
infisical secrets pull --project=mon-projet --env=production --format=dotenv > .env

# Format JSON
infisical secrets pull --project=mon-projet --env=production --format=json > secrets.json

# Format YAML
infisical secrets pull --project=mon-projet --env=production --format=yaml > secrets.yaml
```

### Injecter dans l'environnement

```bash
# Source les secrets dans le shell actuel
eval $(infisical secrets pull --project=mon-projet --env=production --format=dotenv)
```

---

## 🔀 Migration depuis .env

### Utiliser le script de migration

```bash
# Mode simulation (dry-run)
node scripts/migrate-secrets.js --project=mon-projet --env=production --dry-run

# Migration réelle
node scripts/migrate-secrets.js --project=mon-projet --env=production
```

Le script va :
1. Analyser le fichier `.env_old`
2. Catégoriser les secrets
3. Les migrer vers Infisical

---

## 🔄 Rotation des secrets

### Rotation manuelle

```bash
# Rotation d'une clé spécifique
node scripts/rotate-secrets.js --project=mon-projet --env=production --key=JWT_SECRET

# Rotation de toutes les clés critiques
node scripts/rotate-secrets.js --project=mon-projet --env=production
```

### Configuration automatique

Ajouter dans votre crontab :

```bash
# Rotation hebdomadaire des secrets JWT
0 2 * * 0 node /opt/gestion_secrets/scripts/rotate-secrets.js --project=mon-projet --env=production
```

---

## 🔍 Recherche et filtrage

### Rechercher un secret

```bash
# Lister et filtrer avec grep
infisical secrets list --project=mon-projet --env=production | grep POSTGRES
```

### Voir l'historique

```bash
# Via l'interface web Infisical
# Ou via l'API
```

---

## 💻 Intégration dans les scripts

### Script Bash

```bash
#!/bin/bash

# Charger les secrets
eval $(infisical secrets pull --project=mon-projet --env=production --format=dotenv)

# Utiliser les variables
echo "Connexion à la base de données..."
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB
```

### Script PowerShell

```powershell
# Charger les secrets
$secrets = infisical secrets pull --project=mon-projet --env=production --format=json | ConvertFrom-Json

# Utiliser les variables
$env:POSTGRES_PASSWORD = $secrets.POSTGRES_PASSWORD
```

### Script Node.js

```javascript
const { execSync } = require('child_process');

// Récupérer un secret
const password = execSync(
  'infisical secrets get POSTGRES_PASSWORD --project=mon-projet --env=production',
  { encoding: 'utf-8' }
).trim();

console.log('Password:', password);
```

---

## 🔐 Bonnes pratiques

1. **Ne jamais commiter les secrets** dans Git
2. **Utiliser des environnements séparés** (dev, staging, prod)
3. **Faire tourner régulièrement** les secrets critiques
4. **Utiliser des noms explicites** pour les secrets
5. **Documenter** l'utilisation de chaque secret
6. **Limiter les accès** avec RBAC

---

## 📚 Commandes utiles

```bash
# Vérifier la connexion
infisical status

# Voir l'aide
infisical --help
infisical secrets --help

# Voir la version
infisical --version

# Se déconnecter
infisical logout
```

---

## 🆘 Dépannage

### Erreur d'authentification

```bash
# Se reconnecter
infisical logout
infisical login
```

### Secret non trouvé

```bash
# Vérifier le projet et l'environnement
infisical secrets list --project=mon-projet --env=production

# Vérifier les permissions
```

### Problème de connexion au serveur

```bash
# Vérifier l'URL du serveur
infisical status

# Tester la connexion
curl https://infisical.votre-domaine.com/api/health
```

---

**Auteur** : Infrastructure DevOps
**Date** : Novembre 2025

