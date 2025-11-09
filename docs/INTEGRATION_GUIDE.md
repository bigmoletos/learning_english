# Guide d'Intégration - Infisical dans vos projets

**Version** : 1.0.0 | **Date** : Novembre 2025

---

## 🎯 Vue d'ensemble

Ce guide explique comment intégrer Infisical dans vos différents types de projets (web, mobile, Kubernetes, CI/CD).

---

## 🌐 Backend Node.js / Express

### Installation

```bash
npm install @infisical/sdk dotenv
```

### Configuration

Créer `backend/utils/secretsLoader.js` :

```javascript
const InfisicalClient = require("@infisical/sdk");
const dotenv = require("dotenv");

let client = null;

async function initializeInfisical() {
  if (process.env.NODE_ENV === "production") {
    // En production, utiliser Infisical
    client = new InfisicalClient({
      siteURL: process.env.INFISICAL_SERVER_URL || "https://infisical.example.com",
      accessToken: process.env.INFISICAL_SERVICE_TOKEN,
    });

    console.log("✅ Infisical initialisé");
  } else {
    // En développement, utiliser .env
    dotenv.config();
    console.log("✅ Variables d'environnement chargées depuis .env");
  }
}

async function getSecret(key, defaultValue = null) {
  if (process.env.NODE_ENV === "production" && client) {
    try {
      const secret = await client.getSecret({
        environment: process.env.INFISICAL_ENVIRONMENT || "production",
        path: "/",
        secretName: key,
        projectId: process.env.INFISICAL_PROJECT_ID,
      });
      return secret.secretValue;
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${key}:`, error);
      return defaultValue;
    }
  } else {
    // Fallback vers .env
    return process.env[key] || defaultValue;
  }
}

async function loadSecrets() {
  await initializeInfisical();

  // Charger tous les secrets nécessaires
  const secrets = {
    POSTGRES_PASSWORD: await getSecret("POSTGRES_PASSWORD"),
    JWT_SECRET: await getSecret("JWT_SECRET"),
    SMTP_PASSWORD: await getSecret("SMTP_PASSWORD"),
    // ... autres secrets
  };

  // Injecter dans process.env
  Object.assign(process.env, secrets);

  return secrets;
}

module.exports = { initializeInfisical, getSecret, loadSecrets };
```

### Utilisation dans server.js

```javascript
const { loadSecrets } = require("./utils/secretsLoader");

// Charger les secrets au démarrage
loadSecrets()
  .then(() => {
    // Démarrer le serveur
    const app = require("./server");
    app.listen(process.env.PORT || 5010);
  })
  .catch((error) => {
    console.error("Erreur lors du chargement des secrets:", error);
    process.exit(1);
  });
```

---

## ⚛️ Frontend React

### Installation

```bash
npm install @infisical/sdk
```

### Script de build avec secrets

Créer `scripts/build-with-secrets.js` :

```javascript
const { execSync } = require("child_process");
const fs = require("fs");

// Récupérer les secrets depuis Infisical
const secrets = execSync(
  `infisical secrets pull --project=${process.env.INFISICAL_PROJECT_ID} --env=${process.env.INFISICAL_ENVIRONMENT || "production"} --format=dotenv`,
  { encoding: "utf-8" }
);

// Écrire dans .env.production
fs.writeFileSync(".env.production", secrets);

console.log("✅ Secrets chargés dans .env.production");

