Pre-Deployment Checklist

Vérifie que tout est prêt pour le déploiement en production.

**Checklist Complète:**

1. **Code Quality:**
   - [ ] ESLint: Aucune erreur
   - [ ] TypeScript: Aucune erreur de type
   - [ ] Prettier: Code formaté
   - [ ] No console.log/debugger en prod

2. **Tests:**
   - [ ] Tous les tests passent
   - [ ] Coverage >80% sur code critique
   - [ ] Tests E2E passent (si applicable)

3. **Build:**
   - [ ] Build de prod réussit
   - [ ] Bundle size acceptable (<500KB initial)
   - [ ] No warnings critiques

4. **Sécurité:**
   - [ ] npm audit: Pas de vulnérabilités critiques
   - [ ] Secrets pas en hardcode
   - [ ] .env.example à jour
   - [ ] CORS configuré correctement
   - [ ] Rate limiting en place

5. **Configuration:**
   - [ ] Variables d'env de prod configurées
   - [ ] Firebase config de prod
   - [ ] API endpoints de prod
   - [ ] Analytics configurés

6. **Performance:**
   - [ ] Images optimisées
   - [ ] Lazy loading implémenté
   - [ ] Service Worker configuré
   - [ ] Caching strategy

7. **Mobile (Android):**
   - [ ] APK build réussit
   - [ ] Permissions correctes
   - [ ] Version code incrémenté
   - [ ] Signing config

8. **Git:**
   - [ ] Branch à jour avec main
   - [ ] Pas de conflicts
   - [ ] Commit messages clairs
   - [ ] PR reviewed et approved

**Exécute tous les checks et génère un rapport GO/NO-GO.**
