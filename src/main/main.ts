import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { DatabaseService } from '../services/database.js';
import { AIService } from '../services/ai.js';
import { FileService } from '../services/file.js';

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService;
let aiService: AIService;
let fileService: FileService;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Initialize services
  const dbPath = path.join(app.getPath('userData'), 'database', 'psi-revision.db');
  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  dbService = new DatabaseService(dbPath);
  dbService.initialize();

  aiService = new AIService();
  try {
    const configPath = path.join(app.getPath('userData'), 'config', 'api-key.txt');
    const storedKey = await fs.readFile(configPath, 'utf-8');
    if (storedKey && storedKey.trim()) {
      aiService.setApiKey(storedKey.trim());
      console.log('✅ Clé API chargée au démarrage');
    } else {
      console.log('⚠️ Aucune clé API trouvée au démarrage');
    }
  } catch (error) {
    console.log('ℹ️ Première utilisation : pas de fichier de configuration API');
  }
  fileService = new FileService();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Database operations
ipcMain.handle('db:getSubjects', async () => {
  return dbService.getSubjects();
});

ipcMain.handle('db:createSubject', async (_, name: string, color: string) => {
  return dbService.createSubject(name, color);
});

ipcMain.handle('db:deleteSubject', async (_, id: number) => {
  return dbService.deleteSubject(id);
});

ipcMain.handle('db:getChaptersBySubject', async (_, subjectId: number) => {
  return dbService.getChaptersBySubject(subjectId);
});

ipcMain.handle('db:createChapter', async (_, subjectId: number, name: string, content: string, filePath: string | null) => {
  return dbService.createChapter(subjectId, name, content, filePath);
});

ipcMain.handle('db:deleteChapter', async (_, id: number) => {
  return dbService.deleteChapter(id);
});

ipcMain.handle('db:updateChapter', async (_, id: number, name: string, content: string) => {
  return dbService.updateChapter(id, name, content);
});

ipcMain.handle('db:getFlashcardsByChapter', async (_, chapterId: number) => {
  return dbService.getFlashcardsByChapter(chapterId);
});

ipcMain.handle('db:createFlashcard', async (_, data: any) => {
  return dbService.createFlashcard(data);
});

ipcMain.handle('db:deleteFlashcard', async (_, id: number) => {
  return dbService.deleteFlashcard(id);
});

ipcMain.handle('db:updateFlashcard', async (_, id: number, data: any) => {
  return dbService.updateFlashcard(id, data);
});

ipcMain.handle('db:getFlashcardsDueForReview', async () => {
  return dbService.getFlashcardsDueForReview();
});

ipcMain.handle('db:recordReview', async (_, flashcardId: number, rating: string, success: boolean) => {
  return dbService.recordReview(flashcardId, rating, success);
});

ipcMain.handle('db:getQuizzesByChapter', async (_, chapterId: number) => {
  return dbService.getQuizzesByChapter(chapterId);
});

ipcMain.handle('db:createQuiz', async (_, data: any) => {
  return dbService.createQuiz(data);
});

ipcMain.handle('db:deleteQuiz', async (_, id: number) => {
  return dbService.deleteQuiz(id);
});

ipcMain.handle('db:getStatistics', async () => {
  return dbService.getStatistics();
});

// Events
ipcMain.handle('db:getEvents', async () => {
  return dbService.getEvents();
});

ipcMain.handle('db:getUpcomingEvents', async (_, daysAhead: number) => {
  return dbService.getUpcomingEvents(daysAhead);
});

ipcMain.handle('db:getEventsBySubject', async (_, subjectId: number) => {
  return dbService.getEventsBySubject(subjectId);
});

ipcMain.handle('db:createEvent', async (_, subjectId: number, title: string, eventType: string, eventDate: string, description?: string) => {
  return dbService.createEvent(subjectId, title, eventType, eventDate, description);
});

ipcMain.handle('db:updateEvent', async (_, id: number, title: string, eventType: string, eventDate: string, description?: string) => {
  return dbService.updateEvent(id, title, eventType, eventDate, description);
});

ipcMain.handle('db:deleteEvent', async (_, id: number) => {
  return dbService.deleteEvent(id);
});

