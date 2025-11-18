---
description: Rules for Python development
alwaysApply: false
---

# Règles Python

## Style de Code (PEP 8)

### Indentation
- 4 espaces (pas de tabs)
- Maximum 79 caractères par ligne
- Maximum 99 caractères pour les commentaires

### Naming
```python
# ✅ Bon
class UserService:
    def get_user_by_id(self, user_id: str) -> User:
        pass

CONSTANT_VALUE = 100
_private_variable = "internal"

# ❌ Mauvais
class userService:  # Pas de camelCase pour les classes
    def GetUserById(self, userId):  # Pas de camelCase
        pass
```

### Imports
```python
# ✅ Bon - Ordre standard
import os
import sys
from typing import List, Dict
from mymodule import MyClass

# ❌ Mauvais - Imports désordonnés
from mymodule import MyClass
import os
```

## Type Hints

```python
# ✅ Bon - Types explicites
def process_users(users: List[User]) -> Dict[str, int]:
    return {"total": len(users)}

# ❌ Mauvais - Pas de types
def process_users(users):
    return {"total": len(users)}
```

## Gestion des Erreurs

```python
# ✅ Bon - Exceptions spécifiques
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")
    raise
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise

# ❌ Mauvais - Bare except
try:
    result = risky_operation()
except:  # ❌
    pass
```

## Tests (pytest)

```python
# ✅ Bon - Tests clairs
def test_get_user_by_id():
    # Arrange
    user_id = "123"
    expected_user = User(id=user_id, name="Test")
    
    # Act
    result = user_service.get_user_by_id(user_id)
    
    # Assert
    assert result.id == expected_user.id
    assert result.name == expected_user.name
```

## Virtual Environments

- Toujours utiliser un virtual environment
- Utiliser `requirements.txt` ou `pyproject.toml`
- Documenter les dépendances
- Utiliser `pip freeze > requirements.txt` avec précaution

## Documentation

```python
# ✅ Bon - Docstrings
def calculate_score(responses: List[Response]) -> float:
    """
    Calculate the average score from user responses.
    
    Args:
        responses: List of user responses
        
    Returns:
        Average score as a float between 0 and 100
    """
    pass
```

