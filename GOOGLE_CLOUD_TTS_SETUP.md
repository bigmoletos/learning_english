# Configuration Google Cloud Text-to-Speech

## Guide complet pour configurer le service Text-to-Speech

Date: 2025-11-09
Projet: AI English Trainer

---

## Prérequis

- Un compte Google
- Carte bancaire (pour activer la facturation, mais 1M caractères/mois gratuits)
- Accès à https://console.cloud.google.com/

---

## Étape 1 : Créer un projet Google Cloud

1. Allez sur **Google Cloud Console** : https://console.cloud.google.com/
2. Connectez-vous avec votre compte Google
3. Cliquez sur le menu déroulant du projet en haut (à côté de "Google Cloud")
4. Cliquez sur **"Nouveau projet"**
5. Donnez un nom à votre projet (ex: `ai-english-trainer`)
6. Cliquez sur **"Créer"**
7. Attendez quelques secondes que le projet soit créé

---

## Étape 2 : Activer l'API Text-to-Speech

1. Dans le menu de navigation (☰), allez dans **"API et services"** > **"Bibliothèque"**
2. Recherchez **"Cloud Text-to-Speech API"**
3. Cliquez dessus
4. Cliquez sur **"Activer"**
5. Attendez quelques secondes que l'API soit activée

---

## Étape 3 : Créer un compte de service

1. Dans le menu (☰), allez dans **"API et services"** > **"Identifiants"**
2. Cliquez sur **"Créer des identifiants"** en haut
3. Sélectionnez **"Compte de service"**

### Remplir les informations :

- **Nom du compte de service** : `tts-service` (ou autre nom de votre choix)
- **ID du compte de service** : (généré automatiquement)
- **Description** : `Service account for Text-to-Speech API`

4. Cliquez sur **"Créer et continuer"**

### Attribuer un rôle :

5. Sélectionnez l'un de ces rôles :
   - **Option 1 (Recommandée)** : `Cloud Text-to-Speech > Utilisateur de Cloud Text-to-Speech`
   - **Option 2 (Plus simple)** : `Éditeur` (accès plus large, moins sécurisé)

6. Cliquez sur **"Continuer"**
7. Cliquez sur **"OK"**

---

## Étape 4 : Générer la clé JSON

1. Dans la liste des **comptes de service**, trouvez celui que vous venez de créer
2. Cliquez sur le compte de service (sur son email)
3. Allez dans l'onglet **"Clés"**
4. Cliquez sur **"Ajouter une clé"** > **"Créer une clé"**
5. Sélectionnez le format **JSON**
6. Cliquez sur **"Créer"**
7. **Un fichier JSON sera téléchargé automatiquement**

⚠️ **IMPORTANT** : Gardez ce fichier précieusement et ne le partagez jamais publiquement !

---

## Étape 5 : Configurer le projet

### Option A : Utiliser le fichier JSON directement (RECOMMANDÉ)

1. Créez un dossier pour stocker les credentials :
   ```bash
   mkdir -p /mnt/c/programmation/learning_english/backend/credentials
   ```

2. Déplacez le fichier JSON téléchargé dans ce dossier :
   ```bash
   mv ~/Downloads/votre-fichier.json /mnt/c/programmation/learning_english/backend/credentials/google-tts-credentials.json
   ```

3. Ajoutez cette ligne dans votre fichier `.env` :
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/mnt/c/programmation/learning_english/backend/credentials/google-tts-credentials.json
   ```

4. **IMPORTANT** : Ajoutez le dossier credentials au `.gitignore` :
   ```bash
   echo "backend/credentials/" >> .gitignore
   ```

### Option B : Extraire les valeurs du JSON

1. Ouvrez le fichier JSON téléchargé avec un éditeur de texte

2. Le fichier ressemble à ceci :
   ```json
   {
     "type": "service_account",
     "project_id": "votre-projet-12345",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
     "client_email": "tts-service@votre-projet.iam.gserviceaccount.com",
     "client_id": "123456789",
     ...
   }
   ```

3. Copiez les valeurs suivantes dans votre fichier `.env` :

   ```bash
   # Google Cloud TTS Configuration
   GOOGLE_CLOUD_PROJECT_ID=votre-projet-12345
   GOOGLE_CLOUD_CLIENT_EMAIL=tts-service@votre-projet.iam.gserviceaccount.com
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
   ```

⚠️ **IMPORTANT pour GOOGLE_CLOUD_PRIVATE_KEY** :
- Gardez bien les `\n` (retours à la ligne)
- Entourez TOUT de guillemets doubles
- Ne modifiez PAS le contenu de la clé

---

## Étape 6 : Activer la facturation

Google Cloud Text-to-Speech offre des quotas gratuits :
- **1 million de caractères/mois** pour les voix standard (gratuit)
- **100 000 caractères/mois** pour les voix WaveNet/Neural2 (gratuit)

### Pour activer la facturation :

1. Allez dans le menu (☰) > **"Facturation"**
2. Cliquez sur **"Associer un compte de facturation"**
3. Créez un nouveau compte de facturation
4. Entrez vos informations de carte bancaire

💡 **Bon à savoir** :
- Google offre souvent **300$ de crédits gratuits** pour les nouveaux comptes
- Vous ne serez facturé QUE si vous dépassez les quotas gratuits
- Vous pouvez définir des alertes de budget pour éviter les surprises

---

## Étape 7 : Redémarrer le backend

1. Arrêtez et redémarrez les services :
   ```bash
   bash ./start_frontend_backend.sh restart
   ```

2. Attendez quelques secondes que le backend démarre

---

## Étape 8 : Tester la configuration

### Test 1 : Vérifier le health endpoint
```bash
curl http://localhost:5010/health
```

Réponse attendue :
```json
{"status":"OK","message":"API AI English Trainer opérationnelle","timestamp":"...","environment":"development"}
```

### Test 2 : Lister les voix disponibles
```bash
curl http://localhost:5010/api/text-to-speech/voices?lang=en-US
```

Réponse attendue :
```json
{
  "success": true,
  "voices": [
    {
      "name": "en-US-Neural2-A",
      "gender": "MALE",
      "languageCodes": ["en-US"],
      "naturalSampleRateHertz": 24000
    },
    ...
  ],
  "count": 45
}
```

### Test 3 : Synthétiser du texte en audio
```bash
curl -X POST http://localhost:5010/api/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the text to speech API.",
    "languageCode": "en-US",
    "voiceName": "en-US-Neural2-A"
  }'
