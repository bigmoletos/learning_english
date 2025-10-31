# 🔐 Créer un App Password Gmail - Guide Rapide

**Votre email** : desmedt.franck@gmail.com

---

## ⚠️ Problème Détecté

Vous utilisez actuellement votre **mot de passe Gmail normal**, mais Gmail nécessite un **"App Password"** (mot de passe d'application) pour les applications tierces.

---

## ✅ Solution : Créer un App Password

### Étape 1 : Vérifier que la Validation en 2 Étapes est Activée

1. Allez sur : https://myaccount.google.com/security
2. Cherchez **"Validation en 2 étapes"** ou **"2-Step Verification"**
3. Si elle n'est **pas activée** :
   - Cliquez dessus
   - Suivez les instructions pour l'activer
   - **Important** : Vous ne pouvez pas créer un App Password sans la validation en 2 étapes

---

### Étape 2 : Créer l'App Password

1. Toujours sur : https://myaccount.google.com/security  et https://myaccount.google.com/apppasswords
2. Cherchez **"Mots de passe d'application"** (ou **"App passwords"**)
   - Si vous ne le voyez pas, c'est que la validation en 2 étapes n'est pas activée

3. allez sur https://myaccount.google.com/apppasswords
    - Cliquez sur **"Mots de passe d'application"**
4. Sélectionnez :
   - **Application** : "Application personnalisée" (ou "Autre (nom personnalisé)")
   - **Nom** : "AI English Trainer"
5. Cliquez sur **"Générer"** (ou **"Create"**)
6. **⚠️ IMPORTANT** : Copiez le mot de passe affiché (16 caractères)
   - Format : `xxxx xxxx xxxx xxxx` (avec espaces)
   - **Vous ne pourrez plus le voir après !**

---

### Étape 3 : Mettre à Jour le Fichier `.env`

Ouvrez `.env` à la racine du projet et remplacez :

```env
SMTP_PASSWORD=+-*/2000Gal/*-+
```

Par votre nouveau App Password :

```env
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Note** : Vous pouvez garder ou retirer les espaces, les deux fonctionnent.

---

### Étape 4 : Tester à Nouveau

```bash
cd backend/scripts
./testEmail.sh desmedt.franck@gmail.com
```

---

## 🔗 Liens Directs

- **Sécurité Google** : https://myaccount.google.com/security
- **App Passwords** : https://myaccount.google.com/apppasswords
- **Support Gmail** : https://support.google.com/mail/?p=InvalidSecondFactor

---

## 💡 Astuce

Si vous ne trouvez pas "App passwords", essayez de :
1. Aller directement sur : https://myaccount.google.com/apppasswords
2. Utiliser la recherche sur la page de sécurité Google avec "app password"

---

## ✅ Vérification Rapide

Une fois l'App Password créé et ajouté dans `.env`, vous devriez voir :

```
✅ Connexion SMTP réussie !
✅ Email envoyé avec succès !
```

