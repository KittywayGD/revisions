// Database types
export interface Subject {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Chapter {
  id: number;
  subject_id: number;
  name: string;
  content: string;
  file_path: string | null;
  created_at: string;
}

export interface Flashcard {
  id: number;
  chapter_id: number;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  next_review_date: string;
  review_count: number;
  created_at: string;
}

export interface Quiz {
  id: number;
  chapter_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  created_at: string;
}

export interface ReviewHistory {
  id: number;
  flashcard_id: number;
  reviewed_at: string;
  difficulty_rating: 'easy' | 'medium' | 'hard';
  success: boolean;
}

// Extended types with relations
export interface ChapterWithSubject extends Chapter {
  subject_name: string;
  subject_color: string;
}

export interface FlashcardWithChapter extends Flashcard {
  chapter_name: string;
  subject_name: string;
}

// API types
export interface GenerateFlashcardsRequest {
  chapterId: number;
  content: string;
  count: number;
}

export interface GenerateQuizzesRequest {
  chapterId: number;
  content: string;
  count: number;
}

export interface FlashcardGenerationResult {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizGenerationResult {
  question: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
}

// UI types
export interface ReviewSession {
  flashcards: FlashcardWithChapter[];
  currentIndex: number;
  completed: number;
  correct: number;
  incorrect: number;
}

export interface QuizSession {
  quizzes: Quiz[];
  currentIndex: number;
  answers: (string | null)[];
  score: number;
}

export interface Statistics {
  totalFlashcards: number;
  totalReviews: number;
  successRate: number;
  reviewsBySubject: {
    subject_id: number;
    subject_name: string;
    count: number;
    success_rate: number;
  }[];
  reviewsByDay: {
    date: string;
    count: number;
  }[];
}

// Spaced repetition types
export interface SpacedRepetitionData {
  easinessFactor: number;
  interval: number;
  repetitions: number;
}

// File import types
export interface ImportedFile {
  name: string;
  path: string;
  content: string;
  type: 'pdf' | 'markdown' | 'txt';
}

// Theme
export type Theme = 'light' | 'dark';

// Navigation
export type NavigationPage = 'dashboard' | 'library' | 'generate' | 'review' | 'quiz' | 'statistics';
