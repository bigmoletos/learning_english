# Guide : Synthèse Vocale (Text-to-Speech)

**Date** : 31 octobre 2025  
**Version** : 1.0.0  
**Statut** : ✅ OPÉRATIONNEL

---

## 🎯 Vue d'ensemble

La **synthèse vocale (Text-to-Speech)** est maintenant entièrement fonctionnelle dans l'application ! 

Cette fonctionnalité utilise l'**API Web Speech Synthesis** native des navigateurs modernes pour lire les textes anglais à voix haute.

---

## 🔊 Où trouver la synthèse vocale ?

### 1. Section Listening de l'évaluation

**Chemin** : Évaluation initiale → Section Listening (6 questions)

**Description** :
- Chaque question de listening affiche une **zone bleue avec un bouton Play**
- Le texte anglais est affiché dans un encadré blanc
- Un grand bouton circulaire permet de lancer/arrêter la lecture

**Interface** :
```
┌─────────────────────────────────────────────┐
│ 🔊 Section d'écoute                [▶️]    │
├─────────────────────────────────────────────┤
│ "The system was deployed yesterday."        │
├─────────────────────────────────────────────┤
│ 💡 Cliquez sur le bouton lecture pour      │
│    entendre le texte en anglais             │
└─────────────────────────────────────────────┘
```

---

## 🎛️ Fonctionnalités

### Bouton Play/Stop

- **▶️ Play** : Démarre la lecture du texte en anglais
- **⏹️ Stop** : Arrête immédiatement la lecture
- Le bouton change automatiquement d'icône selon l'état

### Voix anglaise automatique

- Le système sélectionne automatiquement une voix anglaise de qualité
- Priorité : Google/Microsoft English voices
- Langue : en-US (anglais américain)

### Vitesse de lecture

- Par défaut : **1.0x** (vitesse normale)
- Réglable de 0.5x (lent) à 2.0x (rapide)

### Volume

- Par défaut : **100%**
- Réglable de 0% (muet) à 100% (maximum)

---

## 🌐 Compatibilité navigateurs

### ✅ Navigateurs supportés

| Navigateur | Version minimale | Qualité vocale | Statut |
|------------|------------------|----------------|--------|
| **Chrome** | 33+ | ⭐⭐⭐⭐⭐ Excellente | ✅ Recommandé |
| **Edge** | 14+ | ⭐⭐⭐⭐⭐ Excellente | ✅ Recommandé |
| **Safari** | 7+ | ⭐⭐⭐⭐ Très bonne | ✅ Supporté |
| **Firefox** | 49+ | ⭐⭐⭐ Bonne | ✅ Supporté |
| **Opera** | 21+ | ⭐⭐⭐⭐ Très bonne | ✅ Supporté |

### ❌ Navigateurs non supportés

- Internet Explorer (toutes versions)
- Anciens navigateurs (<2016)

---

## 📱 Support mobile

### Android

✅ **Chrome Mobile** : Excellent support  
✅ **Firefox Mobile** : Support complet  
✅ **Samsung Internet** : Très bon support  

### iOS

✅ **Safari Mobile** : Support natif excellent  
✅ **Chrome iOS** : Utilise le moteur Safari, fonctionne bien  

---

## 🎓 Utilisation dans l'évaluation

### Étape par étape

1. **Lancer l'évaluation**
   - Cliquez sur "Refaire l'évaluation" dans le tableau de bord
   - OU passez l'évaluation initiale

2. **Arriver à la section Listening**
   - Les 6 premières questions sont de type "Listening"
   - Chaque question affiche une zone bleue audio

3. **Écouter le texte**
   - Cliquez sur le bouton **▶️ Play** (grand bouton blanc circulaire)
   - Le texte est lu à voix haute en anglais
   - L'icône change en **⏹️ Stop** pendant la lecture

4. **Arrêter la lecture** (optionnel)
   - Cliquez sur **⏹️ Stop** pour interrompre
   - Ou laissez la lecture se terminer automatiquement

5. **Répéter l'écoute**
   - Vous pouvez cliquer autant de fois que nécessaire
   - Chaque clic relance la lecture depuis le début

