import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database
  getSubjects: () => ipcRenderer.invoke('db:getSubjects'),
  createSubject: (name: string, color: string) => ipcRenderer.invoke('db:createSubject', name, color),
  getChaptersBySubject: (subjectId: number) => ipcRenderer.invoke('db:getChaptersBySubject', subjectId),
  createChapter: (subjectId: number, name: string, content: string, filePath: string | null) =>
    ipcRenderer.invoke('db:createChapter', subjectId, name, content, filePath),
  getFlashcardsByChapter: (chapterId: number) => ipcRenderer.invoke('db:getFlashcardsByChapter', chapterId),
  createFlashcard: (data: any) => ipcRenderer.invoke('db:createFlashcard', data),
  updateFlashcard: (id: number, data: any) => ipcRenderer.invoke('db:updateFlashcard', id, data),
  getFlashcardsDueForReview: () => ipcRenderer.invoke('db:getFlashcardsDueForReview'),
  recordReview: (flashcardId: number, rating: string, success: boolean) =>
    ipcRenderer.invoke('db:recordReview', flashcardId, rating, success),
  getQuizzesByChapter: (chapterId: number) => ipcRenderer.invoke('db:getQuizzesByChapter', chapterId),
  createQuiz: (data: any) => ipcRenderer.invoke('db:createQuiz', data),
  getStatistics: () => ipcRenderer.invoke('db:getStatistics'),

  // File operations
  selectFile: () => ipcRenderer.invoke('file:selectFile'),

  // AI operations
  generateFlashcards: (content: string, count: number, chapterTitle: string) =>
    ipcRenderer.invoke('ai:generateFlashcards', content, count, chapterTitle),
  generateQuizzes: (content: string, count: number, chapterTitle: string) =>
    ipcRenderer.invoke('ai:generateQuizzes', content, count, chapterTitle),

  // Settings
  getApiKey: () => ipcRenderer.invoke('settings:getApiKey'),
  setApiKey: (apiKey: string) => ipcRenderer.invoke('settings:setApiKey', apiKey),

  // Theme
  getTheme: () => ipcRenderer.invoke('theme:get'),
  setTheme: (theme: string) => ipcRenderer.invoke('theme:set', theme),
});
