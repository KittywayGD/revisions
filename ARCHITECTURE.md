# Architecture de PSI Révision App

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Electron                    │
│                                                               │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │   Main Process      │         │  Renderer Process    │   │
│  │   (Node.js)         │◄───IPC─►│  (React/TypeScript)  │   │
│  │                     │         │                      │   │
│  │  - main.ts          │         │  - App.tsx           │   │
│  │  - preload.ts       │         │  - Pages             │   │
│  │  - Services         │         │  - Components        │   │
│  │    • Database       │         │  - Hooks             │   │
│  │    • AI (Claude)    │         │  - Utils             │   │
│  │    • File Parser    │         │                      │   │
│  └──────┬──────────────┘         └──────────────────────┘   │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │   SQLite Database   │         │  Anthropic API       │   │
│  │   (Local Storage)   │         │  (Claude Haiku 4.5)  │   │
│  └─────────────────────┘         └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Structure des dossiers

```
psi-revision-app/
│
├── src/
│   ├── main/                    # Processus principal Electron
│   │   ├── main.ts              # Point d'entrée, window management
│   │   └── preload.ts           # Bridge IPC sécurisé
│   │
│   ├── renderer/                # Interface utilisateur React
│   │   ├── components/          # Composants réutilisables
│   │   │   └── Sidebar.tsx      # Navigation latérale
│   │   │
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── Dashboard.tsx    # Vue d'ensemble, statistiques rapides
│   │   │   ├── Library.tsx      # Gestion des matières et chapitres
│   │   │   ├── Generate.tsx     # Génération IA de contenu
│   │   │   ├── Review.tsx       # Mode révision avec flashcards
│   │   │   ├── QuizPage.tsx     # Mode quiz (QCM)
│   │   │   ├── Statistics.tsx   # Statistiques détaillées
│   │   │   └── Settings.tsx     # Configuration (API key, thème)
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Fonctions utilitaires
│   │   ├── styles/              # Styles CSS/Tailwind
│   │   │   └── index.css
│   │   ├── types/               # Types TypeScript frontend
│   │   │   └── electron.d.ts
│   │   ├── App.tsx              # Composant racine
│   │   └── main.tsx             # Point d'entrée React
│   │
│   ├── services/                # Services métier
│   │   ├── database.ts          # Service SQLite
│   │   ├── ai.ts                # Service API Anthropic
│   │   ├── file.ts              # Extraction de contenu
│   │   └── spaced-repetition.ts # Algorithme SM-2
│   │
│   ├── shared/                  # Code partagé main/renderer
│   │   └── types.ts             # Types TypeScript partagés
│   │
│   └── scripts/                 # Scripts utilitaires
│       └── seed-database.ts     # Peupler la DB avec des données de test
│
├── database/                    # Base de données SQLite (générée)
│   └── psi-revision.db
│
├── config/                      # Configuration (générée)
│   ├── api-key.txt              # Clé API Anthropic
│   └── theme.txt                # Thème (light/dark)
│
├── dist/                        # Build output
│   ├── main/                    # Main process compilé
│   └── renderer/                # Renderer compilé
│
├── release/                     # Installateurs (générés)
│
├── public/                      # Assets statiques
│
├── Configuration files
├── package.json                 # Dépendances et scripts
├── tsconfig.json                # Config TypeScript (renderer)
├── tsconfig.main.json           # Config TypeScript (main)
├── tsconfig.preload.json        # Config TypeScript (preload)
├── vite.config.ts               # Config Vite
├── tailwind.config.js           # Config Tailwind CSS
├── postcss.config.js            # Config PostCSS
├── electron-builder.json        # Config packaging
└── .gitignore
```

## Flux de données

### 1. Import de cours

```
User clicks "Import"
       ↓
Renderer: selectFile()
       ↓
IPC → Main: file:selectFile
       ↓
FileService: extractContent(path)
       ↓
Return {path, name, content, type}
       ↓
Renderer: createChapter()
       ↓
IPC → Main: db:createChapter
       ↓
DatabaseService: INSERT INTO chapters
       ↓
Return chapter object
       ↓
Renderer: Update UI
```

### 2. Génération de flashcards

```
User clicks "Générer"
       ↓
Renderer: generateFlashcards()
       ↓
IPC → Main: ai:generateFlashcards
       ↓
AIService: Call Claude API
       ↓
Claude processes & returns JSON
       ↓
Main: Parse & validate response
       ↓
For each flashcard:
    IPC → Main: db:createFlashcard
    DatabaseService: INSERT INTO flashcards
       ↓
Return success
       ↓
Renderer: Show success message
```

### 3. Révision avec répétition espacée

```
User opens Review page
       ↓
Renderer: getFlashcardsDueForReview()
       ↓
IPC → Main: db:getFlashcardsDueForReview
       ↓
DatabaseService: SELECT WHERE next_review_date <= NOW
       ↓
Return flashcards array
       ↓
Renderer: Display flashcard
       ↓
User rates difficulty
       ↓
Renderer: recordReview(id, rating, success)
       ↓
IPC → Main: db:recordReview
       ↓
DatabaseService:
    - Get flashcard current state
    - Apply SM-2 algorithm
    - Calculate next review date
    - UPDATE flashcards
    - INSERT INTO review_history
       ↓
Return review history
       ↓
Renderer: Next flashcard
```

