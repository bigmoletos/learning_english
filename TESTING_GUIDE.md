# Guide de Tests - AI English Trainer

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration](#configuration)
3. [Tests Unitaires](#tests-unitaires)
4. [Tests de Composants](#tests-de-composants)
5. [Tests d'Intégration](#tests-dintégration)
6. [Tests E2E](#tests-e2e)
7. [Couverture de Code](#couverture-de-code)
8. [CI/CD](#cicd)
9. [Bonnes Pratiques](#bonnes-pratiques)

---

## Vue d'ensemble

Le projet utilise une suite de tests complète pour garantir la qualité et la fiabilité de l'application.

### Stack de Tests

- **Jest**: Framework de tests unitaires
- **React Testing Library**: Tests de composants React
- **Cypress**: Tests E2E (End-to-End)
- **Supertest**: Tests d'API backend
- **MSW**: Mocking des API REST

### Structure des Tests

```
learning_english/
├── src/
│   ├── __tests__/
│   │   ├── components/      # Tests de composants React
│   │   ├── contexts/        # Tests de contextes
│   │   ├── hooks/           # Tests de hooks personnalisés
│   │   ├── firebase/        # Tests de services Firebase
│   │   └── utils/           # Tests d'utilitaires
│   └── setupTests.ts        # Configuration Jest
├── backend/
│   ├── tests/
│   │   ├── routes/          # Tests de routes API
│   │   ├── unit/            # Tests unitaires backend
│   │   └── integration/     # Tests d'intégration
│   └── jest.config.js       # Configuration Jest backend
├── cypress/
│   ├── e2e/                 # Tests E2E
│   ├── fixtures/            # Données de test
│   └── support/             # Commandes et helpers Cypress
└── .github/
    └── workflows/
        └── test.yml         # Pipeline CI/CD
```

---

## Configuration

### Installation

Les dépendances de test sont déjà installées. Pour vérifier :

```bash
npm list jest @testing-library/react cypress
```

### Variables d'Environnement

Créez un fichier `.env.test` :

```env
NODE_ENV=test
REACT_APP_API_URL=http://localhost:5000/api
JWT_SECRET=test-secret-key-for-testing-purposes-only-minimum-32-chars
DATABASE_PATH=:memory:
```

---

## Tests Unitaires

### Frontend

#### Lancer les Tests

```bash
# Tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage

# Tests spécifiques
npm test -- authService.test.ts
```

#### Exemple de Test de Service Firebase

```typescript
// src/__tests__/firebase/authService.test.ts
import { registerUser, loginUser } from '../../firebase/authService';

describe('authService', () => {
  it('should register a new user', async () => {
    const result = await registerUser('test@example.com', 'Password123!', 'Test User');
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  it('should handle registration errors', async () => {
    const result = await registerUser('', 'weak', '');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Backend

#### Lancer les Tests Backend

```bash
cd backend
npm test

# Avec couverture
npm run test:coverage

# Mode watch
npm test -- --watch
```

#### Exemple de Test de Route

```typescript
// backend/tests/routes/auth.test.js
describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Tests de Composants

### Lancer les Tests de Composants

```bash
npm test -- --testPathPattern=components
```

### Exemple de Test de Composant

```typescript
// src/__tests__/components/auth/Login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../../../components/auth/Login';

describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login onSuccess={jest.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('should submit form with valid credentials', async () => {
    const mockOnSuccess = jest.fn();
    const user = userEvent.setup();

    render(<Login onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

### Bonnes Pratiques pour Tests de Composants

1. **Utiliser des queries accessibles** :
   - Préférer `getByRole`, `getByLabelText`, `getByText`
   - Éviter `getByTestId` sauf si nécessaire

2. **Tester le comportement utilisateur** :
   - Utiliser `userEvent` au lieu de `fireEvent`
   - Simuler les interactions réelles

3. **Attendre les changements asynchrones** :
   ```typescript
   await waitFor(() => {
     expect(screen.getByText(/success/i)).toBeInTheDocument();
   });
   ```

---

## Tests d'Intégration

### Tests de Hooks

```typescript
// src/__tests__/hooks/useFirebaseAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

describe('useFirebaseAuth', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useFirebaseAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useFirebaseAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'Password123!');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### Tests de Contexte

```typescript
// src/__tests__/contexts/UserContext.test.tsx
import { renderHook } from '@testing-library/react';
import { UserProvider, useUser } from '../../contexts/UserContext';

describe('UserContext', () => {
  it('should provide user context', () => {
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toBeDefined();
    expect(result.current.login).toBeInstanceOf(Function);
  });
});
```

---

## Tests E2E

### Lancer les Tests Cypress

```bash
# Mode headless
npm run test:e2e

# Mode interactif
npm run test:e2e:open
```

### Exemple de Test E2E

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  it('should register and login a user', () => {
    cy.visit('/');

    // Registration
    cy.contains('S\'inscrire').click();
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Verify email
    cy.contains(/verifi/i).should('be.visible');

    // Login
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Should be on dashboard
    cy.url().should('include', 'dashboard');
  });
});
```

### Commandes Cypress Personnalisées

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Utilisation
cy.login('test@example.com', 'Password123!');
```

---

## Couverture de Code

### Objectifs de Couverture

| Type | Seuil Minimum |
|------|---------------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

### Générer un Rapport de Couverture

```bash
# Frontend
npm run test:coverage

# Backend
cd backend && npm run test:coverage

# Voir le rapport HTML
open coverage/lcov-report/index.html
```

### Exclure des Fichiers de la Couverture

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
  ],
};
```

---

## CI/CD

### GitHub Actions

Le pipeline CI/CD s'exécute automatiquement sur :
- Push sur `main` ou `develop`
- Pull requests vers `main` ou `develop`

### Jobs Exécutés

1. **Frontend Tests**: Tests unitaires et de composants
2. **Backend Tests**: Tests d'API et unitaires backend
3. **E2E Tests**: Tests Cypress
4. **Firebase Tests**: Tests des services Firebase
5. **Code Quality**: ESLint, TypeScript, Prettier
6. **Build Test**: Vérification du build de production
7. **Security Scan**: npm audit et Snyk

### Visualiser les Résultats

1. Aller sur l'onglet **Actions** du repository GitHub
2. Sélectionner le workflow run
3. Voir les logs de chaque job
4. Télécharger les artifacts (screenshots, vidéos Cypress)

---

## Bonnes Pratiques

### 1. Principe AAA (Arrange-Act-Assert)

```typescript
it('should update user profile', async () => {
  // Arrange
  const user = { id: '123', name: 'Test User' };
  const updates = { name: 'Updated Name' };

  // Act
  const result = await updateProfile(user.id, updates);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.name).toBe('Updated Name');
});
```

### 2. Isolation des Tests

- Chaque test doit être indépendant
- Utiliser `beforeEach` pour réinitialiser l'état
- Nettoyer après chaque test

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});
```

### 3. Mocking Approprié

```typescript
// Mock Firebase
jest.mock('../../firebase/authService');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock as any;
```

### 4. Tests Asynchrones

```typescript
// Utiliser async/await
it('should fetch user data', async () => {
  const data = await fetchUserData('123');
  expect(data).toBeDefined();
});

// Utiliser waitFor pour les changements d'état
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});
```

### 5. Nommage Descriptif

```typescript
// ✅ Bon
it('should display error when password is less than 8 characters', () => {});

// ❌ Mauvais
it('test password validation', () => {});
```

### 6. Tests de Cas Limites

```typescript
describe('calculateScore', () => {
  it('should handle empty array', () => {
    expect(calculateScore([])).toBe(0);
  });

  it('should handle null input', () => {
    expect(calculateScore(null)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(calculateScore([-1, -2])).toBe(0);
  });
});
```

---

## Dépannage

### Problèmes Courants

#### Tests Qui Timeout

```typescript
// Augmenter le timeout pour les tests lents
jest.setTimeout(10000);

// ou pour un test spécifique
it('should process large dataset', async () => {
  // ...
}, 10000);
```

#### Erreurs de Mémoire

```bash
# Augmenter la mémoire Node.js
NODE_OPTIONS=--max_old_space_size=4096 npm test
```

#### Tests Flaky (Instables)

```typescript
// Utiliser waitFor avec un timeout approprié
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
}, { timeout: 5000 });

// Ajouter des retry dans Cypress
Cypress.config('retries', {
  runMode: 2,
  openMode: 0
});
```

---

## Ressources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Scripts de Test Disponibles

```json
{
  "test": "jest --config jest.config.js",
  "test:watch": "jest --config jest.config.js --watch",
  "test:coverage": "jest --config jest.config.js --coverage",
  "test:ci": "jest --config jest.config.js --ci --coverage --maxWorkers=2",
  "test:backend": "cd backend && npm test",
  "test:e2e": "cypress run",
  "test:e2e:open": "cypress open",
  "test:all": "npm run test:coverage && npm run test:backend && npm run test:e2e"
}
```

---

## Contribution

Lors de l'ajout de nouvelles fonctionnalités :

1. ✅ Écrire les tests AVANT le code (TDD recommandé)
2. ✅ Maintenir la couverture au-dessus de 70%
3. ✅ Tester les cas nominaux ET les cas d'erreur
4. ✅ Ajouter des tests E2E pour les flux critiques
5. ✅ Vérifier que tous les tests passent avant de commit

```bash
# Vérifier que tout est OK avant commit
npm run test:all
```

---

## Support

Pour toute question ou problème avec les tests :

1. Consulter cette documentation
2. Vérifier les [Issues GitHub](https://github.com/votre-repo/issues)
3. Demander de l'aide à l'équipe

---

**Version**: 1.0.0
**Dernière mise à jour**: 2025-11-10
