/**
 * Script pour peupler la base de données avec des données de test
 * Utile pour le développement
 *
 * Usage: npx tsx src/scripts/seed-database.ts
 */

import { DatabaseService } from '../services/database';
import path from 'path';
import os from 'os';
import fs from 'fs';

const dbPath = path.join(os.homedir(), 'Library/Application Support/psi-revision-app-dev/database/psi-revision.db');

// Create directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('🗄️  Initializing database at:', dbPath);

const db = new DatabaseService(dbPath);
db.initialize();

console.log('✅ Database initialized');

// Create subjects
console.log('📚 Creating subjects...');

const physique = db.createSubject('Physique', '#3B82F6');
const chimie = db.createSubject('Chimie', '#8B5CF6');
const maths = db.createSubject('Mathématiques', '#EC4899');

console.log('✅ Subjects created');

// Create chapters
console.log('📖 Creating chapters...');

const thermoChapter = db.createChapter(
  physique.id,
  'Thermodynamique - Gaz parfaits',
  `
# Thermodynamique - Les gaz parfaits

## Équation d'état
PV = nRT

Où :
- P est la pression (Pa)
- V est le volume (m³)
- n est la quantité de matière (mol)
- R = 8,314 J·mol⁻¹·K⁻¹
- T est la température (K)

## Transformations
- Isotherme : T = constante → PV = constante
- Isobare : P = constante → V/T = constante
- Isochore : V = constante → P/T = constante
- Adiabatique : Q = 0 → PVᵞ = constante

## Premier principe
ΔU = W + Q
  `,
  null
);

const optiqueChapter = db.createChapter(
  physique.id,
  'Optique géométrique',
  `
# Optique géométrique

## Lois de Snell-Descartes
n₁ sin(i₁) = n₂ sin(i₂)

## Lentilles minces
Relation de conjugaison :
1/f' = 1/OA' - 1/OA

Grandissement :
γ = A'B'/AB = OA'/OA
  `,
  null
);

const chimieChapter = db.createChapter(
  chimie.id,
  'Cinétique chimique',
  `
# Cinétique chimique

## Vitesse de réaction
v = -1/νᵢ × d[Aᵢ]/dt

## Ordre de réaction
Pour A → produits :
- Ordre 0 : [A] = [A]₀ - kt
- Ordre 1 : [A] = [A]₀ × e⁻ᵏᵗ
- Ordre 2 : 1/[A] = 1/[A]₀ + kt

## Loi d'Arrhenius
k = A × e^(-Ea/RT)
  `,
  null
);

console.log('✅ Chapters created');

// Create some flashcards
console.log('🎴 Creating flashcards...');

const flashcardsData = [
  {
    chapter_id: thermoChapter.id,
    question: "Qu'est-ce que l'équation d'état des gaz parfaits ?",
    answer: 'PV = nRT, où P est la pression, V le volume, n la quantité de matière, R la constante des gaz parfaits (8,314 J·mol⁻¹·K⁻¹) et T la température absolue.',
    difficulty: 'easy',
  },
  {
    chapter_id: thermoChapter.id,
    question: 'Quelle est la relation pour une transformation isotherme ?',
    answer: 'Pour une transformation isotherme (T = constante), on a : PV = constante',
    difficulty: 'easy',
  },
  {
    chapter_id: thermoChapter.id,
    question: "Qu'exprime le premier principe de la thermodynamique ?",
    answer: 'ΔU = W + Q : La variation d\'énergie interne est égale à la somme du travail reçu et de la chaleur reçue par le système.',
    difficulty: 'medium',
  },
  {
    chapter_id: thermoChapter.id,
    question: 'Quelle est la valeur de la constante des gaz parfaits R ?',
    answer: 'R = 8,314 J·mol⁻¹·K⁻¹',
    difficulty: 'easy',
  },
  {
    chapter_id: optiqueChapter.id,
    question: 'Énoncez la loi de Snell-Descartes pour la réfraction',
    answer: 'n₁ sin(i₁) = n₂ sin(i₂), où n₁ et n₂ sont les indices des milieux et i₁, i₂ les angles d\'incidence et de réfraction.',
    difficulty: 'medium',
  },
  {
    chapter_id: optiqueChapter.id,
    question: 'Quelle est la relation de conjugaison pour une lentille mince ?',
    answer: '1/f\' = 1/OA\' - 1/OA, où f\' est la distance focale image.',
    difficulty: 'medium',
  },
  {
    chapter_id: chimieChapter.id,
    question: "Comment s'exprime la vitesse d'une réaction chimique ?",
    answer: 'v = -1/νᵢ × d[Aᵢ]/dt, où νᵢ est le coefficient stœchiométrique et [Aᵢ] la concentration du réactif.',
    difficulty: 'hard',
  },
  {
    chapter_id: chimieChapter.id,
    question: "Qu'est-ce que la loi d'Arrhenius ?",
    answer: 'k = A × e^(-Ea/RT) : La constante de vitesse dépend exponentiellement de l\'énergie d\'activation Ea et de la température T.',
    difficulty: 'hard',
  },
];