6. **Répondre à la question**
   - Sélectionnez votre réponse dans les options proposées
   - Cliquez sur "Suivant" pour passer à la question suivante

---

## 🔧 Fonctionnalités techniques

### Hook personnalisé : `useTextToSpeech`

Un hook React réutilisable a été créé pour gérer la synthèse vocale.

**Fichier** : `src/hooks/useTextToSpeech.ts`

**Fonctions disponibles** :

```typescript
const {
  speak,          // Lire un texte
  stop,           // Arrêter la lecture
  pause,          // Mettre en pause
  resume,         // Reprendre
  isSpeaking,     // État : en cours de lecture
  isPaused,       // État : en pause
  isSupported,    // Navigateur compatible ?
  voices,         // Liste des voix disponibles
  setVoice,       // Changer de voix
  setRate,        // Changer la vitesse
  setPitch,       // Changer la tonalité
  setVolume       // Changer le volume
} = useTextToSpeech();
```

### Composant réutilisable : `AudioPlayer`

Un composant prêt à l'emploi pour lire des textes.

**Fichier** : `src/components/voice/AudioPlayer.tsx`

**Utilisation** :

```tsx
import { AudioPlayer } from "./components/voice/AudioPlayer";

<AudioPlayer
  text="The system was deployed yesterday."
  lang="en-US"
  title="Section d'écoute"
  showControls={true}
  autoPlay={false}
/>
```

**Props disponibles** :

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `text` | string | **requis** | Texte à lire |
| `lang` | string | "en-US" | Code langue |
| `title` | string | undefined | Titre optionnel |
| `showControls` | boolean | true | Afficher vitesse/volume |
| `autoPlay` | boolean | false | Lecture automatique |

---

## 💡 Conseils d'utilisation

### Pour les apprenants

1. **Écoutez plusieurs fois**
   - La première fois : compréhension générale
   - La deuxième fois : détails et prononciation
   - La troisième fois : vérification avant de répondre

2. **Utilisez la répétition**
   - Répétez à voix haute après le lecteur
   - Imitez la prononciation et l'intonation

3. **Concentrez-vous**
   - Fermez les yeux pour mieux vous concentrer
   - Prenez des notes si nécessaire

### Pour ajuster la vitesse (futur)

- **Débutants** : 0.8x - 0.9x (plus lent)
- **Intermédiaires** : 1.0x (normal)
- **Avancés** : 1.2x - 1.5x (plus rapide)

---

## 🐛 Dépannage

### Problème : Aucun son

**Solutions** :

1. **Vérifier le volume**
   - Volume du système (ordinateur/téléphone) > 50%
   - Volume du navigateur non muté
   - Onglet du navigateur non muté

2. **Vérifier le navigateur**
   - Utilisez Chrome, Edge ou Safari
   - Mettez à jour votre navigateur à la dernière version

3. **Permissions**
   - Certains navigateurs demandent l'autorisation pour la synthèse vocale
   - Acceptez les permissions si demandées

4. **Redémarrer**
   - Rafraîchissez la page (F5)
   - Fermez et rouvrez l'onglet

---

### Problème : Message "Navigateur non supporté"

**Solutions** :

1. Passez à un navigateur moderne (Chrome, Edge, Safari)
2. Mettez à jour votre navigateur actuel
3. Sur mobile : utilisez Chrome (Android) ou Safari (iOS)

---

### Problème : La voix est robotique

**Explication** : Certaines voix système sont de qualité basique.

**Solutions** :

1. **Chrome/Edge** : Installent automatiquement des voix de haute qualité
2. **Firefox** : La qualité dépend du système d'exploitation
3. **Safari** : Utilise les voix système macOS/iOS (généralement excellentes)

**Amélioration future** : Sélection manuelle de la voix préférée

---

### Problème : La lecture s'arrête au milieu

**Causes possibles** :

1. Vous avez cliqué sur Stop
2. Vous avez changé de page
3. Le navigateur a mis l'onglet en veille

**Solutions** :

1. Cliquez à nouveau sur Play
2. Gardez l'onglet actif pendant la lecture

