# Guide de Build Android avec Capacitor

## Prérequis

1. **Android Studio** : Installé avec Android SDK
2. **Java JDK** : Version 11 ou supérieure
3. **Node.js** : Version 16 ou supérieure
4. **Variables Firebase** : Configurées dans `.env`

## Configuration Firebase

1. Créer un projet Firebase sur [Firebase Console](https://console.firebase.google.com/)
2. Ajouter une application Android dans Firebase
3. Télécharger le fichier `google-services.json` et le placer dans `android/app/`
4. Ajouter les variables Firebase dans votre fichier `.env` :

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Build de l'Application

### Étape 1 : Build React

```bash
npm run build
```

### Étape 2 : Synchroniser avec Capacitor

```bash
npm run cap:sync
# ou
npx cap sync android
```

Cette commande :
- Copie le build React dans le projet Android
- Synchronise les plugins Capacitor
- Met à jour les dépendances natives

### Étape 3 : Ouvrir dans Android Studio

```bash
npm run cap:open
# ou
npx cap open android
```

### Étape 4 : Build dans Android Studio

1. Ouvrir Android Studio
2. Attendre la synchronisation Gradle
3. Connecter un appareil Android ou lancer un émulateur
4. Cliquer sur "Run" (▶️) ou appuyer sur `Shift+F10`

## Configuration Android

### Permissions dans AndroidManifest.xml

Les permissions suivantes sont automatiquement ajoutées par Capacitor :
- `INTERNET` : Pour les requêtes réseau
- `CAMERA` : Pour la reconnaissance vocale (si nécessaire)
- `RECORD_AUDIO` : Pour l'enregistrement audio

### Configuration du Package Name

Le package name est défini dans `capacitor.config.ts` :
- `appId: 'com.learningenglish.app'`

Pour le modifier, éditez `capacitor.config.ts` et resynchronisez :
```bash
npx cap sync android
```

### Signature de l'APK/AAB

Pour générer un APK signé :

1. Dans Android Studio : `Build > Generate Signed Bundle / APK`
2. Choisir `Android App Bundle` (pour Play Store) ou `APK`
3. Créer un keystore si nécessaire
4. Suivre les instructions

## Commandes Utiles

```bash
# Build et synchroniser en une commande
npm run cap:sync

# Ouvrir Android Studio
npm run cap:open

# Tout en une commande
npm run cap:run

# Vérifier la configuration Capacitor
npx cap doctor
```

## Dépannage

### Erreur : "Missing build directory"
- Exécuter `npm run build` avant `npx cap sync`

### Erreur : "Gradle sync failed"
- Vérifier que Android Studio est à jour
- Vérifier la connexion internet (Gradle télécharge les dépendances)
- Nettoyer le projet : `Build > Clean Project`

### Erreur Firebase : "Missing google-services.json"
- Télécharger depuis Firebase Console
- Placer dans `android/app/google-services.json`

### L'application ne se connecte pas au backend
- Vérifier que l'URL API est accessible depuis l'appareil
- Utiliser l'adresse IP locale au lieu de `localhost` pour les tests
- Vérifier les règles CORS du backend

## Structure du Projet Android

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/
│   │       └── res/
│   ├── build.gradle
│   └── google-services.json (à ajouter)
├── build.gradle
└── settings.gradle
```

## Prochaines Étapes

1. Tester l'application sur un appareil réel
2. Configurer les règles Firestore dans Firebase Console
3. Tester la synchronisation des données
4. Optimiser les performances
5. Publier sur Google Play Store

## Notes Importantes

- Le build React doit être régénéré après chaque modification du code frontend
- Les modifications natives nécessitent Android Studio
- La synchronisation Capacitor copie les fichiers, ne modifiez pas directement `android/app/src/main/assets/public/`









