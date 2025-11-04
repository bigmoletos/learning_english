# Guide : Créer l'APK Android

## ✅ Configuration terminée !

Tout est déjà configuré dans votre projet. Il vous suffit de suivre ces étapes sur votre machine locale.

## 📋 Prérequis

Sur votre machine de développement, vous avez besoin de :

1. **Node.js** (v16 ou supérieur)
2. **Android Studio** (ou au minimum Android SDK)
3. **Java JDK** (11 ou supérieur)

## 🚀 Étapes pour créer l'APK

### 1. Cloner/Pull le projet

```bash
git clone <votre-repo>
cd learning_english
git checkout claude/fix-android-mobile-011CUoToJFXJ9LTkwVAQDmGJ
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Builder l'application React

```bash
npm run build
```

### 4. Synchroniser avec Android

```bash
npx cap sync android
```

### 5. Créer l'APK

**Option A : Via Android Studio (recommandé)**

```bash
npx cap open android
```

Dans Android Studio :
1. Attendez que Gradle sync se termine
2. Menu → Build → Build Bundle(s) / APK(s) → Build APK(s)
3. L'APK sera dans : `android/app/build/outputs/apk/debug/app-debug.apk`

**Option B : Via ligne de commande**

```bash
cd android
./gradlew assembleDebug
```

L'APK sera créé dans : `android/app/build/outputs/apk/debug/app-debug.apk`

### 6. Installer l'APK sur votre téléphone

**Via ADB (Android Debug Bridge) :**

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Ou manuellement :**
1. Copiez le fichier `app-debug.apk` sur votre téléphone
2. Ouvrez-le depuis le gestionnaire de fichiers
3. Autorisez l'installation d'applications tierces si demandé
4. Installez l'app

## 📱 Tester l'application

1. Lancez "AI English Trainer" depuis votre écran d'accueil
2. Autorisez les permissions microphone quand demandé
3. Testez la reconnaissance vocale
4. Testez la synthèse vocale
5. Vérifiez que l'interface est bien responsive

## 🔧 Configuration Capacitor (déjà fait)

Voici ce qui a été configuré automatiquement :

### `capacitor.config.ts`
```typescript
{
  appId: 'com.aienglishtrainer.app',
  appName: 'AI English Trainer',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
}
```

### `AndroidManifest.xml`
Les permissions suivantes ont été ajoutées :
- ✅ `INTERNET`
- ✅ `RECORD_AUDIO` (pour reconnaissance vocale)
- ✅ `MODIFY_AUDIO_SETTINGS` (pour synthèse vocale)
- ✅ `WRITE_EXTERNAL_STORAGE`
- ✅ `READ_EXTERNAL_STORAGE`

## 📦 Structure du projet Android

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml  ← Permissions
│   │       ├── assets/
│   │       │   └── public/          ← Votre app React
│   │       ├── java/
│   │       └── res/                 ← Icônes et ressources
│   └── build/
│       └── outputs/
│           └── apk/
│               └── debug/
│                   └── app-debug.apk  ← VOTRE APK ICI !
└── build.gradle
```

## 🐛 Dépannage

### Problème : Gradle ne se télécharge pas
**Solution :** Vérifiez votre connexion Internet et proxy. Android Studio gérera automatiquement le téléchargement.

### Problème : Build échoue avec "SDK not found"
**Solution :**
1. Ouvrez Android Studio
2. SDK Manager → Installer Android SDK Platform 34 (ou supérieur)
3. Relancez le build

### Problème : "Command not found: adb"
**Solution :**
1. Ajoutez Android SDK platform-tools à votre PATH
2. Ou utilisez l'installation manuelle de l'APK

### Problème : L'app se ferme immédiatement au lancement
**Solution :**
1. Vérifiez les logs : `adb logcat | grep "AI English"`
2. Vérifiez que vous avez bien fait `npm run build` avant `npx cap sync`

### Problème : Le microphone ne fonctionne pas
**Solution :**
1. Vérifiez les permissions dans Paramètres → Apps → AI English Trainer
2. Assurez-vous d'utiliser HTTPS ou localhost
3. Chrome Android est requis pour Web Speech API

## 🎨 Personnalisation (optionnel)

### Changer l'icône de l'app

1. Remplacez les icônes dans `android/app/src/main/res/mipmap-*/ic_launcher.png`
2. Ou utilisez : https://icon.kitchen/

### Changer le nom de l'app

Modifiez `android/app/src/main/res/values/strings.xml` :
```xml
<string name="app_name">Votre Nom</string>
```

### Changer le package ID

Modifiez `capacitor.config.ts` :
```typescript
appId: 'com.votredomaine.app'
```

Puis :
```bash
npx cap sync android
```

## 📊 Taille de l'APK attendue

- **APK Debug** : ~10-15 MB
- **APK Release (signé)** : ~8-12 MB (après optimisation)

## 🚀 Créer un APK Release (pour distribution)

Pour créer un APK optimisé et signé :

### 1. Générer une keystore
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurer le signing dans `android/app/build.gradle`
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("my-release-key.keystore")
            storePassword "votre_password"
            keyAlias "my-key-alias"
            keyPassword "votre_password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Builder l'APK release
```bash
cd android
./gradlew assembleRelease
```

L'APK sera dans : `android/app/build/outputs/apk/release/app-release.apk`

## 📱 Distribution

### Google Play Store
1. Créez un compte développeur Google Play (25$ unique)
2. Créez une nouvelle application
3. Uploadez votre APK release (ou mieux : un AAB bundle)
4. Remplissez les informations de l'app
5. Soumettez pour review

### Distribution directe (Beta testing)
- Envoyez directement l'APK à vos testeurs
- Ou utilisez Firebase App Distribution (gratuit)

## ✅ Checklist finale

Avant de distribuer l'APK, vérifiez :

- [ ] L'app se lance correctement
- [ ] Les permissions microphone fonctionnent
- [ ] La reconnaissance vocale fonctionne
- [ ] La synthèse vocale fonctionne
- [ ] L'interface est responsive sur différents écrans
- [ ] Pas de crash au lancement
- [ ] Toutes les fonctionnalités sont accessibles
- [ ] L'app fonctionne hors ligne (ou affiche un message approprié)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `adb logcat`
2. Vérifiez la console Chrome : chrome://inspect
3. Consultez la documentation Capacitor : https://capacitorjs.com
4. Vérifiez les issues GitHub du projet

## 📚 Ressources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com)
- [Gradle Build Guide](https://gradle.org/guides/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

**Note** : Cette application est déjà 100% optimisée pour Android mobile avec tous les hooks audio corrigés, les permissions configurées, et l'interface responsive !

Bonne chance avec votre build ! 🚀