```

Réponse attendue :
```json
{
  "success": true,
  "audioContent": "base64_encoded_audio_data...",
  "stats": {
    "textLength": 48,
    "audioSize": 12345,
    "voice": "en-US-Neural2-A",
    "languageCode": "en-US"
  }
}
```

---

## Vérifier les logs

Pour voir les logs du backend en temps réel :
```bash
tail -f /tmp/backend_api.log
```

Vous devriez voir :
```
Client Google Cloud TTS initialisé avec succès
```

Si vous voyez une erreur de credentials :
```
Could not load the default credentials
```
→ Vérifiez votre configuration `.env` et redémarrez le backend

---

## Dépannage

### Erreur : "Could not load the default credentials"

**Cause** : Les credentials ne sont pas correctement configurés

**Solution** :
1. Vérifiez que `GOOGLE_APPLICATION_CREDENTIALS` pointe vers le bon fichier
2. Vérifiez que le fichier JSON existe et est lisible
3. OU vérifiez que `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_CLOUD_CLIENT_EMAIL`, et `GOOGLE_CLOUD_PRIVATE_KEY` sont correctement définis
4. Redémarrez le backend : `bash ./start_frontend_backend.sh restart`

### Erreur : "API has not been enabled"

**Cause** : L'API Text-to-Speech n'est pas activée

**Solution** :
1. Retournez à l'étape 2 et activez l'API
2. Attendez quelques minutes que l'activation prenne effet
3. Réessayez

### Erreur : "Permission denied"

**Cause** : Le compte de service n'a pas les bonnes permissions

**Solution** :
1. Retournez dans Google Cloud Console
2. IAM & Admin > Comptes de service
3. Ajoutez le rôle "Cloud Text-to-Speech User" au compte de service

### Erreur : "Quota exceeded"

**Cause** : Vous avez dépassé le quota gratuit

**Solution** :
1. Vérifiez votre utilisation dans Google Cloud Console > APIs & Services > Quotas
2. Activez la facturation si ce n'est pas déjà fait
3. Ou attendez le mois prochain pour que le quota se réinitialise

---

## Sécurité

### ⚠️ Bonnes pratiques :

1. **NE JAMAIS** committer le fichier JSON de credentials dans Git
2. **NE JAMAIS** partager vos credentials publiquement
3. Ajoutez `backend/credentials/` au `.gitignore`
4. Utilisez des variables d'environnement pour la production
5. Limitez les permissions du compte de service au strict minimum
6. Tournez régulièrement les clés (créez-en de nouvelles et supprimez les anciennes)

### Fichier .gitignore recommandé :

```gitignore
# Credentials
backend/credentials/
*.json
!package.json
!package-lock.json

# Environment
.env
.env.local
.env.production

# Logs
*.log
/tmp/
```

---

## Ressources utiles

- Documentation officielle : https://cloud.google.com/text-to-speech/docs
- Console Google Cloud : https://console.cloud.google.com/
- Tarification : https://cloud.google.com/text-to-speech/pricing
- Exemples de voix : https://cloud.google.com/text-to-speech/docs/voices
- Support : https://cloud.google.com/support

---

## Résumé des commandes

```bash
# Créer le dossier credentials
mkdir -p backend/credentials

# Ajouter au .gitignore
echo "backend/credentials/" >> .gitignore

# Redémarrer les services
bash ./start_frontend_backend.sh restart

# Tester les voix
curl http://localhost:5010/api/text-to-speech/voices?lang=en-US

# Voir les logs
tail -f /tmp/backend_api.log
```

---

## Checklist finale

- [ ] Projet Google Cloud créé
- [ ] API Text-to-Speech activée
- [ ] Compte de service créé
- [ ] Clé JSON téléchargée
- [ ] Credentials configurés dans `.env`
- [ ] Backend redémarré
- [ ] Test des voix réussi
- [ ] Facturation activée (si nécessaire)
- [ ] `.gitignore` mis à jour

---

**Dernière mise à jour** : 09/11/2025
**Auteur** : Claude Code
**Version** : 1.0.0
