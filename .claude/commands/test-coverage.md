Test Coverage Analysis

Analyse la couverture des tests et identifie les gaps.

**Process:**

1. **Frontend:**
   - Lance `npm test -- --coverage --watchAll=false`
   - Analyse le rapport de coverage

2. **Backend:**
   - Lance `cd backend && npm test -- --coverage`
   - Analyse le rapport de coverage

3. **Identification des Gaps:**
   - Fichiers sans tests (coverage 0%)
   - Fichiers critiques sous-testés (<80%)
   - Branches non testées
   - Functions critiques non testées

4. **Priorisation:**
   - 🔴 Critique (auth, paiement, data loss)
   - 🟡 Important (features principales)
   - 🟢 Nice to have (UI components simples)

5. **Suggestions:**
   - Tests unitaires à ajouter
   - Tests d'intégration manquants
   - Edge cases non couverts

**Livrable:**
- Tableau récapitulatif du coverage
- Liste prioritaire des tests à ajouter
- Exemples de tests pour les cas critiques
