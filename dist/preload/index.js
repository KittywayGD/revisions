"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Database
  getSubjects: () => electron.ipcRenderer.invoke("db:getSubjects"),
  createSubject: (name, color) => electron.ipcRenderer.invoke("db:createSubject", name, color),
  deleteSubject: (id) => electron.ipcRenderer.invoke("db:deleteSubject", id),
  getChaptersBySubject: (subjectId) => electron.ipcRenderer.invoke("db:getChaptersBySubject", subjectId),
  createChapter: (subjectId, name, content, filePath) => electron.ipcRenderer.invoke("db:createChapter", subjectId, name, content, filePath),
  deleteChapter: (id) => electron.ipcRenderer.invoke("db:deleteChapter", id),
  updateChapter: (id, name, content) => electron.ipcRenderer.invoke("db:updateChapter", id, name, content),
  getFlashcardsByChapter: (chapterId) => electron.ipcRenderer.invoke("db:getFlashcardsByChapter", chapterId),
  createFlashcard: (data) => electron.ipcRenderer.invoke("db:createFlashcard", data),
  deleteFlashcard: (id) => electron.ipcRenderer.invoke("db:deleteFlashcard", id),
  updateFlashcard: (id, data) => electron.ipcRenderer.invoke("db:updateFlashcard", id, data),
  getFlashcardsDueForReview: () => electron.ipcRenderer.invoke("db:getFlashcardsDueForReview"),
  recordReview: (flashcardId, rating, success) => electron.ipcRenderer.invoke("db:recordReview", flashcardId, rating, success),
  getQuizzesByChapter: (chapterId) => electron.ipcRenderer.invoke("db:getQuizzesByChapter", chapterId),
  createQuiz: (data) => electron.ipcRenderer.invoke("db:createQuiz", data),
  deleteQuiz: (id) => electron.ipcRenderer.invoke("db:deleteQuiz", id),
  getStatistics: () => electron.ipcRenderer.invoke("db:getStatistics"),
  // Events
  getEvents: () => electron.ipcRenderer.invoke("db:getEvents"),
  getUpcomingEvents: (daysAhead) => electron.ipcRenderer.invoke("db:getUpcomingEvents", daysAhead),
  getEventsBySubject: (subjectId) => electron.ipcRenderer.invoke("db:getEventsBySubject", subjectId),
  createEvent: (subjectId, title, eventType, eventDate, description) => electron.ipcRenderer.invoke("db:createEvent", subjectId, title, eventType, eventDate, description),
  updateEvent: (id, title, eventType, eventDate, description) => electron.ipcRenderer.invoke("db:updateEvent", id, title, eventType, eventDate, description),
  deleteEvent: (id) => electron.ipcRenderer.invoke("db:deleteEvent", id),
  // File operations
  selectFile: () => electron.ipcRenderer.invoke("file:selectFile"),
  // AI operations
  generateFlashcards: (content, count, chapterTitle) => electron.ipcRenderer.invoke("ai:generateFlashcards", content, count, chapterTitle),
  generateQuizzes: (content, count, chapterTitle) => electron.ipcRenderer.invoke("ai:generateQuizzes", content, count, chapterTitle),
  // Settings
  getApiKey: () => electron.ipcRenderer.invoke("settings:getApiKey"),
  setApiKey: (apiKey) => electron.ipcRenderer.invoke("settings:setApiKey", apiKey),
  // Theme
  getTheme: () => electron.ipcRenderer.invoke("theme:get"),
  setTheme: (theme) => electron.ipcRenderer.invoke("theme:set", theme)
});
