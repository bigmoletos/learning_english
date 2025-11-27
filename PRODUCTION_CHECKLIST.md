# 🚀 Checklist Production - AI English Trainer

**Date** : 2025-11-27
**Version** : 1.0.0
**Objectif** : Liste des actions critiques pour passer en production

---

## ⚠️ CRITIQUE - À faire AVANT la mise en production

### 1. 🔐 Sécurité

#### Variables d'environnement
- [ ] **Créer `.env.production`** avec toutes les clés API Firebase
- [ ] **Générer `JWT_SECRET` fort** : `openssl rand -base64 64`
- [ ] **Générer `REFRESH_TOKEN_SECRET`** : `openssl rand -base64 64`
- [ ] **Vérifier que toutes les clés API sont en variables d'environnement** (pas en dur dans le code)
- [ ] **Configurer Firebase Rules en mode production** (`firestore.rules` et `storage.rules`)

#### Conformité RGPD/IA Act
- [ ] **Créer `src/components/legal/PrivacyPolicy.tsx`** - Politique de confidentialité
- [ ] **Créer `src/components/legal/ConsentManager.tsx`** - Gestion du consentement cookies/données
- [ ] **Implémenter le chiffrement localStorage** (`src/services/encryptionService.ts`)
- [ ] **Ajouter un lien vers la politique de confidentialité dans le footer**

#### Backend
- [ ] **Vérifier que `helmet` est configuré** dans `backend/server.js`
- [ ] **Vérifier le rate limiting** sur toutes les routes sensibles (`/api/auth/*`, `/api/speaking-agent/*`)
- [ ] **Configurer CORS** avec uniquement les domaines de production :
  ```javascript
  CORS_ORIGIN=https://learning-english.iaproject.fr,https://bigmoletos.github.io
  ```

---

### 2. 🚀 Déploiement Backend

#### Option A : Firebase Functions (Recommandé - Gratuit)
- [ ] **Firebase CLI installé** : `npm install -g firebase-tools`
- [ ] **Projet Firebase sélectionné** : `firebase use ia-project-91c03`
- [ ] **Variables configurées** : `firebase functions:config:set ...` (voir `ENV_VARS.txt`)
- [ ] **Routes adaptées** pour Firestore (actuellement SQLite)
- [ ] **Functions déployées** : `firebase deploy --only functions`
- [ ] **Domaine configuré** : `backend.learning-english.iaproject.fr`
- [ ] **Tester** : `curl https://europe-west1-ia-project-91c03.cloudfunctions.net/api/health`

#### Option B : Railway (Alternative - Payant)
- [ ] **Créer un compte Railway** : https://railway.app
- [ ] **Déployer le backend** depuis GitHub (`backend/` folder)
- [ ] **Configurer variables** : Voir `ENV_VARS.txt` section Railway
- [ ] **Configurer le domaine** : `backend.learning-english.iaproject.fr`
- [ ] **Mettre à jour DNS OVH** : CNAME → Railway CNAME
- [ ] **Tester** : `curl https://backend.learning-english.iaproject.fr/health`

**Guide complet** : Voir `DEPLOYMENT.md` section "Backend Firebase Functions" ou "Backend Railway"

---

### 3. 🌐 Déploiement Frontend

#### Cloudflare Pages (Actuel ✅)
- [ ] **Projet créé** sur Cloudflare Pages
- [ ] **Dépôt GitHub connecté** : `bigmoletos/learning_english`
- [ ] **Build configuré** : `npm run build`, output: `build`
- [ ] **Variables d'environnement ajoutées** : Voir `ENV_VARS.txt` section Cloudflare Pages
- [ ] **Déploiement réussi** : `https://learning-english-b7d.pages.dev`
- [ ] **Domaine personnalisé configuré** : `learning-english.iaproject.fr`

**Guide complet** : Voir `DEPLOYMENT.md` section "Frontend Cloudflare Pages"

---

### 4. ✅ Tests & Validation

#### Tests
- [ ] **Exécuter tous les tests** : `npm test`
- [ ] **Tests E2E** : `npm run test:e2e`
- [ ] **Vérifier le linting** : `npm run lint`
- [ ] **Vérifier les vulnérabilités** : `npm audit`

#### Tests fonctionnels en production
- [ ] **Authentification** : Créer un compte, se connecter, se déconnecter
- [ ] **Reconnaissance vocale** : Tester le mode conversationnel
- [ ] **Text-to-Speech** : Vérifier que les réponses vocales fonctionnent
- [ ] **Exercices** : Tester QCM, Cloze, Reading, Listening
- [ ] **Progression** : Vérifier que les scores sont sauvegardés
- [ ] **Mobile** : Tester sur Android (APK)

---

### 5. 📊 Monitoring & Logs

