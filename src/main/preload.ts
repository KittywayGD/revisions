import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database
  getSubjects: () => ipcRenderer.invoke('db:getSubjects'),
  createSubject: (name: string, color: string) => ipcRenderer.invoke('db:createSubject', name, color),
  deleteSubject: (id: number) => ipcRenderer.invoke('db:deleteSubject', id),
  getChaptersBySubject: (subjectId: number) => ipcRenderer.invoke('db:getChaptersBySubject', subjectId),
  createChapter: (subjectId: number, name: string, content: string, filePath: string | null) =>
    ipcRenderer.invoke('db:createChapter', subjectId, name, content, filePath),
  deleteChapter: (id: number) => ipcRenderer.invoke('db:deleteChapter', id),
  updateChapter: (id: number, name: string, content: string) => ipcRenderer.invoke('db:updateChapter', id, name, content),
  getFlashcardsByChapter: (chapterId: number) => ipcRenderer.invoke('db:getFlashcardsByChapter', chapterId),
  createFlashcard: (data: any) => ipcRenderer.invoke('db:createFlashcard', data),
  deleteFlashcard: (id: number) => ipcRenderer.invoke('db:deleteFlashcard', id),
  updateFlashcard: (id: number, data: any) => ipcRenderer.invoke('db:updateFlashcard', id, data),
  getFlashcardsDueForReview: () => ipcRenderer.invoke('db:getFlashcardsDueForReview'),
  recordReview: (flashcardId: number, rating: string, success: boolean) =>
    ipcRenderer.invoke('db:recordReview', flashcardId, rating, success),
  getQuizzesByChapter: (chapterId: number) => ipcRenderer.invoke('db:getQuizzesByChapter', chapterId),
  createQuiz: (data: any) => ipcRenderer.invoke('db:createQuiz', data),
  deleteQuiz: (id: number) => ipcRenderer.invoke('db:deleteQuiz', id),
  getStatistics: () => ipcRenderer.invoke('db:getStatistics'),

  // Events
  getEvents: () => ipcRenderer.invoke('db:getEvents'),
  getUpcomingEvents: (daysAhead: number) => ipcRenderer.invoke('db:getUpcomingEvents', daysAhead),
  getEventsBySubject: (subjectId: number) => ipcRenderer.invoke('db:getEventsBySubject', subjectId),
  createEvent: (subjectId: number, title: string, eventType: string, eventDate: string, description?: string) =>
    ipcRenderer.invoke('db:createEvent', subjectId, title, eventType, eventDate, description),
  updateEvent: (id: number, title: string, eventType: string, eventDate: string, description?: string) =>
    ipcRenderer.invoke('db:updateEvent', id, title, eventType, eventDate, description),
  deleteEvent: (id: number) => ipcRenderer.invoke('db:deleteEvent', id),

  // Formulas
  getFormulas: () => ipcRenderer.invoke('db:getFormulas'),
  getFormulasBySubject: (subjectId: number) => ipcRenderer.invoke('db:getFormulasBySubject', subjectId),
  getFormulasByTheme: (theme: string) => ipcRenderer.invoke('db:getFormulasByTheme', theme),
  searchFormulas: (query: string) => ipcRenderer.invoke('db:searchFormulas', query),
  createFormula: (subjectId: number, theme: string, title: string, formula: string, description?: string, variables?: string, chapterId?: number) =>
    ipcRenderer.invoke('db:createFormula', subjectId, theme, title, formula, description, variables, chapterId),
  updateFormula: (id: number, theme: string, title: string, formula: string, description?: string, variables?: string) =>
    ipcRenderer.invoke('db:updateFormula', id, theme, title, formula, description, variables),
  deleteFormula: (id: number) => ipcRenderer.invoke('db:deleteFormula', id),
  getThemesBySubject: (subjectId: number) => ipcRenderer.invoke('db:getThemesBySubject', subjectId),

  // File operations
  selectFile: () => ipcRenderer.invoke('file:selectFile'),

  // Exercises
  getExercisesByChapter: (chapterId: number) => ipcRenderer.invoke('db:getExercisesByChapter', chapterId),
  getAllExercises: () => ipcRenderer.invoke('db:getAllExercises'),
  getExercisesByStatus: (status: string) => ipcRenderer.invoke('db:getExercisesByStatus', status),
  createExercise: (chapterId: number, title: string, statement: string, solution: string, difficulty: string) =>
    ipcRenderer.invoke('db:createExercise', chapterId, title, statement, solution, difficulty),
  updateExerciseStatus: (id: number, status: string) => ipcRenderer.invoke('db:updateExerciseStatus', id, status),
  deleteExercise: (id: number) => ipcRenderer.invoke('db:deleteExercise', id),

  // AI operations
  generateFlashcards: (content: string, count: number, chapterTitle: string) =>
    ipcRenderer.invoke('ai:generateFlashcards', content, count, chapterTitle),
  generateQuizzes: (content: string, count: number, chapterTitle: string) =>
    ipcRenderer.invoke('ai:generateQuizzes', content, count, chapterTitle),
  generateFormulas: (content: string, chapterTitle: string) =>
    ipcRenderer.invoke('ai:generateFormulas', content, chapterTitle),
  generateExercises: (content: string, count: number, chapterTitle: string) =>
    ipcRenderer.invoke('ai:generateExercises', content, count, chapterTitle),

  // Settings
  getApiKey: () => ipcRenderer.invoke('settings:getApiKey'),
  setApiKey: (apiKey: string) => ipcRenderer.invoke('settings:setApiKey', apiKey),

  // Theme
  getTheme: () => ipcRenderer.invoke('theme:get'),
  setTheme: (theme: string) => ipcRenderer.invoke('theme:set', theme),
});
