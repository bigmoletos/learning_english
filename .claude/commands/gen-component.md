Generate React Component

Génère un nouveau composant React avec TypeScript et tests.

**Questions à poser:**
1. Nom du composant ? (PascalCase)
2. Type : Presentational / Container / Page ?
3. Props nécessaires ?
4. State local ?
5. Hooks utilisés ?
6. Styled avec Material-UI ?
7. Générer le test ?

**Structure générée:**

```
src/components/{category}/{ComponentName}/
├── {ComponentName}.tsx
├── {ComponentName}.test.tsx
├── {ComponentName}.styles.ts (si MUI custom)
└── index.ts
```

**Template du composant:**

```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';

interface {ComponentName}Props {
  // Props typées
}

export const {ComponentName}: React.FC<{ComponentName}Props> = ({
  // props destructuring
}) => {
  // State & hooks

  // Handlers

  // Effects

  return (
    <Box>
      {/* JSX */}
    </Box>
  );
};

export default {ComponentName};
```

**Template du test:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { {ComponentName} } from './{ComponentName}';

describe('{ComponentName}', () => {
  it('renders without crashing', () => {
    render(<{ComponentName} />);
  });

  it('displays the correct content', () => {
    render(<{ComponentName} prop="value" />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  // More tests...
});
```

**Best Practices appliquées:**
- TypeScript strict
- Props interface dédiée
- React.FC typé
- Destructuring props
- Material-UI components
- Responsive design
- Accessibility (a11y)
- Tests unitaires

**Options:**
- `--type presentational` : Composant sans logique
- `--type container` : Composant avec logique
- `--type page` : Composant page entière
- `--no-test` : Ne pas générer le test
- `--with-context` : Ajouter Context provider
- `--with-hook` : Générer aussi un custom hook