## Base de données SQLite

### Schéma

```sql
subjects
├── id (PRIMARY KEY)
├── name
├── color
└── created_at

chapters
├── id (PRIMARY KEY)
├── subject_id (FK → subjects)
├── name
├── content
├── file_path
└── created_at

flashcards
├── id (PRIMARY KEY)
├── chapter_id (FK → chapters)
├── question
├── answer
├── difficulty (easy|medium|hard)
├── next_review_date
├── review_count
├── easiness_factor (SM-2)
├── interval (SM-2)
├── repetitions (SM-2)
└── created_at

quizzes
├── id (PRIMARY KEY)
├── chapter_id (FK → chapters)
├── question
├── option_a
├── option_b
├── option_c
├── option_d
├── correct_option (a|b|c|d)
├── explanation
└── created_at

review_history
├── id (PRIMARY KEY)
├── flashcard_id (FK → flashcards)
├── reviewed_at
├── difficulty_rating
└── success (0|1)
```

### Relations

```
subjects (1) ──< (n) chapters
chapters (1) ──< (n) flashcards
chapters (1) ──< (n) quizzes
flashcards (1) ──< (n) review_history
```

## Algorithme de répétition espacée (SM-2)

```
Input: quality (0=hard, 1=medium, 2=easy)
       easiness_factor (EF)
       interval (I)
       repetitions (N)

If quality = 0 (hard):
    EF = max(1.3, EF - 0.2)
    N = 0
    I = 1 day

Else if quality = 1 (medium):
    EF = max(1.3, EF - 0.05)
    N = N + 1
    If N = 1: I = 1 day
    Else if N = 2: I = 3 days
    Else: I = round(I × EF)

Else (quality = 2, easy):
    EF = min(2.5, EF + 0.1)
    N = N + 1
    If N = 1: I = 1 day
    Else if N = 2: I = 6 days
    Else: I = round(I × EF)

Next review date = today + I days
```

## Communication IPC (Inter-Process Communication)

### Sécurité

```typescript
// preload.ts (bridge sécurisé)
contextBridge.exposeInMainWorld('electronAPI', {
  getSubjects: () => ipcRenderer.invoke('db:getSubjects'),
  // ...
});

// renderer (React)
const subjects = await window.electronAPI.getSubjects();

// main.ts
ipcMain.handle('db:getSubjects', async () => {
  return dbService.getSubjects();
});
```

### Channels IPC

**Database:**
- `db:getSubjects`
- `db:createSubject`
- `db:getChaptersBySubject`
- `db:createChapter`
- `db:getFlashcardsByChapter`
- `db:createFlashcard`
- `db:updateFlashcard`
- `db:getFlashcardsDueForReview`
- `db:recordReview`
- `db:getQuizzesByChapter`
- `db:createQuiz`
- `db:getStatistics`

**File:**
- `file:selectFile`

**AI:**
- `ai:generateFlashcards`
- `ai:generateQuizzes`

**Settings:**
- `settings:getApiKey`
- `settings:setApiKey`
- `theme:get`
- `theme:set`

## Stack technique détaillée

### Frontend
- **React 19** : Library UI
- **TypeScript 5.9** : Typage statique
- **Tailwind CSS 4** : Styling
- **Heroicons** : Icônes
- **Vite 7** : Bundler dev & build

### Backend (Main Process)
- **Electron 39** : Framework desktop
- **Node.js** : Runtime
- **better-sqlite3** : Database
- **pdf-parse** : Extraction PDF
- **@anthropic-ai/sdk** : API Claude

### Build & Dev Tools
- **electron-builder** : Packaging
- **tsx** : Execute TypeScript
- **concurrently** : Run multiple commands
- **wait-on** : Wait for dev server

## Patterns et bonnes pratiques

### Separation of Concerns
- **Main Process** : Business logic, I/O, database
- **Renderer Process** : UI, user interactions
- **Services** : Logique métier réutilisable
- **Shared** : Types communs

### State Management
- React hooks (useState, useEffect)
- Pas de Redux nécessaire (taille modérée)
- State local par page

### Error Handling
- Try-catch dans tous les handlers IPC
- Messages d'erreur clairs pour l'utilisateur
- Logging des erreurs en mode dev

### Security
- Context isolation enabled
- Node integration disabled
- Preload script pour IPC sécurisé
- API key stockée localement (pas dans le code)

## Performance

### Optimisations
- Indexes SQLite sur foreign keys
- Requêtes DB optimisées (JOIN quand nécessaire)
- Lazy loading des pages React
- Virtualisation des listes (à implémenter)

### Limitations actuelles
- Pas de pagination (OK pour <10000 flashcards)
- Pas de cache (DB assez rapide)
- Chargement synchrone des données

## Évolutions futures

### Architecture
- [ ] Séparation en microservices ?
- [ ] Worker threads pour génération IA
- [ ] Cache Redis pour performances
- [ ] API REST pour version web

### Features
- [ ] Synchronisation cloud
- [ ] Multi-utilisateurs
- [ ] Import/export avancé
- [ ] Plugins système