// Formulas
ipcMain.handle('db:getFormulas', async () => {
  return dbService.getFormulas();
});

ipcMain.handle('db:getFormulasBySubject', async (_, subjectId: number) => {
  return dbService.getFormulasBySubject(subjectId);
});

ipcMain.handle('db:getFormulasByTheme', async (_, theme: string) => {
  return dbService.getFormulasByTheme(theme);
});

ipcMain.handle('db:searchFormulas', async (_, query: string) => {
  return dbService.searchFormulas(query);
});

ipcMain.handle('db:createFormula', async (_, subjectId: number, theme: string, title: string, formula: string, description?: string, variables?: string, chapterId?: number) => {
  return dbService.createFormula(subjectId, theme, title, formula, description, variables, chapterId);
});

ipcMain.handle('db:updateFormula', async (_, id: number, theme: string, title: string, formula: string, description?: string, variables?: string) => {
  return dbService.updateFormula(id, theme, title, formula, description, variables);
});

ipcMain.handle('db:deleteFormula', async (_, id: number) => {
  return dbService.deleteFormula(id);
});

ipcMain.handle('db:getThemesBySubject', async (_, subjectId: number) => {
  return dbService.getThemesBySubject(subjectId);
});

// File operations
ipcMain.handle('file:selectFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['pdf', 'md', 'txt'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Text', extensions: ['txt'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = await fileService.extractContent(filePath);
    return {
      path: filePath,
      name: path.basename(filePath),
      content,
      type: path.extname(filePath).slice(1),
    };
  }

  return null;
});

// Exercises
ipcMain.handle('db:getExercisesByChapter', async (_, chapterId: number) => {
  return dbService.getExercisesByChapter(chapterId);
});

ipcMain.handle('db:getAllExercises', async () => {
  return dbService.getAllExercises();
});

ipcMain.handle('db:getExercisesByStatus', async (_, status: string) => {
  return dbService.getExercisesByStatus(status);
});

ipcMain.handle('db:createExercise', async (_, chapterId: number, title: string, statement: string, solution: string, difficulty: string) => {
  return dbService.createExercise(chapterId, title, statement, solution, difficulty);
});

ipcMain.handle('db:updateExerciseStatus', async (_, id: number, status: string) => {
  return dbService.updateExerciseStatus(id, status);
});

ipcMain.handle('db:deleteExercise', async (_, id: number) => {
  return dbService.deleteExercise(id);
});

// AI operations
ipcMain.handle('ai:generateFlashcards', async (_, content: string, count: number, chapterTitle: string) => {
  return aiService.generateFlashcards(content, count, chapterTitle);
});

ipcMain.handle('ai:generateQuizzes', async (_, content: string, count: number, chapterTitle: string) => {
  return aiService.generateQuizzes(content, count, chapterTitle);
});

ipcMain.handle('ai:generateFormulas', async (_, content: string, chapterTitle: string) => {
  return aiService.generateFormulas(content, chapterTitle);
});

ipcMain.handle('ai:generateExercises', async (_, content: string, count: number, chapterTitle: string) => {
  return aiService.generateExercises(content, count, chapterTitle);
});

// Settings
ipcMain.handle('settings:getApiKey', async () => {
  const configPath = path.join(app.getPath('userData'), 'config', 'api-key.txt');
  try {
    return await fs.readFile(configPath, 'utf-8');
  } catch {
    return null;
  }
});

ipcMain.handle('settings:setApiKey', async (_, apiKey: string) => {
  const configPath = path.join(app.getPath('userData'), 'config', 'api-key.txt');
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, apiKey, 'utf-8');
  aiService.setApiKey(apiKey);
  return true;
});

// Theme
ipcMain.handle('theme:get', async () => {
  const configPath = path.join(app.getPath('userData'), 'config', 'theme.txt');
  try {
    return await fs.readFile(configPath, 'utf-8');
  } catch {
    return 'light';
  }
});

ipcMain.handle('theme:set', async (_, theme: string) => {
  const configPath = path.join(app.getPath('userData'), 'config', 'theme.txt');
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, theme, 'utf-8');
  return true;
});
