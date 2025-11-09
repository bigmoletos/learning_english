# Configuration de l'agent Speaking pour Android

**Version** : 1.0.0
**Date** : 09-11-2025

## Vue d'ensemble

L'agent IA Speaking fonctionne de manière transparente sur Web et Android grâce à Capacitor. Le code détecte automatiquement la plateforme et adapte la configuration.

## Permissions Android

Les permissions suivantes sont déjà configurées dans `AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

## Différences Web vs Android

### 1. **Enregistrement audio**

#### Web
- Utilise `MediaRecorder` avec codec Opus
- Format : `audio/webm;codecs=opus`
- Configuration avancée : echo cancellation, noise suppression

#### Android
- Détecte automatiquement les formats supportés
- Ordre de préférence :
  1. `audio/webm;codecs=opus`
  2. `audio/webm`
  3. `audio/mp4`
  4. Format par défaut du système
- Configuration simplifiée pour éviter les incompatibilités

### 2. **Transcription Google STT**

#### Identique sur les deux plateformes
- Le backend gère la transcription
- Le format audio est automatiquement détecté
- Conversion base64 pour l'envoi au backend

### 3. **Interface utilisateur**

#### Web
- Responsive design adapté au desktop
- Survol des boutons
- Clavier disponible

#### Android
- Zones tactiles optimisées (44x44px minimum)
- Feedback tactile sur les boutons
- Interface adaptée aux écrans tactiles

## Build Android

### 1. Synchroniser les modifications

```bash
# Synchroniser le code avec Android
npm run build
npx cap sync android
```

### 2. Ouvrir dans Android Studio

```bash
npx cap open android
```

### 3. Tester sur émulateur ou device

1. Dans Android Studio : Run > Run 'app'
2. Sélectionner un émulateur ou un device physique
3. Accepter les permissions microphone lors du premier lancement

### 4. Build APK

```bash
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Test sur Android

### Permissions runtime

Au premier lancement de l'exercice de speaking, l'utilisateur doit :
1. Cliquer sur "Commencer l'enregistrement"
2. Accepter la permission microphone dans la popup Android
3. Parler clairement
4. Cliquer sur "Arrêter"

### Problèmes courants

#### 1. Permission refusée
**Symptôme** : "Permission microphone refusée"
**Solution** :
- Aller dans Paramètres > Applications > AI English Trainer > Permissions
- Activer "Microphone"

#### 2. Format audio non supporté
**Symptôme** : Erreur lors de l'enregistrement
**Solution** :
- Le code détecte automatiquement le format supporté
- Vérifier les logs : `adb logcat | grep SpeakingExercise`

#### 3. Transcription échoue
**Symptôme** : "Aucune transcription disponible"
**Solution** :
- Vérifier la connexion Internet
- Parler plus fort et plus clairement
- Vérifier que le backend est accessible depuis le device

#### 4. Latence réseau
**Symptôme** : Temps de traitement long
**Solution** :
- Utiliser le WiFi plutôt que les données mobiles
- Le backend doit être accessible localement ou via un serveur distant rapide

## Debug Android

### Logs Chrome DevTools

1. Connecter le device via USB
2. Activer le debug USB sur le device
3. Ouvrir Chrome : `chrome://inspect/#devices`
4. Sélectionner l'application
5. Console disponible pour voir les logs

### Logs Android Studio

```bash
# Filtrer les logs de l'application
adb logcat | grep "AIEnglishTrainer"

# Filtrer les logs du composant Speaking
adb logcat | grep "SpeakingExercise"
```

## Configuration backend pour Android

### Option 1 : Backend local (développement)

Si le device est sur le même réseau :

```bash
# Trouver l'IP de votre PC
ipconfig  # Windows
ifconfig  # Linux/Mac

# Exemple : 192.168.1.100
```

Modifier `src/setupProxy.js` pour permettre les connexions depuis le réseau local :

```javascript
target: 'http://192.168.1.100:5010',
```

### Option 2 : Backend distant (production)

Déployer le backend sur un serveur cloud :
- Heroku
- Google Cloud Run
- AWS Lambda
- Firebase Functions

Configurer l'URL dans `capacitor.config.ts` :

```typescript
server: {
  url: 'https://your-backend.herokuapp.com',
  cleartext: true
}
```

## Optimisations Android

### 1. Taille de l'APK

Activer ProGuard pour réduire la taille :

```gradle
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 2. Performance

- Les exercices de speaking utilisent des composants optimisés
- Le traitement audio est fait côté serveur pour économiser la batterie
- Les résultats sont mis en cache localement

### 3. Hors ligne (futur)

Pour permettre l'utilisation hors ligne :
1. Implémenter un cache local pour les exercices
2. Utiliser un modèle IA léger sur le device (TensorFlow Lite)
3. Synchroniser les résultats lors de la reconnexion

## Checklist de test Android

- [ ] Permission microphone accordée
- [ ] Enregistrement audio fonctionne
- [ ] Format audio détecté automatiquement
- [ ] Transcription reçue du backend
- [ ] Analyse IA affichée correctement
- [ ] Scores calculés et affichés
- [ ] Corrections visibles avec explications
- [ ] Exercices suggérés chargés
- [ ] Navigation fluide
- [ ] Pas de crash ou freeze

## Prochaines améliorations Android

- [ ] Support du mode sombre natif
- [ ] Notifications pour rappeler la pratique quotidienne
- [ ] Widget Android pour accès rapide
- [ ] Mode hors ligne avec TensorFlow Lite
- [ ] Intégration Google Assistant

