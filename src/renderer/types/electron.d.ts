export interface ElectronAPI {
  // Database
  getSubjects: () => Promise<any[]>;
  createSubject: (name: string, color: string) => Promise<any>;
  deleteSubject: (id: number) => Promise<void>;
  getChaptersBySubject: (subjectId: number) => Promise<any[]>;
  createChapter: (subjectId: number, name: string, content: string, filePath: string | null) => Promise<any>;
  deleteChapter: (id: number) => Promise<void>;
  updateChapter: (id: number, name: string, content: string) => Promise<void>;
  getFlashcardsByChapter: (chapterId: number) => Promise<any[]>;
  createFlashcard: (data: any) => Promise<any>;
  deleteFlashcard: (id: number) => Promise<void>;
  updateFlashcard: (id: number, data: any) => Promise<void>;
  getFlashcardsDueForReview: () => Promise<any[]>;
  recordReview: (flashcardId: number, rating: string, success: boolean) => Promise<any>;
  getQuizzesByChapter: (chapterId: number) => Promise<any[]>;
  createQuiz: (data: any) => Promise<any>;
  deleteQuiz: (id: number) => Promise<void>;
  getStatistics: () => Promise<any>;

  // Events
  getEvents: () => Promise<any[]>;
  getUpcomingEvents: (daysAhead: number) => Promise<any[]>;
  getEventsBySubject: (subjectId: number) => Promise<any[]>;
  createEvent: (subjectId: number, title: string, eventType: string, eventDate: string, description?: string) => Promise<any>;
  updateEvent: (id: number, title: string, eventType: string, eventDate: string, description?: string) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;

  // Formulas
  getFormulas: () => Promise<any[]>;
  getFormulasBySubject: (subjectId: number) => Promise<any[]>;
  getFormulasByTheme: (theme: string) => Promise<any[]>;
  searchFormulas: (query: string) => Promise<any[]>;
  createFormula: (subjectId: number, theme: string, title: string, formula: string, description?: string, variables?: string, chapterId?: number) => Promise<any>;
  updateFormula: (id: number, theme: string, title: string, formula: string, description?: string, variables?: string) => Promise<void>;
  deleteFormula: (id: number) => Promise<void>;
  getThemesBySubject: (subjectId: number) => Promise<string[]>;

  // File operations
  selectFile: () => Promise<{
    path: string;
    name: string;
    content: string;
    type: string;
  } | null>;

  // AI operations
  generateFlashcards: (content: string, count: number, chapterTitle: string) => Promise<any[]>;
  generateQuizzes: (content: string, count: number, chapterTitle: string) => Promise<any[]>;
  generateFormulas: (content: string, chapterTitle: string) => Promise<any[]>;

  // Settings
  getApiKey: () => Promise<string | null>;
  setApiKey: (apiKey: string) => Promise<boolean>;

  // Theme
  getTheme: () => Promise<string>;
  setTheme: (theme: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
