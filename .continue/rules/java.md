---
description: Rules for Java development
alwaysApply: false
---

# Règles Java

## Conventions de Nommage

```java
// ✅ Bon
public class UserService {
    private static final int MAX_RETRIES = 3;
    private String userId;
    
    public User getUserById(String id) {
        // ...
    }
}

// ❌ Mauvais
public class userService {  // Pas de camelCase pour les classes
    private int maxRetries;  // Pas de constantes en camelCase
}
```

## Structure des Classes

```java
// ✅ Bon - Ordre standard
public class UserService {
    // 1. Constants
    private static final String DEFAULT_ROLE = "USER";
    
    // 2. Fields
    private UserRepository userRepository;
    
    // 3. Constructors
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    // 4. Methods
    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }
}
```

## Gestion des Exceptions

```java
// ✅ Bon - Exceptions spécifiques
public User getUserById(String id) {
    try {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    } catch (DatabaseException e) {
        logger.error("Database error", e);
        throw new ServiceException("Failed to retrieve user", e);
    }
}

// ❌ Mauvais - Catching Exception générique
try {
    // ...
} catch (Exception e) {  // ❌
    // ...
}
```

## Tests (JUnit)

```java
// ✅ Bon - Tests clairs
@Test
void shouldReturnUserWhenIdExists() {
    // Arrange
    String userId = "123";
    User expectedUser = new User(userId, "Test User");
    when(userRepository.findById(userId)).thenReturn(Optional.of(expectedUser));
    
    // Act
    User result = userService.getUserById(userId);
    
    // Assert
    assertEquals(expectedUser.getId(), result.getId());
    assertEquals(expectedUser.getName(), result.getName());
}
```

## Spring Boot

### Controllers
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
}
```

### Services
- Utiliser `@Service` pour les services métier
- Injecter les dépendances via constructeur
- Gérer les transactions avec `@Transactional`

## Best Practices

1. **Immutabilité** : Utiliser `final` pour les champs non modifiables
2. **Null Safety** : Utiliser `Optional` pour les valeurs potentiellement null
3. **Streams** : Utiliser les streams pour les opérations sur collections
4. **Lombok** : Utiliser Lombok pour réduire le boilerplate (si autorisé)

