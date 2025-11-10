Generate API Documentation

Génère une documentation complète des API du projet.

**Process:**

1. **Scan Backend Routes:**
   - Express routes dans backend/
   - Méthodes HTTP (GET, POST, PUT, DELETE)
   - Paths et paramètres
   - Middlewares (auth, validation)

2. **Pour chaque endpoint:**
   - Method + Path
   - Description/Purpose
   - Request:
     * Headers requis
     * Body schema
     * Query params
     * Path params
   - Response:
     * Success (200, 201, etc.)
     * Errors (400, 401, 404, 500)
     * Schema de réponse
   - Authentication requis ?
   - Rate limiting
   - Examples (curl, fetch, axios)

3. **Firebase Functions:**
   - Cloud functions disponibles
   - Triggers
   - Paramètres
   - Returns

4. **Format de sortie:**
   - Markdown (README format)
   - OpenAPI/Swagger spec (optionnel)
   - Postman collection (optionnel)

**Exemple de sortie:**

```markdown
## POST /api/auth/login

**Description:** Authentifie un utilisateur

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response 200:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- 400: Invalid email or password format
- 401: Invalid credentials
- 429: Too many login attempts

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```
```

**Sauvegarde dans:** `docs/API.md`
