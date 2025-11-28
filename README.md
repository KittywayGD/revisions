# 📚 PSI Révision App

Application desktop intelligente de révision pour les cours de PSI (Physique et Sciences de l'Ingénieur) avec génération automatique de contenu par IA.

## ✨ Fonctionnalités

### 📖 Gestion de bibliothèque
- Import de cours en **PDF, Markdown ou TXT**
- Organisation par matières et chapitres
- Extraction automatique du texte
- Vue détaillée par chapitre avec gestion des flashcards/quiz
- **Suppression complète** : matières, chapitres, flashcards et quiz

### 🤖 Génération par IA (Claude Haiku 4.5)
- **Flashcards** intelligentes avec questions/réponses
- **Quiz QCM** avec 4 options et explications
- **📐 Extraction automatique de formules** depuis vos cours
- **Support LaTeX** : Formules mathématiques rendues avec KaTeX
- **Support graphiques** : Courbes et diagrammes avec Recharts

### 🧠 Système de révision intelligent
- **Répétition espacée** (algorithme SM-2)
- **Priorisation automatique** selon vos événements (tests, khôlles, examens)
- Notation facile/moyen/difficile
- Suivi de progression personnalisé

### 📐 Formulaire interactif
- **Base de données searchable** de toutes vos formules
- Organisation automatique par thème et matière
- Recherche instantanée et filtres avancés
- Rendu LaTeX professionnel
- Variables annotées et descriptions
- **Mise à jour automatique** à l'ajout/suppression de cours

### 📅 Calendrier et planification
- Gestion des **tests, khôlles et examens**
- Visualisation des événements à venir
- **Révisions priorisées** automatiquement avant les échéances :
  - ×3 boost si événement dans 1-3 jours
  - ×2 boost si événement dans 4-7 jours
  - ×1.5 boost si événement dans 8-14 jours
- Affichage sur le dashboard avec code couleur d'urgence

### 📊 Statistiques détaillées
- Taux de réussite global et par matière
- Historique des révisions
- Graphiques de progression
- Suivi des performances

### 🎨 Interface moderne
- Design épuré et intuitif
- **Mode sombre/clair**
- Animations fluides
- Responsive design

## 🛠️ Technologies

- **Frontend** : Electron + React + TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : SQLite (better-sqlite3)
- **IA** : Claude Haiku 4.5 (Anthropic API)
- **LaTeX** : KaTeX
- **Graphiques** : Recharts
- **Build** : Vite + electron-builder

## 📦 Installation

### 1. Prérequis
- Node.js 18+
- npm ou yarn

### 2. Installation

```bash
# Clonez le repository
git clone <repo-url>
cd psi-revision-app

# Installez les dépendances
npm install
```

### 3. Configuration API

1. Obtenez une clé API sur [console.anthropic.com](https://console.anthropic.com)
2. Lancez l'application
3. Allez dans **Paramètres**
4. Entrez votre clé API

## 🚀 Utilisation

### Développement

```bash
npm run dev
```

Cela démarre :
- Le serveur Vite sur http://localhost:5173
- Le processus principal Electron

### Build production

```bash
npm run build    # Compile TypeScript
npm run package  # Crée l'exécutable
```

Les fichiers de distribution seront dans `release/`.

## 📖 Guide d'utilisation

### 1️⃣ Importer vos cours

1. Allez dans **Bibliothèque**
2. Créez une matière (ex: Physique)
3. Importez un cours (PDF, MD, TXT)
4. Le cours est automatiquement extrait et sauvegardé

### 2️⃣ Générer du contenu

**Option A : Génération automatique**
1. Allez dans **Générer contenu**
2. Sélectionnez matière et chapitre
3. Choisissez le type :
   - **Flashcards** : Questions/réponses pour mémorisation
   - **Quiz** : QCM avec explications
   - **Formules** : Extraction automatique des formules importantes
4. Cliquez sur **Générer**

**Option B : Création manuelle**
- Flashcards/Quiz : Depuis la vue détaillée du chapitre
- Formules : Bouton "Ajouter formule" dans **Formulaire**

### 3️⃣ Planifier vos examens

1. Allez dans **Calendrier**
2. Créez un événement :
   - Type : Test, Khôlle, Examen, Autre
   - Date et matière
   - Description (optionnel)
3. Les révisions seront **automatiquement priorisées** !

### 4️⃣ Réviser efficacement

1. Allez dans **Révision**
2. Les cartes sont automatiquement triées par :
   - Urgence (événements proches)
   - Date de révision
3. Répondez et notez la difficulté
4. L'algorithme SM-2 optimise le planning

### 5️⃣ Consulter vos formules

1. Allez dans **Formulaire**
2. Utilisez la **recherche** instantanée
3. Filtrez par matière ou thème
4. Cliquez sur une formule pour voir les détails et variables

## 🎯 Fonctionnalités avancées

### LaTeX dans le contenu

L'IA génère automatiquement du LaTeX pour les formules :
- **Inline** : `$E = mc^2$` → $E = mc^2$
- **Display** : `$$\frac{1}{2}mv^2$$` → Formule centrée

### Graphiques automatiques

L'IA peut générer des graphiques pour visualiser :
- Courbes de fonctions
- Diagrammes de phase
- Évolutions temporelles
- Données numériques

Types supportés : `line`, `bar`, `area`, `scatter`, `pie`

### Algorithme de répétition espacée

Basé sur **SM-2** avec adaptation selon événements :
- Calcul automatique de l'intervalle
- Facteur de facilité personnalisé
- Boost de priorité avant examens

## 📁 Structure du projet

```
psi-revision-app/
├── src/
│   ├── main/                    # Processus principal Electron
│   │   ├── main.ts              # Point d'entrée + IPC handlers
│   │   └── preload.ts           # Bridge sécurisé renderer↔main
│   ├── renderer/                # Interface React
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── LaTeXRenderer.tsx
│   │   │   ├── ChartRenderer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── Dashboard.tsx    # Vue d'ensemble + événements
│   │   │   ├── Library.tsx      # Gestion des cours
│   │   │   ├── Generate.tsx     # Génération IA
│   │   │   ├── Review.tsx       # Mode révision
│   │   │   ├── QuizPage.tsx     # Mode quiz
│   │   │   ├── Formulas.tsx     # Formulaire interactif
│   │   │   ├── Calendar.tsx     # Gestion événements
│   │   │   ├── Statistics.tsx   # Statistiques
│   │   │   └── Settings.tsx     # Configuration
│   │   └── App.tsx              # Composant racine
│   ├── services/                # Services métier
│   │   ├── database.ts          # SQLite + requêtes
│   │   ├── ai.ts                # Anthropic API
│   │   ├── file.ts              # Extraction PDF/MD/TXT
│   │   └── spaced-repetition.ts # Algorithme SM-2
│   └── shared/
│       └── types.ts             # Types TypeScript
├── database/                    # DB SQLite (auto-créée)
└── config/                      # Configuration (auto-créée)
```

## 🗄️ Schéma de base de données

```sql
subjects       → Matières (nom, couleur)
chapters       → Chapitres (contenu, fichier source)
flashcards     → Flashcards (question, réponse, SM-2 data, chart_data)
quizzes        → Quiz (question, 4 options, explication, chart_data)
formulas       → Formules (titre, formule LaTeX, thème, variables)
events         → Événements (type, date, description)
review_history → Historique des révisions
```

## 💰 Coût de l'API

**Modèle** : `claude-3-haiku-20240307`

**Tarifs estimés** (Novembre 2024) :
- Input : ~$0.25 / 1M tokens
- Output : ~$1.25 / 1M tokens

**Exemples** :
- Cours de 5000 mots + 10 flashcards : **~$0.003**
- Extraction formules d'un chapitre : **~$0.002**
- 100 générations/mois : **~$0.30**

💡 Très économique pour un usage étudiant !

## 🔧 Dépannage

### L'application ne démarre pas
```bash
# Vérifiez Node.js
node --version  # Doit être ≥18

# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur lors de la génération IA
- ✅ Vérifiez votre clé API dans **Paramètres**
- ✅ Vérifiez votre connexion Internet
- ✅ Consultez les logs (DevTools → Console)

### La base de données est corrompue
```bash
# Sauvegardez d'abord
cp ~/Library/Application\ Support/psi-revision-app/database/psi-revision.db backup.db

# Supprimez et relancez
rm ~/Library/Application\ Support/psi-revision-app/database/psi-revision.db
# L'app recrée automatiquement une DB vierge
```

### Les formules LaTeX ne s'affichent pas
- Vérifiez que KaTeX est installé : `npm list katex`
- Redémarrez l'application

## 🎓 Cas d'usage typique

### Semaine avant un test de Physique

**Lundi** :
1. Créer l'événement "Test Physique - Mécanique" pour vendredi
2. Importer le cours de mécanique (PDF)
3. Générer :
   - 15 flashcards
   - 10 quiz
   - Formules (extraction auto)

**Mardi-Jeudi** :
- Mode **Révision** : L'app priorise automatiquement la Physique
- Consultation du **Formulaire** pour les formules clés
- Quiz pour tester la compréhension

**Vendredi** :
- Dernière session de révision (boost ×3 de priorité)
- Consultation rapide des formules
- ✅ Prêt pour le test !

## 🚧 Roadmap

### Fonctionnalités planifiées
- [ ] Mode hors-ligne complet pour révisions
- [ ] Export Anki
- [ ] Synchronisation cloud (optionnelle)
- [ ] Mode collaboratif (partage de decks)
- [ ] Support audio (TTS pour les flashcards)
- [ ] Application mobile compagnon
- [ ] Raccourcis clavier personnalisables
- [ ] Thèmes personnalisables

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

ISC

## 👨‍💻 Auteur

Développé avec ❤️ pour les étudiants de PSI

---

**⭐ Si ce projet vous aide dans vos révisions, n'hésitez pas à lui donner une étoile !**
