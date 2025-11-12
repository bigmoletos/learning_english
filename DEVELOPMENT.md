# Guide du développeur

> Architecture, fonctionnalités et bonnes pratiques

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│  - Components   │
│  - Hooks        │
│  - Services     │
└────────┬────────┘
         │
         ├──► Firebase (Auth + Firestore)
         │
         ├──► Google Cloud TTS API
         │
         └──► Backend Express (Port 5010)
              - SQLite Database
              - JWT Authentication
              - Progress Tracking
```

### Technologies

**Frontend**
- React 18.2 + TypeScript 4.9
- Material-UI 5.14 (components)
- Firebase SDK (auth, firestore)
- Web Speech API (reconnaissance vocale)
- Axios (HTTP client)

**Backend**
- Express 4.18
- Sequelize ORM + SQLite
- JWT (jsonwebtoken)
- Winston (logging)
- Helmet (sécurité)

---

## 📁 Structure des dossiers

```
src/
├── agents/
│   └── speakingAgent.ts         # IA de correction grammaticale
├── components/
│   ├── auth/                    # Authentification
│   ├── speaking/                # Mode conversationnel
│   │   └── ConversationalSpeaking.tsx
│   ├── exercises/               # Exercices
│   └── layout/                  # Layout global
├── hooks/
│   ├── useSpeechRecognition.ts  # Hook reconnaissance vocale
│   └── useTextToSpeech.ts       # Hook synthèse vocale
├── services/
│   ├── firebase/                # Services Firebase
│   │   ├── config.ts
│   │   ├── userService.ts
│   │   └── progressService.ts
│   ├── speechToTextService.ts   # STT wrapper
│   └── textToSpeechService.ts   # TTS wrapper
└── types/
    └── index.ts                 # Types TypeScript

backend/
├── routes/
│   ├── auth.js                  # Authentification
│   ├── users.js                 # Gestion utilisateurs
│   ├── progress.js              # Progression
│   └── textToSpeech.js          # Endpoint TTS
├── database/
│   ├── connection.js            # Sequelize config
│   ├── models/                  # Modèles DB
│   └── learning_english.db      # SQLite DB
└── server.js                    # Point d'entrée
```

---

## 🎯 Fonctionnalités détaillées

### 1. Mode Conversationnel (ConversationalSpeaking)

**Composant** : `src/components/speaking/ConversationalSpeaking.tsx`

**Fonctionnement** :
1. L'utilisateur clique sur le micro → `startListening()`
2. Web Speech API capture la voix en continu
3. Détection de fin de phrase (ponctuation OU pause de 2s)
4. Le transcript est envoyé à `speakingAgent.analyzeSpeaking()`
5. L'agent retourne : corrections, score, feedback
6. Le feedback est lu par Google Cloud TTS

**Hooks utilisés** :
```typescript
const {
  transcript,           // Texte reconnu
  listening,           // État du micro
  startListening,      // Démarrer
  stopListening,       // Arrêter
  confidence          // Niveau de confiance (0-1)
} = useSpeechRecognition();
```

**Détection de pause** :
```typescript
// Dans ConversationalSpeaking.tsx ligne 314-323
pauseTimerRef.current = setTimeout(() => {
  if (transcript.trim().length >= 3) {
    analyzeAndCorrect(transcript.trim());
  }
}, 2000); // 2 secondes de pause
```

### 2. Agent IA de correction

**Fichier** : `src/agents/speakingAgent.ts`

**Erreurs détectées** :
- Subject-verb agreement (he go → he goes)
- Articles (a apple → an apple)
- Quantifiers (much people → many people)
- Double negatives (didn't went → didn't go)
- Modals + infinitive
- Present perfect vs past simple
- Conditional structures
- Et plus...

**Exemple d'utilisation** :
```typescript
const analysis = await speakingAgent.analyzeSpeaking(
  "He don't like apples",  // Transcript
  0.95,                    // Confidence
  "B1"                     // Niveau cible
);

// Résultat :
{
  originalTranscript: "He don't like apples",
  correctedSentence: "He doesn't like apples",
  errors: [{
    type: "subject_verb_agreement",
    original: "He don't",
    corrected: "He doesn't",
    explanation: "Avec he/she/it, utilisez doesn't au lieu de don't",
    severity: "high"
  }],
  score: 75,
  feedback: "Bonne phrase ! Attention à l'accord sujet-verbe.",
  recommendations: ["Pratiquer les auxiliaires avec la 3e personne"]
}
```

### 3. Services Firebase

**Authentication** :
```typescript
// src/services/firebase/userService.ts
await createUserWithEmailAndPassword(auth, email, password);
await signInWithEmailAndPassword(auth, email, password);
await signOut(auth);
```

**Firestore (Progression)** :
```typescript
// Sauvegarder la progression
await progressService.saveProgress(userId, {
  exerciseId: "grammar_01",
  score: 85,
  completedAt: new Date(),
  errors: [...]
});

