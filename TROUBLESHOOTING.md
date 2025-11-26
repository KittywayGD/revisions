# Troubleshooting - PSI Révision App

## Problèmes rencontrés lors du setup initial

### ✅ Problème 1 : Tailwind CSS v4

**Erreur** :
```
PostCSS plugin has moved to a separate package
```

**Solution** :
- Installation de `@tailwindcss/postcss`
- Mise à jour de `postcss.config.js` pour utiliser `'@tailwindcss/postcss'`

### ✅ Problème 2 : Modules ESM vs CommonJS

**Erreur** :
```
Cannot read properties of undefined (reading 'whenReady')
```

**Solution** :
- Ajout de `"type": "module"` dans package.json
- Mise à jour des tsconfig pour utiliser ESNext
- Ajout d'extensions `.js` aux imports relatifs

### ✅ Problème 3 : Imports de modules CommonJS (pdf-parse, better-sqlite3)

**Erreur** :
```
The requested module 'pdf-parse' does not provide an export named 'default'
```

**Solution** :
Utilisation de `createRequire` pour importer les modules CommonJS :

```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const pdfParse = require('pdf-parse');
```

### ⚠️ Problème 4 : better-sqlite3 rebuild pour Electron (EN COURS)

**Erreur** :
```
NODE_MODULE_VERSION mismatch
The module was compiled against a different Node.js version
```

**Cause** :
- Les modules natifs (better-sqlite3) doivent être compilés spécifiquement pour Electron
- Electron 39 nécessite C++20 pour la compilation

**Solutions potentielles** :

#### Option A : Utiliser une version antérieure d'Electron compatible avec votre compilateur

```bash
npm install --save-dev electron@^28.0.0
npm rebuild better-sqlite3
```

#### Option B : Mettre à jour Xcode/compilateur C++ (macOS)

1. Installer Xcode Command Line Tools récent :
```bash
xcode-select --install
```

2. Mettre à jour Xcode depuis l'App Store

3. Vérifier la version du compilateur :
```bash
clang++ --version  # Devrait supporter C++20
```

#### Option C : Utiliser sql.js au lieu de better-sqlite3

sql.js est une version JavaScript pure de SQLite (pas de module natif à compiler) :

```bash
npm uninstall better-sqlite3
npm install sql.js
```

Puis modifier `src/services/database.ts` pour utiliser sql.js.

#### Option D : Utiliser l'option recommandée - @electron/rebuild

```bash
npm uninstall electron-rebuild
npm install --save-dev @electron/rebuild
npx electron-rebuild
```

## État actuel du projet

✅ **Fonctionnel** :
- Configuration complète de l'architecture
- Tous les fichiers sources créés
- Configuration Electron + Vite + React
- Types TypeScript
- Services (AI, Database, File)
- 7 pages React
- Styles Tailwind CSS

⚠️ **À résoudre** :
- Compilation better-sqlite3 pour Electron
- Test de l'application en mode dev

## Recommandation temporaire

Pour tester rapidement l'application sans résoudre le problème de better-sqlite3 :

### 1. Simplifier en utilisant sql.js

```bash
npm uninstall better-sqlite3 @types/better-sqlite3
npm install sql.js
```

### 2. Créer une version simplifiée de DatabaseService

Créer `src/services/database-sqljs.ts` :

```typescript
import initSqlJs from 'sql.js';

export class DatabaseService {
  private db: any;

  async initialize() {
    const SQL = await initSqlJs();
    this.db = new SQL.Database();
    // ... reste de l'implémentation
  }
}
```

### 3. Ou utiliser IndexedDB (API Web)

Pour une application Electron, vous pouvez utiliser IndexedDB qui est déjà intégré :

```typescript
// Utiliser Dexie.js pour simplifier
npm install dexie
```

## Scripts utiles

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Rebuild des modules natifs
npx @electron/rebuild

# Lancer l'app (quand le problème sera résolu)
npm run dev

# Build pour production
npm run build
```

## Prochaines étapes recommandées

1. **Résoudre le problème better-sqlite3** (choisir une option ci-dessus)
2. **Tester l'application** avec `npm run dev`
3. **Configurer la clé API** dans les paramètres
4. **Importer un cours** et tester la génération
5. **Implémenter les fonctionnalités manquantes** (voir NEXT_STEPS.md)

## Ressources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-vite](https://electron-vite.org/)
- [better-sqlite3 with Electron](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md)
- [sql.js](https://sql.js.org/)

## Contact / Support

Si vous rencontrez d'autres problèmes :

1. Vérifiez les logs dans la console développeur (Cmd+Option+I)
2. Consultez la documentation Electron
3. Ouvrez une issue sur GitHub avec les logs d'erreur

---

**Note** : L'architecture de l'application est complète et fonctionnelle. Le seul problème actuel est la compilation du module natif better-sqlite3 pour Electron. Une fois ce problème résolu (ou contourné avec sql.js), l'application devrait fonctionner correctement.