// Lancer le build
execSync("npm run build", { stdio: "inherit" });
```

### Utilisation

```bash
# Dans package.json
{
  "scripts": {
    "build:prod": "node scripts/build-with-secrets.js"
  }
}
```

### Variables d'environnement React

Les variables doivent commencer par `REACT_APP_` :

```javascript
// Dans votre code React
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
```

---

## 📱 Mobile (Android / iOS)

### Android (Gradle)

Créer `android/gradle/secrets.gradle` :

```gradle
def loadSecrets() {
    def secrets = [:]

    // En production, récupérer depuis Infisical CLI
    if (project.hasProperty("infisicalToken")) {
        def cmd = "infisical secrets pull --project=${project.property("infisicalProjectId")} --env=${project.property("infisicalEnvironment")} --format=dotenv"
        def proc = cmd.execute()
        proc.text.eachLine { line ->
            def (key, value) = line.split("=", 2)
            if (key && value) {
                secrets[key] = value.replaceAll('"', '')
            }
        }
    } else {
        // Fallback vers local.properties
        def localProperties = new File("local.properties")
        if (localProperties.exists()) {
            localProperties.eachLine { line ->
                def (key, value) = line.split("=", 2)
                if (key && value) {
                    secrets[key] = value
                }
            }
        }
    }

    return secrets
}

ext.secrets = loadSecrets()
```

Utilisation dans `build.gradle` :

```gradle
android {
    defaultConfig {
        buildConfigField "String", "API_KEY", "\"${secrets.API_KEY}\""
        resValue "string", "api_key", secrets.API_KEY
    }
}
```

### iOS (Xcode)

Utiliser un script de build :

```bash
#!/bin/bash
# Build script pour iOS

# Récupérer les secrets depuis Infisical
infisical secrets pull --project=$INFISICAL_PROJECT_ID --env=$INFISICAL_ENVIRONMENT --format=dotenv > .env

# Générer Info.plist avec les secrets
# ... votre logique de génération
```

---

## ☸️ Kubernetes

### External Secrets Operator

Voir les fichiers dans `k8s/external-secrets/` :

1. Créer le SecretStore :

```bash
kubectl apply -f k8s/external-secrets/secretstore.yaml
```

2. Créer l'ExternalSecret :

```bash
kubectl apply -f k8s/external-secrets/external-secret-example.yaml
```

3. Les secrets seront automatiquement synchronisés dans un Secret Kubernetes.

### Utilisation dans un Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    - name: app
      image: my-app:latest
      env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_PASSWORD
```

---

## 🔄 CI/CD

### GitHub Actions

Voir `templates/ci-cd/github-actions.yml` pour un exemple complet.

**Configuration des secrets GitHub :**

1. Aller dans Settings > Secrets
2. Ajouter :
   - `INFISICAL_SERVER_URL`
   - `INFISICAL_SERVICE_TOKEN`
   - `INFISICAL_PROJECT_ID`

### GitLab CI

Voir `templates/ci-cd/gitlab-ci.yml` pour un exemple complet.

**Configuration des variables GitLab :**

1. Aller dans Settings > CI/CD > Variables
2. Ajouter :
   - `INFISICAL_SERVER_URL`
   - `INFISICAL_SERVICE_TOKEN`
   - `INFISICAL_PROJECT_ID`

---

## 🔐 Service Account Token

Pour utiliser Infisical dans CI/CD, créer un Service Account :

1. Aller dans Infisical > Settings > Service Accounts
2. Créer un nouveau Service Account
3. Copier le token généré
4. Utiliser ce token dans vos pipelines CI/CD

---

## 📝 Bonnes pratiques

1. **Ne jamais commiter les secrets** dans Git
2. **Utiliser des environnements séparés** (dev, staging, prod)
3. **Fallback vers .env en développement** pour faciliter le développement local
4. **Valider les secrets** au démarrage de l'application
5. **Logger les erreurs** mais jamais les valeurs des secrets
6. **Utiliser des Service Accounts** pour CI/CD plutôt que des comptes utilisateurs

---

## 🆘 Dépannage

### Erreur de connexion

```bash
# Vérifier l'URL du serveur
echo $INFISICAL_SERVER_URL

# Tester la connexion
curl https://infisical.votre-domaine.com/api/health
```

### Secret non trouvé

```bash
# Vérifier que le secret existe
infisical secrets get SECRET_NAME --project=mon-projet --env=production

# Vérifier les permissions du Service Account
```

### Problème de format

```bash
# Vérifier le format des secrets
infisical secrets pull --project=mon-projet --env=production --format=json
```

---

**Auteur** : Infrastructure DevOps
**Date** : Novembre 2025

