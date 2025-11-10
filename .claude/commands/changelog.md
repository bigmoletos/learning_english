Generate CHANGELOG.md

Génère un CHANGELOG.md basé sur l'historique Git et les conventions.

**Format:** [Keep a Changelog](https://keepachangelog.com/) + [Semantic Versioning](https://semver.org/)

**Process:**

1. **Analyser l'historique Git:**
   ```bash
   git log --oneline --pretty=format:"%h %s" --since="last release"
   ```

2. **Catégoriser les commits:**
   - 🎉 **Added** : feat:
   - 🔧 **Changed** : refactor:, perf:
   - 🐛 **Fixed** : fix:
   - 🗑️ **Removed** : remove:
   - 🔒 **Security** : security:
   - ⚠️ **Deprecated** : deprecate:

3. **Template CHANGELOG.md:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature X for improved user experience
- API endpoint `/api/new-feature`
- Component `<NewComponent>` for feature Y

### Changed
- Updated dependency X to version Y.Z
- Refactored authentication flow
- Improved performance of data fetching (30% faster)

### Fixed
- Fixed bug where login failed on mobile
- Resolved memory leak in VoiceRecorder component
- Corrected TypeScript types for API responses

### Security
- Updated vulnerable dependency (CVE-XXXX-YYYY)
- Improved password hashing algorithm

## [1.0.0] - 2025-01-10

### Added
- Initial release
- User authentication (Firebase Auth)
- Speech recognition with Google Cloud
- TOEIC/TOEFL practice exercises
- Progress tracking dashboard
- Android app (Capacitor)

### Changed
- Migrated from localStorage to Firebase
- Updated UI to Material-UI v5

### Fixed
- Various bug fixes
- Performance improvements

## [0.9.0] - 2024-12-15

### Added
- Beta release
- Core features implementation

---

## Types of Changes

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.
```

**Détection Automatique des Versions:**

```bash
# Version actuelle
CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "0.0.0")

# Type de version (major.minor.patch)
# Breaking change → major
# New feature → minor
# Bug fix → patch

# Exemple de logique:
if git log --oneline | grep -q "BREAKING CHANGE"; then
  # Increment major
elif git log --oneline | grep -q "feat:"; then
  # Increment minor
else
  # Increment patch
fi
```

**Enrichissement avec Contexte:**

Pour chaque entrée:
- Hash du commit
- Auteur
- PR associée (si GitHub)
- Issue fermée (si référencée)

```markdown
### Added
- New authentication flow ([#123](https://github.com/user/repo/pull/123))
  - Improved security with 2FA
  - Better UX on mobile
  - Fixes [#110](https://github.com/user/repo/issues/110)
  - Thanks to @contributor
```

**Conventions de Commits:**

```
feat(scope): description      → Added
fix(scope): description       → Fixed
docs(scope): description      → Documentation
style(scope): description     → Changed (formatting)
refactor(scope): description  → Changed
perf(scope): description      → Changed (performance)
test(scope): description      → No changelog entry
chore(scope): description     → No changelog entry
security(scope): description  → Security

Breaking Change: Add "BREAKING CHANGE:" in commit body
```

**Génération Automatique:**

```bash
# Script de génération
npm install -g conventional-changelog-cli

# Générer CHANGELOG pour version spécifique
conventional-changelog -p angular -i CHANGELOG.md -s -r 0

# Avec --release-count
conventional-changelog -p angular -i CHANGELOG.md -s -r 2
```

**Configuration package.json:**

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "release": "npm run changelog && git add CHANGELOG.md"
  }
}
```

**CI/CD Integration:**

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate Changelog
        run: |
          npm install -g conventional-changelog-cli
          conventional-changelog -p angular -i CHANGELOG.md -s -r 0
      - name: Create Release
        uses: actions/create-release@v1
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: ./CHANGELOG.md
```

**Options:**
- `--version <semver>` : Version spécifique
- `--from <tag>` : Depuis quelle version
- `--to <tag>` : Jusqu'à quelle version
- `--format standard|angular|atom` : Format de commits

**Livrable:**
- CHANGELOG.md généré ou mis à jour
- Suggestion de version (semver)
- Liste des contributors
- Breaking changes highlighted
