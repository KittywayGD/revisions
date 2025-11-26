import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
import type { Subject, Chapter, Flashcard, Quiz, ReviewHistory, Statistics, Event, EventWithSubject } from '../shared/types.js';

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  initialize() {
    // Create tables
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

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        event_type TEXT NOT NULL CHECK(event_type IN ('test', 'kholle', 'exam', 'other')),
        event_date TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
      CREATE INDEX IF NOT EXISTS idx_flashcards_chapter ON flashcards(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_date);
      CREATE INDEX IF NOT EXISTS idx_quizzes_chapter ON quizzes(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_review_history_flashcard ON review_history(flashcard_id);
      CREATE INDEX IF NOT EXISTS idx_events_subject ON events(subject_id);
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
    `);
    
    // Run migrations for existing databases
    this.runMigrations();
  }

  private runMigrations() {
    // Migration: Add chart_data column to flashcards if it doesn't exist
    const flashcardsColumns = this.db.prepare("PRAGMA table_info(flashcards)").all() as any[];
    const hasChartDataInFlashcards = flashcardsColumns.some(col => col.name === 'chart_data');
    if (!hasChartDataInFlashcards) {
      this.db.exec('ALTER TABLE flashcards ADD COLUMN chart_data TEXT');
      console.log('✅ Migration: Added chart_data column to flashcards');
    }

    // Migration: Add chart_data column to quizzes if it doesn't exist
    const quizzesColumns = this.db.prepare("PRAGMA table_info(quizzes)").all() as any[];
    const hasChartDataInQuizzes = quizzesColumns.some(col => col.name === 'chart_data');
    if (!hasChartDataInQuizzes) {
      this.db.exec('ALTER TABLE quizzes ADD COLUMN chart_data TEXT');
      console.log('✅ Migration: Added chart_data column to quizzes');
    }
  }

  // Subjects
  getSubjects(): Subject[] {
    return this.db.prepare('SELECT * FROM subjects ORDER BY name').all() as Subject[];
  }

  createSubject(name: string, color: string): Subject {
    const result = this.db.prepare('INSERT INTO subjects (name, color) VALUES (?, ?)').run(name, color);
    return this.db.prepare('SELECT * FROM subjects WHERE id = ?').get(result.lastInsertRowid) as Subject;
  }

  deleteSubject(id: number): void {
    this.db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
  }

  // Chapters
  getChaptersBySubject(subjectId: number): Chapter[] {
    return this.db
      .prepare('SELECT * FROM chapters WHERE subject_id = ? ORDER BY created_at DESC')
      .all(subjectId) as Chapter[];
  }

  getChapter(id: number): Chapter | undefined {
    return this.db.prepare('SELECT * FROM chapters WHERE id = ?').get(id) as Chapter | undefined;
  }

  createChapter(subjectId: number, name: string, content: string, filePath: string | null): Chapter {
    const result = this.db
      .prepare('INSERT INTO chapters (subject_id, name, content, file_path) VALUES (?, ?, ?, ?)')
      .run(subjectId, name, content, filePath);
    return this.db.prepare('SELECT * FROM chapters WHERE id = ?').get(result.lastInsertRowid) as Chapter;
  }

  deleteChapter(id: number): void {
    this.db.prepare('DELETE FROM chapters WHERE id = ?').run(id);
  }

  // Flashcards
  getFlashcardsByChapter(chapterId: number): Flashcard[] {
    return this.db
      .prepare('SELECT * FROM flashcards WHERE chapter_id = ? ORDER BY created_at DESC')
      .all(chapterId) as Flashcard[];
  }

  createFlashcard(data: {
    chapter_id: number;
    question: string;
    answer: string;
    difficulty: string;
  }): Flashcard {
    const nextReviewDate = new Date().toISOString();
    const result = this.db
      .prepare(
        'INSERT INTO flashcards (chapter_id, question, answer, difficulty, next_review_date) VALUES (?, ?, ?, ?, ?)'
      )
      .run(data.chapter_id, data.question, data.answer, data.difficulty, nextReviewDate);
    return this.db.prepare('SELECT * FROM flashcards WHERE id = ?').get(result.lastInsertRowid) as Flashcard;
  }

  updateFlashcard(
    id: number,
    data: {
      next_review_date?: string;
      review_count?: number;
      easiness_factor?: number;
      interval?: number;
      repetitions?: number;
    }
  ): void {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.next_review_date) {
      updates.push('next_review_date = ?');
      values.push(data.next_review_date);
    }
    if (data.review_count !== undefined) {
      updates.push('review_count = ?');
      values.push(data.review_count);
    }
    if (data.easiness_factor) {
      updates.push('easiness_factor = ?');
      values.push(data.easiness_factor);
    }
    if (data.interval) {
      updates.push('interval = ?');
      values.push(data.interval);
    }
    if (data.repetitions !== undefined) {
      updates.push('repetitions = ?');
      values.push(data.repetitions);
    }

    if (updates.length > 0) {
      values.push(id);
      this.db.prepare(`UPDATE flashcards SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
  }

  getFlashcardsDueForReview(): any[] {
    const now = new Date();
    const nowISO = now.toISOString();

    // Récupérer les événements à venir dans les 14 prochains jours
    const upcomingEvents = this.getUpcomingEvents(14);

    // Créer un map de subject_id -> jours avant événement
    const eventPriorityMap = new Map<number, number>();
    upcomingEvents.forEach((event) => {
      const eventDate = new Date(event.event_date);
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Garder seulement l'événement le plus proche pour chaque matière
      if (!eventPriorityMap.has(event.subject_id) || daysUntil < eventPriorityMap.get(event.subject_id)!) {
        eventPriorityMap.set(event.subject_id, daysUntil);
      }
    });

    // Si pas d'événements proches, utiliser l'ancien algorithme
    if (eventPriorityMap.size === 0) {
      return this.db
        .prepare(
          `
        SELECT f.*, c.name as chapter_name, s.name as subject_name, s.id as subject_id
        FROM flashcards f
        JOIN chapters c ON f.chapter_id = c.id
        JOIN subjects s ON c.subject_id = s.id
        WHERE f.next_review_date <= ?
        ORDER BY f.next_review_date ASC
      `
        )
        .all(nowISO);
    }

    // Récupérer les flashcards dues normalement
    const dueCards = this.db
      .prepare(
        `
      SELECT f.*, c.name as chapter_name, s.name as subject_name, s.id as subject_id
      FROM flashcards f
      JOIN chapters c ON f.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE f.next_review_date <= ?
    `
      )
      .all(nowISO);

    // Pour les matières avec événements proches, ajouter des flashcards supplémentaires
    const prioritySubjectIds = Array.from(eventPriorityMap.keys());
    const extraCards = this.db
      .prepare(
        `
      SELECT f.*, c.name as chapter_name, s.name as subject_name, s.id as subject_id
      FROM flashcards f
      JOIN chapters c ON f.chapter_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      WHERE s.id IN (${prioritySubjectIds.map(() => '?').join(',')})
        AND f.next_review_date > ?
        AND f.next_review_date <= date('now', '+7 days')
      ORDER BY f.review_count ASC, f.next_review_date ASC
      LIMIT 10
    `
      )
      .all(...prioritySubjectIds, nowISO);

    // Combiner et dédupliquer
    const allCards = [...dueCards, ...extraCards];
    const uniqueCards = Array.from(
      new Map(allCards.map((card) => [card.id, card])).values()
    );

    // Calculer le score de priorité et trier
    const cardsWithPriority = uniqueCards.map((card) => {
      let priorityBoost = 1;
      const daysUntil = eventPriorityMap.get(card.subject_id);

      if (daysUntil !== undefined) {
        if (daysUntil <= 3) {
          priorityBoost = 3; // Événement très proche
        } else if (daysUntil <= 7) {
          priorityBoost = 2; // Événement proche
        } else if (daysUntil <= 14) {
          priorityBoost = 1.5; // Événement moyennement proche
        }
      }

      return {
        ...card,
        priorityBoost,
        daysUntilEvent: daysUntil,
      };
    });

    // Trier par priorité (boost élevé d'abord), puis par date de révision
    return cardsWithPriority.sort((a, b) => {
      if (b.priorityBoost !== a.priorityBoost) {
        return b.priorityBoost - a.priorityBoost;
      }
      return new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime();
    });
  }

  // Quizzes
  getQuizzesByChapter(chapterId: number): Quiz[] {
    return this.db
      .prepare('SELECT * FROM quizzes WHERE chapter_id = ? ORDER BY created_at DESC')
      .all(chapterId) as Quiz[];
  }

  createQuiz(data: {
    chapter_id: number;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    explanation: string;
  }): Quiz {
    const result = this.db
      .prepare(
        `INSERT INTO quizzes (chapter_id, question, option_a, option_b, option_c, option_d, correct_option, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.chapter_id,
        data.question,
        data.option_a,
        data.option_b,
        data.option_c,
        data.option_d,
        data.correct_option,
        data.explanation
      );
    return this.db.prepare('SELECT * FROM quizzes WHERE id = ?').get(result.lastInsertRowid) as Quiz;
  }

  // Review History
  recordReview(flashcardId: number, rating: string, success: boolean): ReviewHistory {
    // Get current flashcard data
    const flashcard = this.db.prepare('SELECT * FROM flashcards WHERE id = ?').get(flashcardId) as any;

    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    // Calculate next review using SM-2 algorithm
    const quality = rating === 'hard' ? 0 : rating === 'medium' ? 1 : 2;
    let easinessFactor = flashcard.easiness_factor || 2.5;
    let interval = flashcard.interval || 1;
    let repetitions = flashcard.repetitions || 0;

    if (quality === 0) {
      // Hard - reset
      easinessFactor = Math.max(1.3, easinessFactor - 0.2);
      repetitions = 0;
      interval = 1;
    } else if (quality === 1) {
      // Medium
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
      // Easy
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

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    // Update flashcard
    this.updateFlashcard(flashcardId, {
      next_review_date: nextReviewDate.toISOString(),
      review_count: flashcard.review_count + 1,
      easiness_factor: easinessFactor,
      interval: interval,
      repetitions: repetitions,
    });

    // Record review in history
    const result = this.db
      .prepare('INSERT INTO review_history (flashcard_id, difficulty_rating, success) VALUES (?, ?, ?)')
      .run(flashcardId, rating, success ? 1 : 0);

    return this.db.prepare('SELECT * FROM review_history WHERE id = ?').get(result.lastInsertRowid) as ReviewHistory;
  }

  getReviewHistory(flashcardId: number): ReviewHistory[] {
    return this.db
      .prepare('SELECT * FROM review_history WHERE flashcard_id = ? ORDER BY reviewed_at DESC')
      .all(flashcardId) as ReviewHistory[];
  }

  // Statistics
  getStatistics(): Statistics {
    const totalFlashcards = this.db.prepare('SELECT COUNT(*) as count FROM flashcards').get() as { count: number };

    const totalReviews = this.db.prepare('SELECT COUNT(*) as count FROM review_history').get() as { count: number };

    const successRate = this.db
      .prepare('SELECT AVG(success) * 100 as rate FROM review_history')
      .get() as { rate: number };

    const reviewsBySubject = this.db
      .prepare(
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
      )
      .all();

    const reviewsByDay = this.db
      .prepare(
        `
      SELECT
        DATE(reviewed_at) as date,
        COUNT(*) as count
      FROM review_history
      WHERE reviewed_at >= date('now', '-30 days')
      GROUP BY DATE(reviewed_at)
      ORDER BY date DESC
    `
      )
      .all();

    return {
      totalFlashcards: totalFlashcards.count,
      totalReviews: totalReviews.count,
      successRate: successRate.rate || 0,
      reviewsBySubject: reviewsBySubject as any[],
      reviewsByDay: reviewsByDay as any[],
    };
  }

  deleteFlashcard(id: number): void {
    this.db.prepare('DELETE FROM flashcards WHERE id = ?').run(id);
  }

  deleteQuiz(id: number): void {
    this.db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);
  }

  updateChapter(id: number, name: string, content: string): void {
    this.db.prepare('UPDATE chapters SET name = ?, content = ? WHERE id = ?').run(name, content, id);
  }

  // Events
  getEvents(): EventWithSubject[] {
    return this.db
      .prepare(
        `
      SELECT
        e.*,
        s.name as subject_name,
        s.color as subject_color
      FROM events e
      JOIN subjects s ON e.subject_id = s.id
      ORDER BY e.event_date ASC
    `
      )
      .all() as EventWithSubject[];
  }

  getUpcomingEvents(daysAhead: number = 30): EventWithSubject[] {
    return this.db
      .prepare(
        `
      SELECT
        e.*,
        s.name as subject_name,
        s.color as subject_color
      FROM events e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.event_date >= date('now')
        AND e.event_date <= date('now', '+' || ? || ' days')
      ORDER BY e.event_date ASC
    `
      )
      .all(daysAhead) as EventWithSubject[];
  }

  getEventsBySubject(subjectId: number): EventWithSubject[] {
    return this.db
      .prepare(
        `
      SELECT
        e.*,
        s.name as subject_name,
        s.color as subject_color
      FROM events e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.subject_id = ?
      ORDER BY e.event_date ASC
    `
      )
      .all(subjectId) as EventWithSubject[];
  }

  createEvent(
    subjectId: number,
    title: string,
    eventType: string,
    eventDate: string,
    description?: string
  ): Event {
    const result = this.db
      .prepare(
        'INSERT INTO events (subject_id, title, event_type, event_date, description) VALUES (?, ?, ?, ?, ?)'
      )
      .run(subjectId, title, eventType, eventDate, description || null);
    return this.db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  }

  updateEvent(
    id: number,
    title: string,
    eventType: string,
    eventDate: string,
    description?: string
  ): void {
    this.db
      .prepare('UPDATE events SET title = ?, event_type = ?, event_date = ?, description = ? WHERE id = ?')
      .run(title, eventType, eventDate, description || null, id);
  }

  deleteEvent(id: number): void {
    this.db.prepare('DELETE FROM events WHERE id = ?').run(id);
  }

  close() {
    this.db.close();
  }
}
