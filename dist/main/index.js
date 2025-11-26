import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs/promises";
import { createRequire } from "module";
import Anthropic from "@anthropic-ai/sdk";
import { fork } from "child_process";
import { fileURLToPath } from "url";
import __cjs_url__ from "node:url";
import __cjs_path__ from "node:path";
import __cjs_mod__ from "node:module";
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require2 = __cjs_mod__.createRequire(import.meta.url);
const require$1 = createRequire(import.meta.url);
const Database = require$1("better-sqlite3");
class DatabaseService {
  db;
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
  }
  initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        file_path TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
        next_review_date TEXT NOT NULL,
        review_count INTEGER DEFAULT 0,
        easiness_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 1,
        repetitions INTEGER DEFAULT 0,
        chart_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option TEXT NOT NULL CHECK(correct_option IN ('a', 'b', 'c', 'd')),
        explanation TEXT NOT NULL,
        chart_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS review_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flashcard_id INTEGER NOT NULL,
        reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        difficulty_rating TEXT NOT NULL CHECK(difficulty_rating IN ('easy', 'medium', 'hard')),
        success INTEGER NOT NULL CHECK(success IN (0, 1)),
        FOREIGN KEY (flashcard_id) REFERENCES flashcards (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
      CREATE INDEX IF NOT EXISTS idx_flashcards_chapter ON flashcards(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_date);
      CREATE INDEX IF NOT EXISTS idx_quizzes_chapter ON quizzes(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_review_history_flashcard ON review_history(flashcard_id);
    `);
    this.runMigrations();
  }
  runMigrations() {
    const flashcardsColumns = this.db.prepare("PRAGMA table_info(flashcards)").all();
    const hasChartDataInFlashcards = flashcardsColumns.some((col) => col.name === "chart_data");
    if (!hasChartDataInFlashcards) {
      this.db.exec("ALTER TABLE flashcards ADD COLUMN chart_data TEXT");
      console.log("✅ Migration: Added chart_data column to flashcards");
    }
    const quizzesColumns = this.db.prepare("PRAGMA table_info(quizzes)").all();
    const hasChartDataInQuizzes = quizzesColumns.some((col) => col.name === "chart_data");
    if (!hasChartDataInQuizzes) {
      this.db.exec("ALTER TABLE quizzes ADD COLUMN chart_data TEXT");
      console.log("✅ Migration: Added chart_data column to quizzes");
    }
  }
  // Subjects
  getSubjects() {
    return this.db.prepare("SELECT * FROM subjects ORDER BY name").all();
  }
  createSubject(name, color) {
    const result = this.db.prepare("INSERT INTO subjects (name, color) VALUES (?, ?)").run(name, color);
    return this.db.prepare("SELECT * FROM subjects WHERE id = ?").get(result.lastInsertRowid);
  }
  deleteSubject(id) {
    this.db.prepare("DELETE FROM subjects WHERE id = ?").run(id);
  }
  // Chapters
  getChaptersBySubject(subjectId) {
    return this.db.prepare("SELECT * FROM chapters WHERE subject_id = ? ORDER BY created_at DESC").all(subjectId);
  }
  getChapter(id) {
    return this.db.prepare("SELECT * FROM chapters WHERE id = ?").get(id);
  }
  createChapter(subjectId, name, content, filePath) {
    const result = this.db.prepare("INSERT INTO chapters (subject_id, name, content, file_path) VALUES (?, ?, ?, ?)").run(subjectId, name, content, filePath);
    return this.db.prepare("SELECT * FROM chapters WHERE id = ?").get(result.lastInsertRowid);
  }
  deleteChapter(id) {
    this.db.prepare("DELETE FROM chapters WHERE id = ?").run(id);
  }
  // Flashcards
  getFlashcardsByChapter(chapterId) {
    return this.db.prepare("SELECT * FROM flashcards WHERE chapter_id = ? ORDER BY created_at DESC").all(chapterId);
  }
  createFlashcard(data) {
    const nextReviewDate = (/* @__PURE__ */ new Date()).toISOString();
    const result = this.db.prepare(
      "INSERT INTO flashcards (chapter_id, question, answer, difficulty, next_review_date) VALUES (?, ?, ?, ?, ?)"
    ).run(data.chapter_id, data.question, data.answer, data.difficulty, nextReviewDate);
    return this.db.prepare("SELECT * FROM flashcards WHERE id = ?").get(result.lastInsertRowid);
  }
  updateFlashcard(id, data) {
    const updates = [];
    const values = [];
    if (data.next_review_date) {
      updates.push("next_review_date = ?");
      values.push(data.next_review_date);
    }
    if (data.review_count !== void 0) {
      updates.push("review_count = ?");
      values.push(data.review_count);
    }
    if (data.easiness_factor) {
      updates.push("easiness_factor = ?");
      values.push(data.easiness_factor);
    }
    if (data.interval) {
      updates.push("interval = ?");
      values.push(data.interval);
    }
    if (data.repetitions !== void 0) {
      updates.push("repetitions = ?");
      values.push(data.repetitions);
    }
    if (updates.length > 0) {
      values.push(id);
      this.db.prepare(`UPDATE flashcards SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }
  }
  getFlashcardsDueForReview() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return this.db.prepare(
      `
      SELECT f.*, c.name as chapter_name, s.name as subject_name
      FROM flashcards f
      JOIN chapters c ON f.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE f.next_review_date <= ?
      ORDER BY f.next_review_date ASC
    `
    ).all(now);
  }
  // Quizzes
  getQuizzesByChapter(chapterId) {
    return this.db.prepare("SELECT * FROM quizzes WHERE chapter_id = ? ORDER BY created_at DESC").all(chapterId);
  }
  createQuiz(data) {
    const result = this.db.prepare(
      `INSERT INTO quizzes (chapter_id, question, option_a, option_b, option_c, option_d, correct_option, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.chapter_id,
      data.question,
      data.option_a,
      data.option_b,
      data.option_c,
      data.option_d,
      data.correct_option,
      data.explanation
    );
    return this.db.prepare("SELECT * FROM quizzes WHERE id = ?").get(result.lastInsertRowid);
  }
  // Review History
  recordReview(flashcardId, rating, success) {
    const flashcard = this.db.prepare("SELECT * FROM flashcards WHERE id = ?").get(flashcardId);
    if (!flashcard) {
      throw new Error("Flashcard not found");
    }
    const quality = rating === "hard" ? 0 : rating === "medium" ? 1 : 2;
    let easinessFactor = flashcard.easiness_factor || 2.5;
    let interval = flashcard.interval || 1;
    let repetitions = flashcard.repetitions || 0;
    if (quality === 0) {
      easinessFactor = Math.max(1.3, easinessFactor - 0.2);
      repetitions = 0;
      interval = 1;
    } else if (quality === 1) {
      easinessFactor = Math.max(1.3, easinessFactor - 0.05);
      repetitions = repetitions + 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 3;
      } else {
        interval = Math.round(interval * easinessFactor);
      }
    } else {
      easinessFactor = Math.min(2.5, easinessFactor + 0.1);
      repetitions = repetitions + 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easinessFactor);
      }
    }
    const nextReviewDate = /* @__PURE__ */ new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    this.updateFlashcard(flashcardId, {
      next_review_date: nextReviewDate.toISOString(),
      review_count: flashcard.review_count + 1,
      easiness_factor: easinessFactor,
      interval,
      repetitions
    });
    const result = this.db.prepare("INSERT INTO review_history (flashcard_id, difficulty_rating, success) VALUES (?, ?, ?)").run(flashcardId, rating, success ? 1 : 0);
    return this.db.prepare("SELECT * FROM review_history WHERE id = ?").get(result.lastInsertRowid);
  }
  getReviewHistory(flashcardId) {
    return this.db.prepare("SELECT * FROM review_history WHERE flashcard_id = ? ORDER BY reviewed_at DESC").all(flashcardId);
  }
  // Statistics
  getStatistics() {
    const totalFlashcards = this.db.prepare("SELECT COUNT(*) as count FROM flashcards").get();
    const totalReviews = this.db.prepare("SELECT COUNT(*) as count FROM review_history").get();
    const successRate = this.db.prepare("SELECT AVG(success) * 100 as rate FROM review_history").get();
    const reviewsBySubject = this.db.prepare(
      `
      SELECT
        s.id as subject_id,
        s.name as subject_name,
        COUNT(rh.id) as count,
        AVG(rh.success) * 100 as success_rate
      FROM subjects s
      JOIN chapters c ON s.id = c.subject_id
      JOIN flashcards f ON c.id = f.chapter_id
      LEFT JOIN review_history rh ON f.id = rh.flashcard_id
      GROUP BY s.id, s.name
      ORDER BY count DESC
    `
    ).all();
    const reviewsByDay = this.db.prepare(
      `
      SELECT
        DATE(reviewed_at) as date,
        COUNT(*) as count
      FROM review_history
      WHERE reviewed_at >= date('now', '-30 days')
      GROUP BY DATE(reviewed_at)
      ORDER BY date DESC
    `
    ).all();
    return {
      totalFlashcards: totalFlashcards.count,
      totalReviews: totalReviews.count,
      successRate: successRate.rate || 0,
      reviewsBySubject,
      reviewsByDay
    };
  }
  deleteFlashcard(id) {
    this.db.prepare("DELETE FROM flashcards WHERE id = ?").run(id);
  }
  deleteQuiz(id) {
    this.db.prepare("DELETE FROM quizzes WHERE id = ?").run(id);
  }
  updateChapter(id, name, content) {
    this.db.prepare("UPDATE chapters SET name = ?, content = ? WHERE id = ?").run(name, content, id);
  }
  close() {
    this.db.close();
  }
}
class AIService {
  client = null;
  apiKey = null;
  constructor(apiKey) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.client = new Anthropic({
      apiKey
    });
  }
  ensureClient() {
    if (!this.client || !this.apiKey) {
      throw new Error("Clé API non configurée. Veuillez la configurer dans les paramètres.");
    }
  }
  /**
   * Exécute une opération avec réessai automatique en cas de surcharge (erreur 529)
   */
  async callWithRetry(operation, retries = 3, delay = 2e3) {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && (error.status === 529 || error.status >= 500 && error.status < 600)) {
        console.log(`⚠️ API Surchargée (${error.status}), nouvelle tentative dans ${delay / 1e3}s... (${retries} essais restants)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.callWithRetry(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }
  /**
   * Nettoie une chaîne JSON brute pour corriger les erreurs courantes de l'IA
   */
  cleanJsonString(jsonStr) {
    let clean = jsonStr.replace(/```json\n?|\n?```/g, "").trim();
    return clean;
  }
  parseResponse(responseText) {
    const start = responseText.indexOf("[");
    const end = responseText.lastIndexOf("]");
    if (start === -1 || end === -1) {
      throw new Error("Format de réponse IA invalide : tableau JSON introuvable");
    }
    const jsonStr = responseText.substring(start, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      try {
        const sanitized = jsonStr.replace(/\t/g, "\\t");
        return JSON.parse(sanitized);
      } catch (retryError) {
        console.error("JSON Parse Error:", e);
        console.error("Faulty JSON string:", jsonStr);
        throw new Error(`Erreur de parsing JSON : ${e.message}`);
      }
    }
  }
  async generateFlashcards(content, count, chapterTitle) {
    this.ensureClient();
    const prompt = `À partir du cours suivant sur "${chapterTitle}", génère ${count} flashcards au format JSON.

Cours :
${content}

Consignes :
- Questions claires et précises niveau PSI.
- IMPORTANT : Réponds avec un **JSON valide strict**.
- N'utilise PAS de sauts de ligne réels (touches Entrée) à l'intérieur des chaînes de caractères (questions/réponses). Utilise "\\n" pour les retours à la ligne.
- N'ajoute aucun texte avant ou après le JSON.
- Tu peux utiliser LaTeX pour les formules mathématiques (syntaxe : $formule$ pour inline, $$formule$$ pour display).
- Si pertinent (graphiques, courbes, données numériques), tu peux ajouter un champ "chart_data" avec un objet JSON contenant les données d'un graphique.

Format JSON attendu :
[
  {
    "question": "Question...",
    "answer": "Réponse...",
    "difficulty": "easy|medium|hard",
    "chart_data": {
      "type": "line|bar|area|scatter|pie",
      "title": "Titre du graphique (optionnel)",
      "data": [{"x": 0, "y": 10}, {"x": 1, "y": 20}],
      "xKey": "x",
      "yKeys": ["y"],
      "colors": ["#3B82F6"]
    }
  }
]

Note : Le champ "chart_data" est optionnel. Ne l'ajoute que si cela apporte une vraie valeur pédagogique (ex: courbes de fonctions, diagrammes, évolution temporelle, etc.).`;
    try {
      const message = await this.callWithRetry(() => this.client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }]
      }));
      const responseText = message.content[0].type === "text" ? message.content[0].text : "";
      const flashcards = this.parseResponse(responseText);
      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error("Aucune flashcard générée");
      }
      return flashcards;
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw new Error(`Échec de génération : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }
  async generateQuizzes(content, count, chapterTitle) {
    this.ensureClient();
    const prompt = `À partir du cours suivant sur "${chapterTitle}", génère ${count} questions de QCM au format JSON.

Cours :
${content}

Consignes :
- 4 options dont 1 seule correcte.
- IMPORTANT : Réponds avec un **JSON valide strict**.
- N'utilise PAS de sauts de ligne réels à l'intérieur des textes. Utilise "\\n" pour les retours à la ligne.
- "correct" est l'index (0-3) de la bonne réponse.
- Tu peux utiliser LaTeX pour les formules mathématiques (syntaxe : $formule$ pour inline, $$formule$$ pour display).
- Si pertinent (graphiques, courbes, données numériques), tu peux ajouter un champ "chart_data" avec un objet JSON contenant les données d'un graphique.

Format JSON attendu :
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "...",
    "chart_data": {
      "type": "line|bar|area|scatter|pie",
      "title": "Titre du graphique (optionnel)",
      "data": [{"x": 0, "y": 10}, {"x": 1, "y": 20}],
      "xKey": "x",
      "yKeys": ["y"],
      "colors": ["#3B82F6"]
    }
  }
]