---

## 🎨 Personnalisation future

### Fonctionnalités prévues

- [ ] Sélection manuelle de la voix
- [ ] Contrôles de vitesse visibles (slider)
- [ ] Contrôles de volume visibles (slider)
- [ ] Sauvegarde des préférences (voix, vitesse, volume)
- [ ] Sous-titres synchronisés
- [ ] Pause/Reprise (au lieu de Stop)
- [ ] Barre de progression
- [ ] Lecture automatique au lancement de la question

---

## 📊 Statistiques d'utilisation

### Textes disponibles pour écoute

| Type | Quantité | Langue |
|------|----------|--------|
| Questions d'évaluation (Listening) | 6 | Anglais |
| Textes d'exercices (future) | 100+ | Anglais |
| Documents techniques (future) | 100+ | Anglais |

---

## 🔬 Détails techniques

### API utilisée

**Web Speech API - SpeechSynthesis**

```javascript
// Exemple de code
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-US';
utterance.rate = 1.0;
utterance.pitch = 1.0;
utterance.volume = 1.0;
window.speechSynthesis.speak(utterance);
```

### Événements gérés

- `onstart` : Début de la lecture
- `onend` : Fin de la lecture
- `onerror` : Erreur de lecture
- `onpause` : Mise en pause
- `onresume` : Reprise

### Sélection automatique de la voix

Le système recherche dans l'ordre :

1. Voix Google English (qualité maximale)
2. Voix Microsoft English (qualité excellente)
3. Première voix anglaise disponible (fallback)

---

## ✅ Checklist de test

Pour vérifier que la synthèse vocale fonctionne :

- [ ] Navigateur compatible (Chrome/Edge/Safari)
- [ ] Volume système activé (>50%)
- [ ] Lancer l'évaluation
- [ ] Arriver à la section Listening
- [ ] Voir la zone bleue avec bouton Play
- [ ] Cliquer sur Play → **SON AUDIBLE** ✅
- [ ] Entendre le texte en anglais
- [ ] Cliquer sur Stop → le son s'arrête
- [ ] Re-cliquer sur Play → le son reprend depuis le début

---

## 📚 Ressources

### Documentation officielle

- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechSynthesis - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [SpeechSynthesisUtterance - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance)

### Support navigateurs

- [Can I Use - Speech Synthesis](https://caniuse.com/speech-synthesis)

---

## 🎯 Utilisation avancée

### Pour les développeurs

#### Importer le hook

```typescript
import { useTextToSpeech } from "./hooks/useTextToSpeech";
```

#### Exemple d'utilisation simple

```typescript
const MyComponent = () => {
  const { speak, stop, isSpeaking } = useTextToSpeech();

  return (
    <button onClick={() => speak("Hello world", "en-US")}>
      {isSpeaking ? "Stop" : "Play"}
    </button>
  );
};
```

#### Exemple avec contrôles

```typescript
const MyComponent = () => {
  const { speak, setRate, setVolume } = useTextToSpeech();

  const handleSpeak = () => {
    setRate(1.2); // 20% plus rapide
    setVolume(0.8); // Volume à 80%
    speak("Technical debt occurs when...", "en-US");
  };

  return <button onClick={handleSpeak}>Speak</button>;
};
```

---

## 🚀 Prochaines étapes

1. **Intégrer TTS dans les exercices**
   - Lecture des énoncés
   - Lecture des textes de compréhension

2. **Intégrer TTS dans les documents techniques**
   - Lecture complète des 100 documents
   - Navigation par paragraphe

3. **Améliorer l'interface**
   - Sliders de vitesse et volume visibles
   - Barre de progression
   - Sous-titres synchronisés

4. **Sauvegarder les préférences**
   - Voix favorite
   - Vitesse préférée
   - Volume par défaut

---

**Status** : 🟢 PLEINEMENT OPÉRATIONNEL

Dernière mise à jour : 31 octobre 2025, 11:30

**Testez dès maintenant sur http://localhost:3000 !**

**Le son fonctionne maintenant ! 🔊** 🎉