#### Monitoring
- [ ] **Configurer Sentry** (ou équivalent) pour le tracking d'erreurs
- [ ] **Configurer Google Analytics** (ou équivalent) pour les métriques
- [ ] **Configurer UptimeRobot** (ou Pingdom) pour surveiller la disponibilité
- [ ] **Configurer les alertes email** pour les erreurs critiques

#### Logs
- [ ] **Vérifier que Winston est configuré** dans le backend
- [ ] **Configurer les logs en production** (niveau `info` ou `warn`)
- [ ] **Vérifier l'accès aux logs** sur Railway/Render

---

### 6. 🔧 Configuration Production

#### Firebase
- [ ] **Créer un projet Firebase séparé pour la production** (ou utiliser le même)
- [ ] **Configurer Firebase Auth** avec les domaines autorisés :
  - `learning-english.iaproject.fr`
  - `bigmoletos.github.io`
- [ ] **Configurer Firestore Rules** en mode production :
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /progress/{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
- [ ] **Configurer Storage Rules** pour les fichiers utilisateur

#### Google Cloud TTS
- [ ] **Vérifier que les credentials Google Cloud TTS** sont configurés
- [ ] **Tester le service TTS** en production
- [ ] **Vérifier les quotas et limites** Google Cloud

---

### 7. 📱 Application Mobile (optionnel)

#### Build APK
- [ ] **Build APK de release** : `cd android && ./gradlew assembleRelease`
- [ ] **Tester l'APK** sur plusieurs appareils Android
- [ ] **Configurer le signing** pour la distribution (Play Store ou directe)

---

### 8. 📝 Documentation

#### Documentation utilisateur
- [ ] **README.md à jour** avec les instructions d'installation
- [ ] **Guide utilisateur** (optionnel) pour les fonctionnalités principales
- [ ] **FAQ** pour les questions courantes

#### Documentation technique
- [ ] **CHANGELOG.md à jour** avec la version 1.0.0
- [ ] **Variables d'environnement documentées** dans `.env.example`
- [ ] **API documentée** (si publique)

---

## 🎯 Actions rapides (30 minutes)

### Minimum viable pour production

1. **Backend sur Railway** (15 min)
   ```bash
   # 1. Créer compte Railway
   # 2. Déployer depuis GitHub
   # 3. Configurer variables d'environnement
   # 4. Configurer domaine personnalisé
   ```

2. **Frontend sur GitHub Pages** (10 min)
   ```bash
   # 1. Créer .env.production
   # 2. npm run build
   # 3. Configurer GitHub Actions
   ```

3. **Tests critiques** (5 min)
   ```bash
   # 1. Tester authentification
   # 2. Tester reconnaissance vocale
   # 3. Tester exercices
   ```

---

## ⚡ Checklist rapide (à cocher)

### Sécurité
- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET fort généré
- [ ] Firebase Rules en production
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] HTTPS activé (certificat SSL)

### Déploiement
- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] DNS configuré correctement
- [ ] Variables d'environnement production configurées

### Tests
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Tests fonctionnels en production réussis
- [ ] Aucune vulnérabilité critique

### Monitoring
- [ ] Logs configurés
- [ ] Error tracking configuré (Sentry)
- [ ] Analytics configuré
- [ ] Uptime monitoring configuré

---

## 🚨 Problèmes connus à résoudre

### Priorité HAUTE
1. **Backend non déployé** - Le CNAME pointe vers GitHub Pages (ne peut pas fonctionner)
2. **Variables d'environnement production** - À créer et configurer
3. **Firebase Rules** - À vérifier en mode production
4. **Chiffrement localStorage** - Non implémenté (requis pour RGPD)

### Priorité MOYENNE
1. **Politique de confidentialité** - Non implémentée
2. **Gestion du consentement** - Non implémentée
3. **Monitoring** - Sentry/Analytics non configurés

---

## 📞 Support

- **Email** : admin@iaproject.fr
- **Documentation** : Voir `DEPLOYMENT.md` (guide complet) et `ENV_VARS.txt` (variables)
- **Issues** : https://github.com/bigmoletos/learning_english/issues

---

## ✅ Validation finale

Avant de considérer le projet "en production", vérifier :

- [ ] ✅ Backend accessible et fonctionnel
- [ ] ✅ Frontend accessible et fonctionnel
- [ ] ✅ Authentification fonctionne
- [ ] ✅ Exercices fonctionnent
- [ ] ✅ Reconnaissance vocale fonctionne
- [ ] ✅ Aucune erreur critique dans les logs
- [ ] ✅ Monitoring configuré
- [ ] ✅ Documentation à jour

**Une fois toutes les cases cochées, le projet est prêt pour la production ! 🎉**

---

**Dernière mise à jour** : 2025-11-27

