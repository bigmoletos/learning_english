Debug Assistant

Aide au debugging interactif avec suggestions d'approches.

**Questions initiales:**
1. Quel est le problème ? (erreur, comportement inattendu, performance)
2. Frontend ou Backend ?
3. Reproductible ? Si oui, étapes ?
4. Messages d'erreur ?

**Approche de Debug:**

**Frontend (React):**
1. Check console browser pour erreurs
2. React DevTools - component state/props
3. Network tab - API calls
4. Source maps - stack traces
5. Performance profiler - re-renders

**Backend (Express):**
1. Check logs serveur
2. Trace les requests
3. DB queries - slow query log
4. Memory leaks - heap snapshots
5. CPU profiling

**Debugging Tools:**
```bash
# Frontend
npm start  # avec source maps

# Backend
DEBUG=* npm run dev  # verbose logging

# Process
ps aux | grep node
lsof -i :3000

# Logs
tail -f backend/logs/*.log

# Memory
node --inspect backend/server.js
# Chrome: chrome://inspect
```

**Stratégies:**
1. **Divide & Conquer** - Isoler le problème
2. **Binary Search** - Commenter du code par blocs
3. **Add Logging** - console.log stratégiques
4. **Reproduce Minimal** - Cas de test minimal
5. **Stack Trace** - Remonter la call stack

**Common Issues:**
- CORS errors → Vérifier backend CORS config
- 401/403 → Authentification/Authorization
- Infinite loop → useEffect dependencies
- Memory leak → Event listeners non nettoyés
- Slow performance → Profiling, memo, useMemo

Je t'aide étape par étape !
