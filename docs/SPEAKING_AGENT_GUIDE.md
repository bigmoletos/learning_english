# Guide complet de l'Agent IA Speaking

**Version** : 1.0.0
**Date** : 09-11-2025
**Compatibilité** : Web (Chrome, Edge, Firefox) + Android (Capacitor)

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités](#fonctionnalités)
3. [Architecture](#architecture)
4. [Installation et Configuration](#installation-et-configuration)
5. [Utilisation](#utilisation)
6. [API Backend](#api-backend)
7. [Compatibilité Web et Android](#compatibilité-web-et-android)
8. [Ollama (optionnel)](#ollama-optionnel)
9. [Dépannage](#dépannage)

---

## Vue d'ensemble

L'Agent IA Speaking est un système complet d'analyse de l'expression orale en anglais qui :
- **Enregistre** votre voix via le microphone (Web et Android)
- **Transcrit** avec Google Cloud Speech-to-Text
- **Analyse** la grammaire, prononciation et fluidité
- **Corrige** avec explications détaillées et exceptions
- **Propose** des exercices personnalisés (A2→C1)
- **Améliore** avec Ollama (modèle IA local optionnel)

**Particularité** : Fonctionne de manière identique sur Web et Android grâce à Capacitor.

---

## Fonctionnalités

### 1. **Enregistrement Audio**
- Web : MediaRecorder API avec configuration avancée
- Android : Détection automatique du format supporté (webm/mp4)
- Feedback visuel en temps réel (timer, animation)

### 2. **Transcription Speech-to-Text**
- Google Cloud STT intégré
- Support multi-langues (en-US par défaut)
- Score de confiance pour chaque mot
- Ponctuation automatique

### 3. **Analyse Grammaticale**
- Détection de 6+ types d'erreurs courantes :
  - Concordance sujet-verbe (he/she/it)
  - Articles (a/an)
  - Quantificateurs (much/many)
  - Négation au passé (didn't + base form)
  - Et plus...
- Explications pédagogiques avec exceptions
- Phrase corrigée automatiquement

### 4. **Scores**
- **Grammaire** (0-100%) : Basé sur le nombre et la gravité des erreurs
- **Prononciation** (0-100%) : Basé sur la confiance du STT
- **Fluidité** (0-100%) : Longueur, complexité, hésitations
- **Global** : Moyenne des trois scores

### 5. **Feedback Personnalisé**
- Adapté au niveau (A2, B1, B2, C1)
- Recommandations ciblées
- Encouragements et motivations

### 6. **Exercices Suggérés**
- Générés selon les erreurs détectées
- 4 types : Pronunciation, Fluency, Grammar, Vocabulary
- Durée adaptée au niveau (20s → 90s)

### 7. **Amélioration Ollama (optionnel)**
- Analyse grammaticale plus approfondie
- Feedback plus naturel et encourageant
- Génération d'exercices plus créatifs

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  SpeakingExerciseList (Liste par niveau)      │    │
│  │         A2 | B1 | B2 | C1                      │    │
│  └──────────────────┬─────────────────────────────┘    │
│                     │                                    │
│  ┌──────────────────▼─────────────────────────────┐    │
│  │  SpeakingExercise (Enregistrement + Analyse)  │    │
│  │  - MediaRecorder (Web/Android compatible)     │    │
│  │  - Transcription display                       │    │
│  │  - Scores + Corrections + Exercices           │    │
│  └──────────────────┬─────────────────────────────┘    │
│                     │                                    │
└─────────────────────┼─────────────────────────────────┘
                      │ API Call
                      │
┌─────────────────────▼─────────────────────────────────┐
│                 BACKEND (Node.js/Express)              │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  POST /api/speech-to-text                    │    │
│  │  → Google Cloud STT                          │    │
│  └──────────────────┬───────────────────────────┘    │
│                     │                                  │
│  ┌──────────────────▼───────────────────────────┐    │
│  │  POST /api/speaking-agent/analyze            │    │
│  │  - detectGrammarErrors()                     │    │
│  │  - calculateScores()                         │    │
│  │  - generateFeedback()                        │    │
│  │  - generateExercises()                       │    │
│  │  → (optionnel) ollamaService.enhance()      │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
                      │
                      │ (optionnel)
                      │
┌─────────────────────▼─────────────────────────────────┐
│              OLLAMA (Local AI Model)                   │
│              http://localhost:11434                    │
│              llama2 / mistral / codellama             │
└────────────────────────────────────────────────────────┘
```

---

## Installation et Configuration

### 1. **Backend Setup**

```bash
cd backend
npm install
```

Ajouter dans `.env` :

```bash
# Google Cloud Speech-to-Text (requis)
GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json
# OU
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Ollama (optionnel)
ENABLE_OLLAMA=false
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 2. **Frontend Setup**

```bash
npm install
```

Les dépendances Capacitor sont déjà présentes.

### 3. **Android Setup**

```bash
npm run build
npx cap sync android
npx cap open android
```

Dans Android Studio : Build > Build APK

---

## Utilisation

### **Web**

1. Démarrer le backend : `./start_frontend_backend.sh start`
2. Ouvrir http://localhost:3000
3. Aller dans **"Speaking"** (menu de gauche)
4. Sélectionner un niveau (A2, B1, B2, C1)
5. Choisir un exercice
6. Cliquer sur **"Commencer l'enregistrement"**
7. Parler clairement dans le micro
8. Cliquer sur **"Arrêter"**
9. Consulter les résultats

### **Android**

1. Installer l'APK sur le device
2. Accepter la permission microphone
3. Suivre les mêmes étapes que sur Web

---

## API Backend

### **POST /api/speech-to-text**

Transcrit de l'audio en texte.

**Request:**
```json
{
  "audioContent": "base64_encoded_audio",
  "languageCode": "en-US",
  "sampleRateHertz": 48000,
  "encoding": "WEBM_OPUS"
}
```

**Response:**
```json
{
  "success": true,
  "transcript": "He goes to school every day",
  "confidence": 85,
  "words": [...]
}
```

### **POST /api/speaking-agent/analyze**

Analyse une phrase prononcée.

**Request:**
```json
{
  "transcript": "He go to school every day",
  "confidence": 0.85,
  "targetLevel": "B1"
}
```

**Response:**
```json
{
  "success": true,
  "originalTranscript": "He go to school every day",
  "correctedSentence": "He goes to school every day",
  "errors": [
    {
      "type": "subject_verb_agreement",
      "original": "He go",
      "corrected": "He goes",
      "explanation": "Avec he/she/it, il faut ajouter -s/-es au verbe...",
      "exceptions": ["Verbes modaux..."],
      "severity": "high"
    }
  ],
  "score": 75,
  "grammarScore": 70,
  "pronunciationScore": 85,
  "fluencyScore": 70,
  "feedback": "Très bien ! Quelques petites améliorations...",
  "recommendations": ["Révisez les règles de : subject verb agreement"],
  "suggestedExercises": [...]
}
```

### **POST /api/speaking-agent/exercises**

Génère des exercices par niveau.

**Request:**
```json
{
  "level": "B1",
  "focusAreas": ["grammar", "pronunciation"],
  "count": 5
}
```

### **POST /api/speaking-agent/correct**

Corrige une phrase avec explications.

**Request:**
```json
{
  "sentence": "I didn't went to the store",
  "level": "B1"
}
```

---

## Compatibilité Web et Android

### **Différences clés**

| Aspect              | Web                          | Android                      |
|---------------------|------------------------------|------------------------------|
| **Format audio**    | `audio/webm;codecs=opus`    | Auto-détecté (webm/mp4)     |
| **Config micro**    | Avancée (echo cancel, etc.)  | Simplifiée                  |
| **Permissions**     | Popup navigateur             | AndroidManifest.xml         |
| **Backend**         | localhost ou distant         | Doit être accessible réseau |

### **Code adaptatif**

Le composant `SpeakingExercise` détecte automatiquement la plateforme :

```typescript
const isNativePlatform = Capacitor.isNativePlatform();

// Configuration audio adaptée
const audioConstraints = isNativePlatform
  ? { audio: true }  // Android
  : { audio: { echoCancellation: true, ... } };  // Web
```

### **Test Android**

1. Connecter le device en USB
2. Activer le debug USB
3. Chrome DevTools : `chrome://inspect/#devices`
4. Logs : `adb logcat | grep SpeakingExercise`

---

## Ollama (optionnel)

### **Installation**

1. Télécharger : https://ollama.ai
2. Installer un modèle :
   ```bash
   ollama pull llama2
   # ou
   ollama pull mistral
   ```
3. Vérifier : `curl http://localhost:11434/api/tags`

### **Activation**

Dans `.env` :
```bash
ENABLE_OLLAMA=true
OLLAMA_MODEL=llama2
```

### **Avantages**

- Analyse grammaticale plus approfondie
- Feedback plus naturel et encourageant
- Génération d'exercices plus créatifs
- Fonctionne hors ligne (modèle local)

### **Fallback automatique**

Si Ollama n'est pas disponible, l'analyse basique prend le relais automatiquement.

---

## Dépannage

### **Permission microphone refusée**

**Web** : Vérifier les permissions du navigateur (🔒 dans la barre d'adresse)
**Android** : Paramètres > Applications > AI English Trainer > Permissions

### **Aucune transcription**

- Vérifier la connexion Internet
- Parler plus fort et clairement
- Vérifier que Google STT est configuré (credentials)

### **Format audio non supporté (Android)**

Le code détecte automatiquement le format. Vérifier les logs :
```bash
adb logcat | grep MediaRecorder
```

### **Backend inaccessible (Android)**

**Développement** :
- Le device doit être sur le même WiFi que le PC
- Utiliser l'IP du PC : `192.168.x.x:5010`

**Production** :
- Déployer le backend sur un serveur cloud
- Configurer l'URL dans `capacitor.config.ts`

### **Ollama ne répond pas**

```bash
# Vérifier que Ollama est démarré
ollama serve

# Vérifier les modèles installés
ollama list

# Tester l'API
curl http://localhost:11434/api/tags
```

---

## Fichiers importants

```
learning_english/
├── src/
│   ├── components/
│   │   └── exercises/
│   │       ├── SpeakingExercise.tsx         # Composant principal
│   │       └── SpeakingExerciseList.tsx     # Liste des exercices
│   ├── services/
│   │   └── speechToTextService.ts           # Service Google STT
│   └── agents/
│       └── speakingAgent.ts                 # Logique d'analyse (frontend)
├── backend/
│   ├── routes/
│   │   ├── speechToText.js                  # Route Google STT
│   │   └── speakingAgent.js                 # Routes agent IA
│   └── services/
│       └── ollamaService.js                 # Intégration Ollama
├── docs/
│   ├── SPEAKING_AGENT_SETUP.md              # Config Web
│   ├── ANDROID_SPEAKING_SETUP.md            # Config Android
│   └── SPEAKING_AGENT_GUIDE.md              # Ce guide
└── android/
    └── app/src/main/AndroidManifest.xml     # Permissions Android
```

---

## Prochaines améliorations

- [ ] Mode hors ligne avec TensorFlow Lite (Android)
- [ ] Analyse phonétique détaillée
- [ ] Historique des sessions avec graphiques de progression
- [ ] Comparaison avec des modèles de référence (locuteurs natifs)
- [ ] Intégration Google Assistant / Siri
- [ ] Gamification (badges, classements)
- [ ] Mode duo/groupe pour pratiquer avec d'autres utilisateurs

