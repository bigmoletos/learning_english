Database Migration Helper

Aide à créer et gérer les migrations de base de données.

**Options:**
1. Créer nouvelle migration
2. Exécuter migrations pending
3. Rollback dernière migration
4. Status des migrations
5. Seed la database

**Process - Nouvelle Migration:**

1. **Déterminer le besoin:**
   - Nouvelle table
   - Modifier table existante
   - Ajouter index
   - Data migration

2. **Créer le fichier migration:**
   ```javascript
   // backend/database/migrations/YYYYMMDD_description.js
   module.exports = {
     up: async (queryInterface, Sequelize) => {
       // Migration UP
     },
     down: async (queryInterface, Sequelize) => {
       // Rollback
     }
   };
   ```

3. **Best Practices:**
   - Toujours fournir un `down` (rollback)
   - Tester sur DB de dev d'abord
   - Backup avant migration prod
   - Migrations idempotentes si possible
   - Pas de data loss

4. **Validation:**
   - Syntax SQL/Sequelize correcte
   - Indexes sur foreign keys
   - Constraints appropriés
   - Default values sûres

**Exemples de migrations courantes:**

**Nouvelle table:**
```javascript
await queryInterface.createTable('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
});
```

**Ajouter colonne:**
```javascript
await queryInterface.addColumn('users', 'phone', {
  type: Sequelize.STRING,
  allowNull: true
});
```

**Ajouter index:**
```javascript
await queryInterface.addIndex('users', ['email'], {
  name: 'users_email_idx',
  unique: true
});
```

**Commandes:**
```bash
npm run migrate        # Execute pending
npm run migrate:undo  # Rollback last
npm run migrate:status # Check status
```
