# 🚀 Serveurs en cours d'exécution

## ✅ Status des serveurs

### Backend (Node.js/Express)
- **Status:** ✅ En cours d'exécution
- **PID:** 24678
- **Port:** 5000
- **Logs:** `/home/user/learning_english/backend/backend.log`
- **Health check:** http://21.0.0.112:5000/health

### Frontend (React)
- **Status:** ✅ En cours d'exécution
- **PID:** 26738
- **Port:** 3000
- **Logs:** `/home/user/learning_english/frontend.log`
- **Compilé:** ✅ webpack compiled with 1 warning

## 📱 Accès depuis votre smartphone Android

### URLs d'accès

**Assurez-vous que votre smartphone et le serveur sont sur le même réseau WiFi**

#### Option 1 : Via IP du serveur (recommandé)
```
http://21.0.0.112:3000
```

#### Option 2 : Via localhost (si vous testez directement sur le serveur)
```
http://localhost:3000
```

### 📋 Instructions pour tester depuis Chrome Android

1. **Connectez votre smartphone au même réseau WiFi que le serveur**

2. **Ouvrez Chrome sur votre smartphone Android**

3. **Entrez l'URL dans la barre d'adresse:**
   ```
   http://21.0.0.112:3000
   ```

4. **Autorisez les permissions microphone** quand l'application le demande

5. **Testez les fonctionnalités:**
   - ✅ Inscription/Connexion
   - ✅ Navigation responsive
   - ✅ Reconnaissance vocale (bouton microphone)
   - ✅ Synthèse vocale (bouton lecture audio)
   - ✅ Zones tactiles (boutons suffisamment grands)
   - ✅ Tests TOEIC/TOEFL/EFSET

### ⚠️ Important pour la reconnaissance vocale

La **Web Speech API** utilisée pour la reconnaissance vocale a des exigences :

1. **HTTPS ou localhost requis** - Actuellement en HTTP, la reconnaissance vocale peut ne pas fonctionner sur réseau distant
2. **Chrome Android recommandé** - Meilleur support de l'API
3. **Connexion Internet** - L'API utilise les serveurs Google

**Solution si la reconnaissance vocale ne fonctionne pas en HTTP :**
- Tester directement sur le serveur (localhost)
- Ou configurer HTTPS (certificat SSL)
- Ou utiliser l'APK natif créé avec Capacitor (voir BUILD_APK_GUIDE.md)

## 🔍 Vérifier l'état des serveurs

### Vérifier que les serveurs tournent
```bash
ps aux | grep -E "(node server.js|react-scripts start)" | grep -v grep
```

### Tester le backend
```bash
curl http://localhost:5000/health
```
Réponse attendue :
```json
{
  "status": "OK",
  "message": "API AI English Trainer opérationnelle",
  "timestamp": "2025-11-04T20:46:13.054Z",
  "environment": "development"
}
```

### Tester le frontend
```bash
curl -I http://localhost:3000
```
Réponse attendue : HTTP/1.1 200 OK

## 📊 Consulter les logs en temps réel

### Backend logs
```bash
tail -f /home/user/learning_english/backend/backend.log
```

### Frontend logs
```bash
tail -f /home/user/learning_english/frontend.log
```

## 🛑 Arrêter les serveurs

### Arrêter le backend
```bash
kill 24678
```

### Arrêter le frontend
```bash
kill 26738
# Ou si plusieurs processus
pkill -f "react-scripts start"
```

### Arrêter les deux
```bash
kill 24678 26738
```

## 🔄 Redémarrer les serveurs

### Redémarrer le backend
```bash
cd /home/user/learning_english/backend
node server.js > backend.log 2>&1 &
```

### Redémarrer le frontend
```bash
cd /home/user/learning_english
HOST=0.0.0.0 PORT=3000 npm start > frontend.log 2>&1 &
```

## 🌐 Configuration réseau

### IP du serveur
```
21.0.0.112
```

### Ports utilisés
- **3000** - Frontend React (accessible depuis le réseau)
- **5000** - Backend API (accessible depuis le réseau)

### CORS configuré
Le backend autorise les requêtes depuis :
- `http://localhost:3000` (défini dans .env)
- Toutes les origines en développement

## 📝 Notes

### Base de données
- **Type:** SQLite
- **Fichier:** `/home/user/learning_english/database/ai_english_trainer.db`
- **Status:** ✅ Connectée et synchronisée

### Email SMTP
- **Status:** ⚠️ Non configuré (volontairement)
- **Impact:** Les emails de vérification ne fonctionneront pas
- **Solution:** Ajoutez SMTP_USER et SMTP_PASSWORD dans `.env` si nécessaire

### Environnement
- **NODE_ENV:** development
- **JWT_SECRET:** Configuré
- **CORS:** Activé pour localhost:3000

## 🎯 Tests recommandés sur mobile

1. **Interface responsive**
   - Vérifier que tous les éléments s'affichent correctement
   - Tester en mode portrait et paysage
   - Vérifier la taille des zones tactiles (boutons ≥ 44px)

2. **Audio**
   - Tester la synthèse vocale (écouter les textes)
   - Tester la reconnaissance vocale (si HTTPS disponible)
   - Vérifier les contrôles de volume et vitesse

3. **Navigation**
   - Tester le menu hamburger sur mobile
   - Naviguer entre les différentes sections
   - Tester les formulaires de connexion/inscription

4. **Tests TOEIC/TOEFL**
   - Lancer un test
   - Vérifier l'affichage des questions
   - Tester les contrôles audio
   - Vérifier l'affichage des résultats

## 🚀 Alternative : APK Android natif

Si la version web ne vous convient pas (problème HTTPS pour le microphone), vous pouvez créer l'APK Android natif :

```bash
# Voir les instructions complètes
cat BUILD_APK_GUIDE.md
```

L'APK natif n'a pas les restrictions HTTPS de la version web pour la reconnaissance vocale.

---

**Serveurs démarrés le:** 2025-11-04 à 20:43 UTC
**Prêt pour les tests !** ✅