for (const cardData of flashcardsData) {
  db.createFlashcard(cardData);
}

console.log(`✅ ${flashcardsData.length} flashcards created`);

// Create some quizzes
console.log('❓ Creating quizzes...');

const quizzesData = [
  {
    chapter_id: thermoChapter.id,
    question: 'Quelle est l\'unité de la constante des gaz parfaits R ?',
    option_a: 'J·K⁻¹',
    option_b: 'J·mol⁻¹·K⁻¹',
    option_c: 'J·mol⁻¹',
    option_d: 'Pa·m³·K⁻¹',
    correct_option: 'b',
    explanation: 'R = 8,314 J·mol⁻¹·K⁻¹. L\'unité J·mol⁻¹·K⁻¹ provient de l\'équation PV = nRT.',
  },
  {
    chapter_id: thermoChapter.id,
    question: 'Dans une transformation adiabatique, que vaut la chaleur échangée ?',
    option_a: 'Q > 0',
    option_b: 'Q < 0',
    option_c: 'Q = 0',
    option_d: 'Q = constante',
    correct_option: 'c',
    explanation: 'Par définition, une transformation adiabatique se fait sans échange de chaleur : Q = 0.',
  },
  {
    chapter_id: optiqueChapter.id,
    question: 'Que vaut le grandissement γ pour une image de même taille que l\'objet ?',
    option_a: 'γ = 0',
    option_b: 'γ = 1',
    option_c: 'γ = -1',
    option_d: 'γ = ∞',
    correct_option: 'b',
    explanation: 'γ = A\'B\'/AB. Si l\'image a la même taille que l\'objet, γ = 1.',
  },
  {
    chapter_id: chimieChapter.id,
    question: 'Pour une réaction d\'ordre 1, comment évolue ln[A] en fonction du temps ?',
    option_a: 'Exponentiellement',
    option_b: 'Linéairement',
    option_c: 'Paraboliquement',
    option_d: 'Hyperboliquement',
    correct_option: 'b',
    explanation: 'Pour une réaction d\'ordre 1, ln[A] = ln[A]₀ - kt, donc ln[A] évolue linéairement avec t.',
  },
];

for (const quizData of quizzesData) {
  db.createQuiz(quizData);
}

console.log(`✅ ${quizzesData.length} quizzes created`);

// Show statistics
const subjects = db.getSubjects();
console.log('\n📊 Summary:');
console.log(`   Subjects: ${subjects.length}`);

for (const subject of subjects) {
  const chapters = db.getChaptersBySubject(subject.id);
  console.log(`   - ${subject.name}: ${chapters.length} chapters`);

  for (const chapter of chapters) {
    const flashcards = db.getFlashcardsByChapter(chapter.id);
    const quizzes = db.getQuizzesByChapter(chapter.id);
    console.log(`     • ${chapter.name}: ${flashcards.length} flashcards, ${quizzes.length} quizzes`);
  }
}

console.log('\n✨ Database seeded successfully!');
console.log('🚀 You can now start the app with: npm run dev');

db.close();
