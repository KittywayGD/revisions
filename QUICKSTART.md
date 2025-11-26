# Guide de démarrage rapide - PSI Révision

## 🚀 Installation et premier lancement

### 1. Installation des dépendances

```bash
cd psi-revision-app
npm install
```

### 2. Lancer l'application

```bash
npm run dev
```

L'application devrait s'ouvrir automatiquement après quelques secondes.

## 📝 Configuration initiale

### Configurer la clé API Anthropic

1. Cliquez sur **Paramètres** dans la barre latérale (en bas)
2. Obtenez une clé API sur [console.anthropic.com](https://console.anthropic.com)
3. Collez votre clé API dans le champ prévu
4. Cliquez sur **Enregistrer**

⚠️ **Sans clé API, la génération de contenu ne fonctionnera pas !**

## 📚 Tester l'application rapidement

### Option 1 : Utiliser le cours d'exemple

Un fichier `example-course.md` est fourni avec un cours de thermodynamique.

1. Allez dans **Bibliothèque**
2. Cliquez sur **+ Ajouter une matière**
3. Créez une matière "Physique" avec une couleur bleue
4. Cliquez sur **Importer un cours**
5. Sélectionnez le fichier `example-course.md`

### Option 2 : Importer vos propres cours

Formats supportés :
- **PDF** : Cours en PDF (extraction automatique du texte)
- **Markdown** : Fichiers .md
- **Texte** : Fichiers .txt

## 🤖 Générer des flashcards et quiz

1. Allez dans **Générer contenu**
2. Sélectionnez une matière et un chapitre
3. Choisissez le type de contenu :
   - **Flashcards** : Questions/réponses pour révision
   - **Quiz** : QCM avec 4 options
4. Définissez le nombre d'éléments (recommandé : 5-15)
5. Cliquez sur **Générer**

⏱️ La génération prend environ 5-15 secondes selon le nombre d'éléments.

## 📖 Réviser vos flashcards

1. Allez dans **Révision**
2. Les cartes à réviser s'affichent automatiquement
3. Lisez la question, puis cliquez sur la carte pour voir la réponse
4. Notez votre performance :
   - **Difficile** : À revoir demain
   - **Moyen** : À revoir dans 3 jours
   - **Facile** : À revoir dans 6+ jours

🧠 L'algorithme de répétition espacée optimise automatiquement vos révisions !

## 🎯 Faire un quiz

1. Allez dans **Quiz**
2. Sélectionnez une matière et un chapitre
3. Cliquez sur **Commencer le quiz**
4. Répondez aux questions
5. Consultez vos résultats à la fin

## 📊 Voir vos statistiques

Allez dans **Statistiques** pour voir :
- Nombre total de flashcards
- Nombre de révisions effectuées
- Taux de réussite global et par matière
- Historique des révisions sur 30 jours

## 🎨 Changer le thème

Cliquez sur l'icône **lune/soleil** en bas de la barre latérale pour basculer entre mode clair et mode sombre.

## 🔧 Résolution de problèmes

### L'application ne démarre pas

```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur de génération IA

- Vérifiez que votre clé API est correcte dans Paramètres
- Vérifiez votre connexion Internet
- Vérifiez votre crédit API sur console.anthropic.com

### La base de données semble corrompue

La base de données est dans votre dossier utilisateur :
- **Mac/Linux** : `~/Library/Application Support/psi-revision-app/database/`
- **Windows** : `%APPDATA%/psi-revision-app/database/`

Vous pouvez supprimer `psi-revision.db` pour repartir de zéro.

## 💡 Conseils d'utilisation

### Pour une révision efficace
1. **Révisez quotidiennement** : Même 10-15 minutes par jour
2. **Soyez honnête** dans vos notations : Ne mettez pas "Facile" si vous avez hésité
3. **Créez des petits paquets** : 10-15 flashcards par chapitre, c'est mieux que 50 d'un coup
4. **Variez les matières** : Alternez pour éviter la monotonie

### Pour la génération de contenu
1. **Qualité du cours** : Plus votre cours est structuré, meilleurs seront les flashcards
2. **Nombre optimal** : 10-15 éléments par génération donnent de meilleurs résultats
3. **Relisez et éditez** : L'IA peut faire des erreurs, vérifiez le contenu généré

### Organisation
1. **Une matière par discipline** : Physique, Chimie, Maths, SI, etc.
2. **Un chapitre par thème** : Thermodynamique, Optique, etc.
3. **Importez au fur et à mesure** : Pas besoin de tout importer d'un coup

## 🎓 Exemple de workflow complet

1. **Lundi** : Importer le cours de thermodynamique
2. **Lundi** : Générer 10 flashcards
3. **Mardi** : Réviser les 10 flashcards (1ère fois)
4. **Mercredi** : Générer 10 quiz et les faire
5. **Jeudi** : Réviser à nouveau les flashcards "difficiles"
6. **Vendredi** : Faire un nouveau quiz pour vérifier
7. **Semaine suivante** : Réviser selon l'algorithme de répétition espacée

## ⚡ Raccourcis (à venir)

Pour l'instant, utilisez la souris pour naviguer. Les raccourcis clavier seront ajoutés dans une future version.

## 📈 Suivre votre progression

Consultez régulièrement la page **Statistiques** pour :
- Identifier vos points faibles (matières avec faible taux de réussite)
- Voir votre constance (graphique d'activité)
- Célébrer vos progrès !

## 🆘 Besoin d'aide ?

- Consultez le fichier `README.md` pour plus de détails
- Consultez `NEXT_STEPS.md` pour les fonctionnalités à venir
- Ouvrez une issue sur GitHub si vous rencontrez un bug

---

**Bon courage pour vos révisions ! 🚀**
