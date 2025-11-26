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