Note : Le champ "chart_data" est optionnel. Ne l'ajoute que si cela apporte une vraie valeur pédagogique (ex: courbes de fonctions, diagrammes, analyse de données, etc.).`;
    try {
      const message = await this.callWithRetry(() => this.client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }]
      }));
      const responseText = message.content[0].type === "text" ? message.content[0].text : "";
      const quizzes = this.parseResponse(responseText);
      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        throw new Error("Aucun quiz généré");
      }
      for (const quiz of quizzes) {
        if (!quiz.question || !Array.isArray(quiz.options) || quiz.options.length !== 4) {
          throw new Error("Format de quiz invalide (manque options ou question)");
        }
      }
      return quizzes;
    } catch (error) {
      console.error("Error generating quizzes:", error);
      throw new Error(`Échec de génération : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
class FileService {
  async extractContent(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".pdf":
        return this.extractPdfContent(filePath);
      case ".md":
      case ".txt":
        return this.extractTextContent(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }
  async extractPdfContent(filePath) {
    return new Promise((resolve, reject) => {
      let workerPath = path.join(__dirname$1, "pdf-worker.cjs");
      if (workerPath.includes("app.asar")) {
        workerPath = workerPath.replace("app.asar", "app.asar.unpacked");
      }
      console.log("Launching PDF worker at:", workerPath);
      const worker = fork(workerPath, [], {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
        env: {
          ...process.env,
          // CRUCIAL : Force le processus à agir comme un Node.js standard
          // Cela évite les conflits avec DOMMatrix et les APIs Electron
          ELECTRON_RUN_AS_NODE: "1"
        }
      });
      let timeoutId;
      let stderrData = "";
      let resolved = false;
      if (worker.stderr) {
        worker.stderr.on("data", (data) => {
          const msg = data.toString();
          stderrData += msg;
          console.error("PDF Worker stderr:", msg);
        });
      }
      worker.on("message", (message) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        if (message.success) {
          resolve(message.text);
        } else {
          reject(new Error(message.error || "Unknown worker error"));
        }
        worker.kill();
      });
      worker.on("error", (error) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        console.error("PDF Worker execution error:", error);
        reject(new Error(`PDF worker failed to start: ${error.message}`));
      });
      worker.on("exit", (code) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        if (code !== 0) {
          console.error(`PDF Worker exited with code ${code}. Stderr: ${stderrData}`);
          reject(new Error(`PDF worker exited with code ${code}: ${stderrData}`));
        }
      });
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          worker.kill();
          reject(new Error("Délai d'attente dépassé pour l'extraction PDF (30s)"));
        }
      }, 3e4);
      worker.send({ filePath });
    });
  }
  async extractTextContent(filePath) {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      console.error("Error reading text file:", error);
      throw new Error("Failed to read file");
    }
  }
}
let mainWindow = null;
let dbService;
let aiService;
let fileService;
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: "default",
    show: false
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
app.whenReady().then(async () => {
  const dbPath = path.join(app.getPath("userData"), "database", "psi-revision.db");
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  dbService = new DatabaseService(dbPath);
  dbService.initialize();
  aiService = new AIService();
  try {
    const configPath = path.join(app.getPath("userData"), "config", "api-key.txt");
    const storedKey = await fs.readFile(configPath, "utf-8");
    if (storedKey && storedKey.trim()) {
      aiService.setApiKey(storedKey.trim());
      console.log("✅ Clé API chargée au démarrage");
    } else {
      console.log("⚠️ Aucune clé API trouvée au démarrage");
    }
  } catch (error) {
    console.log("ℹ️ Première utilisation : pas de fichier de configuration API");
  }
  fileService = new FileService();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
ipcMain.handle("db:getSubjects", async () => {
  return dbService.getSubjects();
});
ipcMain.handle("db:createSubject", async (_, name, color) => {
  return dbService.createSubject(name, color);
});
ipcMain.handle("db:deleteSubject", async (_, id) => {
  return dbService.deleteSubject(id);
});
ipcMain.handle("db:getChaptersBySubject", async (_, subjectId) => {
  return dbService.getChaptersBySubject(subjectId);
});
ipcMain.handle("db:createChapter", async (_, subjectId, name, content, filePath) => {
  return dbService.createChapter(subjectId, name, content, filePath);
});
ipcMain.handle("db:deleteChapter", async (_, id) => {
  return dbService.deleteChapter(id);
});
ipcMain.handle("db:updateChapter", async (_, id, name, content) => {
  return dbService.updateChapter(id, name, content);
});
ipcMain.handle("db:getFlashcardsByChapter", async (_, chapterId) => {
  return dbService.getFlashcardsByChapter(chapterId);
});
ipcMain.handle("db:createFlashcard", async (_, data) => {
  return dbService.createFlashcard(data);
});
ipcMain.handle("db:deleteFlashcard", async (_, id) => {
  return dbService.deleteFlashcard(id);
});
ipcMain.handle("db:updateFlashcard", async (_, id, data) => {
  return dbService.updateFlashcard(id, data);
});
ipcMain.handle("db:getFlashcardsDueForReview", async () => {
  return dbService.getFlashcardsDueForReview();
});
ipcMain.handle("db:recordReview", async (_, flashcardId, rating, success) => {
  return dbService.recordReview(flashcardId, rating, success);
});
ipcMain.handle("db:getQuizzesByChapter", async (_, chapterId) => {
  return dbService.getQuizzesByChapter(chapterId);
});
ipcMain.handle("db:createQuiz", async (_, data) => {
  return dbService.createQuiz(data);
});
ipcMain.handle("db:deleteQuiz", async (_, id) => {
  return dbService.deleteQuiz(id);
});
ipcMain.handle("db:getStatistics", async () => {
  return dbService.getStatistics();
});
ipcMain.handle("file:selectFile", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Documents", extensions: ["pdf", "md", "txt"] },
      { name: "PDF", extensions: ["pdf"] },
      { name: "Markdown", extensions: ["md"] },
      { name: "Text", extensions: ["txt"] }
    ]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = await fileService.extractContent(filePath);
    return {
      path: filePath,
      name: path.basename(filePath),
      content,
      type: path.extname(filePath).slice(1)
    };
  }
  return null;
});
ipcMain.handle("ai:generateFlashcards", async (_, content, count, chapterTitle) => {
  return aiService.generateFlashcards(content, count, chapterTitle);
});
ipcMain.handle("ai:generateQuizzes", async (_, content, count, chapterTitle) => {
  return aiService.generateQuizzes(content, count, chapterTitle);
});
ipcMain.handle("settings:getApiKey", async () => {
  const configPath = path.join(app.getPath("userData"), "config", "api-key.txt");
  try {
    return await fs.readFile(configPath, "utf-8");
  } catch {
    return null;
  }
});
ipcMain.handle("settings:setApiKey", async (_, apiKey) => {
  const configPath = path.join(app.getPath("userData"), "config", "api-key.txt");
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, apiKey, "utf-8");
  aiService.setApiKey(apiKey);
  return true;
});
ipcMain.handle("theme:get", async () => {
  const configPath = path.join(app.getPath("userData"), "config", "theme.txt");
  try {
    return await fs.readFile(configPath, "utf-8");
  } catch {
    return "light";
  }
});
ipcMain.handle("theme:set", async (_, theme) => {
  const configPath = path.join(app.getPath("userData"), "config", "theme.txt");
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, theme, "utf-8");
  return true;
});
