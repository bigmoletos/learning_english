# ✅ Comment Vérifier que le Backend est Bien Déployé sur Firebase

**Date** : 2025-11-28
**Projet** : learning-english
**Backend** : Firebase Functions

---

## 🔍 Méthode 1 : Via la Ligne de Commande Firebase CLI

### 1. Lister les Fonctions Déployées

```powershell
cd C:\programmation\learning_english
firebase functions:list
```

**Résultat attendu** :
```
┌──────────┬─────────┬─────────┬──────────────┬────────┬──────────┐
│ Function │ Version │ Trigger │ Location     │ Memory │ Runtime  │
├──────────┼─────────┼─────────┼──────────────┼────────┼──────────┤
│ api      │ v1      │ https   │ europe-west1 │ 256    │ nodejs20 │
└──────────┴─────────┴─────────┴──────────────┴────────┴──────────┘
```

✅ Si vous voyez la fonction `api` avec le statut `https`, le backend est déployé.

### 2. Tester le Health Check

**Via PowerShell** :
```powershell
Invoke-WebRequest -Uri "https://europe-west1-ia-project-91c03.cloudfunctions.net/api/health" -Method GET
```

**Via curl** (si disponible) :
```bash
curl https://europe-west1-ia-project-91c03.cloudfunctions.net/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2025-11-28T10:52:37.000Z",
  "service": "firebase-functions",
  "project": "ia-project-91c03"
}
```

### 3. Vérifier les Logs

```powershell
# Voir les logs en temps réel
firebase functions:log --only api

# Voir les 50 dernières lignes
firebase functions:log --only api --limit 50

# Filtrer par niveau (erreurs uniquement)
firebase functions:log --only api --level error
```

---

## 🌐 Méthode 2 : Via la Console Firebase

1. **Aller sur** : https://console.firebase.google.com/project/ia-project-91c03/functions

2. **Vérifier** :
   - ✅ La fonction `api` apparaît dans la liste
   - ✅ Statut : **Actif** (icône verte)
   - ✅ Région : **europe-west1**
   - ✅ Runtime : **Node.js 20**

3. **Voir les Métriques** :
   - Cliquer sur la fonction `api`
   - Onglet **Métriques** : voir les invocations, erreurs, latence
   - Onglet **Logs** : voir les logs en temps réel

4. **Tester depuis la Console** :
   - Onglet **Test** → Entrer l'URL : `https://europe-west1-ia-project-91c03.cloudfunctions.net/api/health`
   - Méthode : **GET**
   - Cliquer sur **Exécuter**

---

## 🧪 Méthode 3 : Tester les Routes Spécifiques

### Route TTS (Text-to-Speech)

**Via PowerShell** :
```powershell
$body = @{
    text = "Hello, this is a test"
    languageCode = "en-US"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://europe-west1-ia-project-91c03.cloudfunctions.net/api/text-to-speech" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Réponse attendue** (si Google Cloud TTS est configuré) :
```json
{
  "success": true,
  "audioContent": "base64_encoded_audio...",
  "stats": {
    "textLength": 24,
    "audioSize": 12345,
    "voice": "default",
    "languageCode": "en-US"
  }
}
```

**Si erreur 503** : Le service TTS n'est pas configuré (variables d'environnement Google Cloud manquantes). C'est normal si vous n'avez pas encore configuré les credentials Google Cloud.

### Route STT (Speech-to-Text)

**Note** : Cette route utilise l'API Web Speech du navigateur, donc elle ne nécessite pas de test backend.

---

## ⚠️ Problèmes Courants

### Erreur 404 : Route Non Trouvée

**Cause** : La route n'est pas correctement montée dans `functions/index.js`

**Solution** :
1. Vérifier que la route est bien montée :
   ```javascript
   app.use("/text-to-speech", require("./routes/textToSpeech"));
   ```
2. Redéployer :
   ```powershell
   firebase deploy --only functions
   ```

### Erreur 500 : Erreur Serveur

**Cause** : Erreur dans le code de la route ou dépendances manquantes

**Solution** :
1. Vérifier les logs :
   ```powershell
   firebase functions:log --only api --level error
   ```
2. Vérifier que toutes les dépendances sont installées :
   ```powershell
   cd functions
   npm install
   ```

### Erreur CORS

**Cause** : L'origine du frontend n'est pas autorisée dans la configuration CORS

**Solution** :
1. Vérifier `functions/index.js` :
   ```javascript
   app.use(cors({
     origin: [
       "https://learning-english.iaproject.fr",
       "https://learning-english-b7d.pages.dev",
       // ... autres origines
     ],
   }));
   ```
2. Ajouter votre origine si nécessaire
3. Redéployer

---

## 📊 Vérification Complète

**Checklist** :

- [ ] `firebase functions:list` montre la fonction `api`
- [ ] `/health` retourne `{"status": "ok"}`
- [ ] Les logs sont accessibles via `firebase functions:log`
- [ ] La console Firebase montre la fonction comme active
- [ ] Les métriques montrent des invocations (si vous avez testé)
- [ ] Pas d'erreurs dans les logs récents

---

## 🔗 URLs Utiles

- **Console Firebase** : https://console.firebase.google.com/project/ia-project-91c03/functions
- **URL du Backend** : https://europe-west1-ia-project-91c03.cloudfunctions.net/api
- **Health Check** : https://europe-west1-ia-project-91c03.cloudfunctions.net/api/health
- **Documentation Firebase Functions** : https://firebase.google.com/docs/functions

---

## 📝 Notes

- Le backend est déployé sur la région **europe-west1** (Belgique)
- Le runtime est **Node.js 20**
- La mémoire allouée est **256MB** (limite du plan gratuit)
- Le timeout est de **60 secondes** (limite du plan gratuit)