// Récupérer les stats
const stats = await progressService.getStats(userId);
```

### 4. Google Cloud TTS

**Service** : `src/services/textToSpeechService.ts`

```typescript
// Synthétiser du texte
const audioUrl = await textToSpeechService.synthesize({
  text: "Hello, how are you?",
  lang: "en-US",
  rate: 1.0  // Vitesse (0.5 à 2.0)
});

// Jouer l'audio
const audio = new Audio(audioUrl);
await audio.play();
```

**Cache** : Les audios sont mis en cache pour optimiser les requêtes.

---

## 🧪 Tests

### Frontend

```bash
# Lancer tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

**Fichiers de test** :
- `src/services/speechToTextService.test.ts`
- `src/agents/speakingAgent.test.ts`
- `src/components/**/*.test.tsx`

### Backend

```bash
cd backend
npm test
```

### Tests E2E (Cypress)

```bash
# Mode interactif
npm run test:e2e:open

# Mode headless
npm run test:e2e
```

---

## 📝 Conventions de code

### TypeScript

```typescript
// ✅ Bon : Types explicites
interface User {
  id: string;
  email: string;
  displayName: string;
}

// ❌ Mauvais : any
const user: any = ...;
```

### Composants React

```typescript
// ✅ Bon : Functional component + TypeScript
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>...</div>;
};

// ❌ Mauvais : Class component
class MyComponent extends React.Component { ... }
```

### Hooks

```typescript
// ✅ Bon : Custom hook avec return typé
export const useMyHook = (): UseMyHookReturn => {
  const [state, setState] = useState<string>("");
  // ...
  return { state, setState };
};
```

### Commits

```bash
# Format : type(scope): description

feat(speaking): ajout détection de pause automatique
fix(tts): correction bug cache audio
docs(readme): mise à jour installation
refactor(agent): simplification logique d'erreurs
test(speaking): ajout tests unitaires
```

---

## 🔒 Sécurité

### Variables d'environnement

- ❌ **JAMAIS** commit `.env` ou credentials
- ✅ Utiliser `.env.example` comme template
- ✅ Ajouter `.env` et `credentials/` dans `.gitignore`

### Firebase Rules

- ✅ Toujours valider `request.auth != null`
- ✅ Vérifier que `request.auth.uid == userId`
- ❌ Ne jamais utiliser `allow read, write: if true;` en prod

### Backend

- ✅ JWT avec secret fort (>= 32 caractères)
- ✅ Rate limiting sur les routes d'auth
- ✅ Helmet pour les headers de sécurité
- ✅ CORS configuré avec origines spécifiques

---

## 🐛 Debugging

### React DevTools

```bash
# Installer l'extension Chrome
# Puis dans la console :
console.log(localStorage.getItem('token'));
```

### Firebase

```typescript
// Activer les logs
import { enableFirebaseDebug } from './services/firebase/config';
enableFirebaseDebug();
```

### Backend

```bash
# Logs Winston dans backend/logs/
tail -f backend/logs/app.log
```

### Problèmes courants

**1. Reconnaissance vocale ne fonctionne pas**
```typescript
// Vérifier les permissions
navigator.permissions.query({name: 'microphone'})
  .then(result => console.log(result.state));
```

**2. TTS ne fonctionne pas**
```bash
# Vérifier les credentials
export GOOGLE_APPLICATION_CREDENTIALS="/chemin/absolu/credentials.json"
node -e "console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)"
```

**3. Firebase auth failed**
```typescript
// Vérifier la config
console.log(process.env.REACT_APP_FIREBASE_API_KEY);
```

---

## 📚 Ressources

- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI](https://mui.com/material-ui/)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Google Cloud TTS](https://cloud.google.com/text-to-speech/docs)

---

## 🚀 Contribuer

1. **Fork** le projet
2. **Créer une branche** : `git checkout -b feature/ma-feature`
3. **Coder** en suivant les conventions
4. **Tester** : `npm test` + `npm run lint`
5. **Commit** : `git commit -m "feat: ma feature"`
6. **Push** : `git push origin feature/ma-feature`
7. **Pull Request** avec description détaillée

---

## 📞 Support

- **Issues GitHub** : Bugs et feature requests
- **Email** : admin@iaproject.fr
- **Documentation** : [README.md](README.md), [SETUP.md](SETUP.md)
