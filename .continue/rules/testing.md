---
description: Rules for testing (Jest, React Testing Library, Supertest)
alwaysApply: false
---

# Règles de Tests

## Principes Généraux

1. **AAA Pattern** : Arrange, Act, Assert
2. **Tests isolés** : Chaque test doit être indépendant
3. **Tests reproductibles** : Même résultat à chaque exécution
4. **Nommage clair** : `should [expected behavior] when [condition]`

## Tests Frontend (Jest + React Testing Library)

### Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup commun
  });

  it('should render correctly', () => {
    // Arrange
    render(<Component />);
    
    // Act & Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Bonnes Pratiques
- Utiliser `screen.getByRole` plutôt que `getByTestId`
- Tester le comportement, pas l'implémentation
- Utiliser `waitFor` pour les opérations asynchrones
- Mocker les dépendances externes (Firebase, API)

### Mocks
```typescript
// ✅ Bon - Mock complet
jest.mock('../../services/api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' })
}));

// ❌ Mauvais - Mock partiel
jest.mock('../../services/api');
```

## Tests Backend (Jest + Supertest)

### Structure
```javascript
describe('POST /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    // Arrange
    const userData = { email: 'test@example.com' };
    
    // Act
    const response = await request(app)
      .post('/api/users')
      .send(userData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Mocks Sequelize
- Toujours mocker Sequelize avant d'importer les modèles
- Mocker les méthodes de modèle (findOne, create, etc.)
- Utiliser des factories pour créer des données de test

## Couverture

### Seuils
- Minimum : 10% (projet en développement)
- Objectif : 70%+ (projet mature)
- Focus sur les fichiers critiques

### Exclusions
- Fichiers de configuration
- Types TypeScript
- Fichiers de setup (setupTests.ts)

## Tests E2E (Cypress)

- Tests critiques uniquement (happy path)
- Tests indépendants et isolés
- Utiliser des données de test dédiées
- Nettoyer après chaque test

## Erreurs Communes à Éviter

1. **Tests qui dépendent les uns des autres**
2. **Mocks non réinitialisés entre les tests**
3. **Tests qui testent l'implémentation au lieu du comportement**
4. **Assertions multiples dans un seul test sans waitFor**
5. **Tests qui ne nettoient pas après eux**

