Test Generator

Génère des tests unitaires et d'intégration automatiquement.

**Questions à poser:**
1. Type de test ? (Unit / Integration / E2E)
2. Fichier à tester ? (chemin)
3. Framework ? (Jest / React Testing Library / Playwright)
4. Coverage souhaitée ? (%)

**Templates de Tests:**

### Test Unitaire - Component React

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {ComponentName} } from './{ComponentName}';

describe('{ComponentName}', () => {
  // Setup
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render tests
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<{ComponentName} />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });

    it('renders with correct props', () => {
      const props = { ... };
      render(<{ComponentName} {...props} />);
      expect(screen.getByText(props.text)).toBeInTheDocument();
    });

    it('matches snapshot', () => {
      const { container } = render(<{ComponentName} />);
      expect(container).toMatchSnapshot();
    });
  });

  // Interaction tests
  describe('User Interactions', () => {
    it('handles button click', async () => {
      const handleClick = jest.fn();
      render(<{ComponentName} onClick={handleClick} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('updates input value', async () => {
      render(<{ComponentName} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test value');

      expect(input).toHaveValue('test value');
    });
  });

  // State tests
  describe('State Management', () => {
    it('updates state on action', async () => {
      render(<{ComponentName} />);

      const button = screen.getByText('Action');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Updated')).toBeInTheDocument();
      });
    });
  });

  // API tests (with mocks)
  describe('API Calls', () => {
    it('fetches data on mount', async () => {
      const mockData = { ... };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockData),
        })
      );

      render(<{ComponentName} />);

      await waitFor(() => {
        expect(screen.getByText(mockData.title)).toBeInTheDocument();
      });
    });

    it('handles API errors', async () => {
      global.fetch = jest.fn(() => Promise.reject('API Error'));

      render(<{ComponentName} />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles empty props', () => {
      render(<{ComponentName} data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('handles null values', () => {
      render(<{ComponentName} value={null} />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });
});
```

### Test Unitaire - Custom Hook

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { use{HookName} } from './use{HookName}';

describe('use{HookName}', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => use{HookName}());

    expect(result.current.value).toBe(initialValue);
    expect(result.current.loading).toBe(false);
  });

  it('updates value on action', () => {
    const { result } = renderHook(() => use{HookName}());

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });

  it('handles async operations', async () => {
    const { result } = renderHook(() => use{HookName}());

    act(() => {
      result.current.fetchData();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### Test d'Intégration - Backend API

```javascript
const request = require('supertest');
const app = require('../server');

describe('API Routes', () => {
  describe('POST /api/endpoint', () => {
    it('creates a new resource', async () => {
      const payload = { ... };

      const response = await request(app)
        .post('/api/endpoint')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(payload.name);
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({ ... })
        .expect(401);
    });
  });
});
```

### Test E2E - Playwright

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes user flow', async ({ page }) => {
    // Navigate
    await page.click('text=Button');
    await expect(page).toHaveURL('/new-page');

    // Fill form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');

    // Submit
    await page.click('button[type="submit"]');

    // Verify
    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('handles errors gracefully', async ({ page }) => {
    await page.fill('[name="email"]', 'invalid');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toBeVisible();
  });
});
```

**Process de Génération:**

1. **Analyser le fichier source**
   - Identifier exports (components, hooks, functions)
   - Extraire les props/params
   - Détecter les dépendances

2. **Générer les tests**
   - Tests de base (render, props)
   - Tests d'interaction (user events)
   - Tests de state/hooks
   - Tests d'API (avec mocks)
   - Edge cases

3. **Configuration Coverage:**
   ```json
   {
     "collectCoverageFrom": [
       "src/**/*.{js,jsx,ts,tsx}",
       "!src/**/*.d.ts",
       "!src/index.tsx",
       "!src/**/*.stories.tsx"
     ],
     "coverageThreshold": {
       "global": {
         "branches": 80,
         "functions": 80,
         "lines": 80,
         "statements": 80
       }
     }
   }
   ```

**Mocking Utilities:**

```typescript
// Mock Firebase
jest.mock('../services/firebase', () => ({
  auth: { currentUser: { uid: 'test-uid' } },
  firestore: jest.fn(),
}));

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mock' }),
  })
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

**Options:**
- `--file <path>` : Fichier à tester
- `--type unit|integration|e2e` : Type de test
- `--coverage 80` : Coverage cible
- `--watch` : Mode watch pour développement

**Livrable:**
- Fichier de test généré
- Mocks configurés
- Coverage configuration
- Instructions pour lancer les tests
