---
description: Rules for React and TypeScript development
alwaysApply: false
---

# Règles React & TypeScript

## Composants React

### Functional Components Uniquement
```typescript
// ✅ Bon
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>...</div>;
};

// ❌ Mauvais - Class components interdits
class MyComponent extends React.Component { ... }
```

### Props Typées
```typescript
// ✅ Bon - Interface explicite
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
};

// ❌ Mauvais - any ou props non typées
const Button = (props: any) => { ... };
```

### Hooks
```typescript
// ✅ Bon - Custom hooks avec types de retour
export const useMyHook = (): UseMyHookReturn => {
  const [state, setState] = useState<string>("");
  useEffect(() => {
    // ...
  }, []);
  return { state, setState };
};

// ❌ Mauvais - Hooks dans des conditions
if (condition) {
  const [state, setState] = useState(); // ❌
}
```

### Performance
- Utiliser `useMemo` pour les calculs coûteux
- Utiliser `useCallback` pour les fonctions passées en props
- Éviter les re-renders inutiles avec `React.memo` si nécessaire
- Lazy loading pour les routes et composants volumineux

### État Local vs Global
- État local : `useState` pour les composants simples
- État global : `Context API` ou state management library
- Éviter le prop drilling excessif

## TypeScript

### Types Stricts
```typescript
// ✅ Bon - Types explicites
interface User {
  id: string;
  email: string;
  displayName: string;
}

const getUser = (id: string): Promise<User> => { ... };

// ❌ Mauvais - any
const user: any = ...;
const getUser = (id) => { ... };
```

### Interfaces vs Types
- Utiliser `interface` pour les objets et composants
- Utiliser `type` pour les unions, intersections, et types utilitaires

### Éviter
- `any` - utiliser `unknown` si nécessaire
- `@ts-ignore` - préférer `@ts-expect-error` avec commentaire
- Types non-null assertion (`!`) - valider les valeurs

## Structure des Fichiers

```
src/
├── components/        # Composants réutilisables
│   ├── common/      # Composants génériques
│   └── [feature]/   # Composants spécifiques à une feature
├── hooks/           # Custom hooks
├── services/        # Services et API calls
├── contexts/        # React contexts
├── types/           # Types TypeScript
└── utils/           # Fonctions utilitaires
```

## Tests React

- Utiliser `@testing-library/react` pour les tests de composants
- Tester le comportement, pas l'implémentation
- Utiliser `screen.getByRole` plutôt que `getByTestId`
- Mocker les dépendances externes (Firebase, API, etc.)

