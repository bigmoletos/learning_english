# Configuration du Navigateur pour le Développement

## Problème connu avec le navigateur intégré de Cursor

Le navigateur intégré de Cursor peut avoir des problèmes avec :
- Les proxies de développement (setupProxy.js)
- Les configurations locales (localhost)
- L'affichage des composants React
- Les WebSockets et hot-reload

## Solution recommandée

**Utilisez Chrome ou un navigateur externe pour le développement.**

### Configuration recommandée

1. **Désactiver le navigateur intégré de Cursor** (optionnel)
   - Le navigateur intégré peut être utile pour des tests rapides, mais Chrome est recommandé pour le développement complet

2. **Utiliser Chrome avec les outils de développement**
   - Ouvrez Chrome manuellement
   - Naviguez vers `http://localhost:3000`
   - Utilisez les DevTools (F12) pour déboguer

3. **Vérifier que le serveur React est bien démarré**
   ```bash
   npm start
   ```
   Le serveur devrait démarrer sur `http://localhost:3000`

4. **Vérifier que le proxy fonctionne**
   - Le fichier `src/setupProxy.js` redirige `/api/*` vers `http://localhost:5000`
   - Vérifiez que le backend est démarré sur le port 5000

## URLs importantes

- **Frontend React** : `http://localhost:3000`
- **Backend API** : `http://localhost:5000`
- **Proxy API** : `http://localhost:3000/api/*` → `http://localhost:5000/api/*`

## Dépannage

Si le navigateur intégré de Cursor affiche une page différente de Chrome :

1. **Vérifiez l'URL** : Assurez-vous que vous êtes sur `http://localhost:3000`
2. **Videz le cache** : Le navigateur intégré peut avoir un cache différent
3. **Utilisez Chrome** : C'est la solution la plus fiable pour le développement
4. **Vérifiez les logs** : Les logs de la console dans Chrome sont plus fiables

## Note

Le navigateur intégré de Cursor est utile pour des tests rapides, mais pour un développement complet avec débogage, utilisez Chrome ou un autre navigateur externe.

