# PSI Révision App

Application desktop de révision pour les cours de PSI (Physique et Sciences de l'Ingénieur) avec génération automatique de flashcards et quiz par IA.

## Caractéristiques

- 📚 **Gestion de bibliothèque** : Import de cours en PDF, Markdown ou TXT
- 🤖 **Génération par IA** : Création automatique de flashcards et quiz avec Claude Haiku 4.5
- 🧠 **Répétition espacée** : Algorithme SM-2 pour optimiser la mémorisation
- 📊 **Statistiques** : Suivi de progression et performances détaillées
- 🎨 **Interface moderne** : Design épuré avec mode sombre/clair
- 💾 **Stockage local** : Base de données SQLite, fonctionne hors-ligne

## Technologies

- **Frontend** : Electron + React + TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : SQLite (better-sqlite3)
- **IA** : Claude Haiku 4.5 via API Anthropic
- **Build** : Vite + electron-builder

## Installation

1. Clonez le repository
```bash
git clone <repo-url>
cd psi-revision-app
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez votre clé API Anthropic
   - Obtenez une clé sur [console.anthropic.com](https://console.anthropic.com)
   - Lancez l'application et allez dans Paramètres
   - Entrez votre clé API

## Développement

Lancez l'application en mode développement :
```bash
npm run dev
```

Cela démarre :
- Le serveur Vite pour le renderer (React) sur http://localhost:5173
- Le processus principal Electron

## Build

Pour créer une version distribuable :

```bash
npm run build
npm run package
```

Les fichiers de distribution seront dans le dossier `release/`.

## Structure du projet

```
psi-revision-app/
├── src/
│   ├── main/              # Processus principal Electron
│   │   ├── main.ts        # Point d'entrée Electron
│   │   └── preload.ts     # Script preload pour IPC
│   ├── renderer/          # Interface React
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages principales
│   │   ├── styles/        # Styles CSS/Tailwind
│   │   └── App.tsx        # Composant racine
│   ├── services/          # Services (DB, IA, fichiers)
│   └── shared/            # Types et constantes partagés
├── database/              # Fichiers SQLite (généré)
├── config/                # Configuration (API keys)
└── dist/                  # Build output
```

## Fonctionnalités principales

### 1. Gestion des cours
- Import de fichiers PDF, Markdown, TXT
- Organisation par matières et chapitres
- Extraction automatique du texte

### 2. Génération de contenu
- Flashcards avec questions/réponses
- Quiz QCM avec 4 options
- Génération adaptée au niveau PSI

### 3. Système de révision
- Répétition espacée (algorithme SM-2)
- Notation facile/moyen/difficile
- Suivi de progression

### 4. Statistiques
- Taux de réussite global et par matière
- Historique des révisions
- Graphiques de progression

## Configuration de l'API

L'application utilise Claude Haiku 4.5 pour la génération de contenu.

**Modèle** : `claude-haiku-4-5-20251001`

**Coût estimé** (au 11/2024) :
- Input : ~$0.25 / 1M tokens
- Output : ~$1.25 / 1M tokens

Pour un cours de 5000 mots (≈7000 tokens) et génération de 10 flashcards :
- Coût : ≈ $0.003 par génération

## Raccourcis clavier

(À implémenter)
- `Cmd/Ctrl + N` : Nouveau cours
- `Cmd/Ctrl + R` : Commencer révision
- `Space` : Retourner la carte
- `1, 2, 3` : Noter difficile/moyen/facile

## Dépannage

### L'application ne démarre pas
- Vérifiez que Node.js 18+ est installé
- Supprimez `node_modules` et `package-lock.json`, puis `npm install`

### Erreur lors de la génération
- Vérifiez que votre clé API est valide
- Vérifiez votre connexion Internet
- Consultez les logs dans la console développeur

### La base de données est corrompue
- Sauvegardez `database/psi-revision.db`
- Supprimez le fichier et relancez l'app (une nouvelle DB sera créée)

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

ISC

## Auteur

Développé pour les étudiants de PSI avec ❤️
