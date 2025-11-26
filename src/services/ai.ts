import Anthropic from '@anthropic-ai/sdk';
import type { FlashcardGenerationResult, QuizGenerationResult } from '../shared/types.js';

export class AIService {
  private client: Anthropic | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  private ensureClient() {
    if (!this.client || !this.apiKey) {
      throw new Error('Clé API non configurée. Veuillez la configurer dans les paramètres.');
    }
  }

  /**
   * Exécute une opération avec réessai automatique en cas de surcharge (erreur 529)
   */
  private async callWithRetry<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retries > 0 && (error.status === 529 || (error.status >= 500 && error.status < 600))) {
        console.log(`⚠️ API Surchargée (${error.status}), nouvelle tentative dans ${delay/1000}s... (${retries} essais restants)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callWithRetry(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  /**
   * Nettoie une chaîne JSON brute pour corriger les erreurs courantes de l'IA
   */
  private cleanJsonString(jsonStr: string): string {
    // 1. Enlever les blocs de code Markdown si présents
    let clean = jsonStr.replace(/```json\n?|\n?```/g, '').trim();
    
    // 2. Si le parse échoue souvent à cause des "Bad control character",
    // c'est souvent des newlines dans les strings.
    // Une solution radicale mais efficace pour les réponses d'IA : 
    // remplacer les newlines réels par des espaces s'ils ne semblent pas structurels,
    // ou mieux : utiliser une regex pour échapper les contrôles dans les valeurs.
    // Pour l'instant, on fait confiance au prompt amélioré, mais on garde cette fonction
    // pour des nettoyages basiques futurs.
    return clean;
  }

  private parseResponse<T>(responseText: string): T {
    // Extraction plus robuste du tableau JSON
    const start = responseText.indexOf('[');
    const end = responseText.lastIndexOf(']');
    
    if (start === -1 || end === -1) {
      throw new Error('Format de réponse IA invalide : tableau JSON introuvable');
    }

    const jsonStr = responseText.substring(start, end + 1);
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      // Tentative de réparation : échapper les sauts de ligne non échappés dans les chaînes
      // C'est une heuristique : on remplace les \n qui ne sont pas suivis par une structure JSON ou précédés par , { [
      try {
        // Remplacement simple des tabulations qui posent souvent problème
        const sanitized = jsonStr.replace(/\t/g, '\\t');
        return JSON.parse(sanitized);
      } catch (retryError) {
        console.error('JSON Parse Error:', e);
        console.error('Faulty JSON string:', jsonStr);
        throw new Error(`Erreur de parsing JSON : ${(e as Error).message}`);
      }
    }
  }

  async generateFlashcards(
    content: string,
    count: number,
    chapterTitle: string
  ): Promise<FlashcardGenerationResult[]> {
    this.ensureClient();

    // Prompt renforcé pour éviter les erreurs de formatage
    const prompt = `À partir du cours suivant sur "${chapterTitle}", génère ${count} flashcards au format JSON.

Cours :
${content}

Consignes :
- Questions claires et précises niveau PSI.
- IMPORTANT : Réponds avec un **JSON valide strict**.
- N'utilise PAS de sauts de ligne réels (touches Entrée) à l'intérieur des chaînes de caractères (questions/réponses). Utilise "\\n" pour les retours à la ligne.
- N'ajoute aucun texte avant ou après le JSON.

Format JSON attendu :
[
  {
    "question": "Question...",
    "answer": "Réponse...",
    "difficulty": "easy|medium|hard"
  }
]`;

    try {
      const message = await this.callWithRetry(() => this.client!.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }));

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const flashcards = this.parseResponse<FlashcardGenerationResult[]>(responseText);

      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error('Aucune flashcard générée');
      }

      return flashcards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw new Error(`Échec de génération : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async generateQuizzes(content: string, count: number, chapterTitle: string): Promise<QuizGenerationResult[]> {
    this.ensureClient();

    const prompt = `À partir du cours suivant sur "${chapterTitle}", génère ${count} questions de QCM au format JSON.

Cours :
${content}

Consignes :
- 4 options dont 1 seule correcte.
- IMPORTANT : Réponds avec un **JSON valide strict**.
- N'utilise PAS de sauts de ligne réels à l'intérieur des textes. Utilise "\\n" pour les retours à la ligne.
- "correct" est l'index (0-3) de la bonne réponse.

Format JSON attendu :
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "..."
  }
]`;

    try {
      const message = await this.callWithRetry(() => this.client!.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }));

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const quizzes = this.parseResponse<QuizGenerationResult[]>(responseText);

      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        throw new Error('Aucun quiz généré');
      }

      // Validation basique
      for (const quiz of quizzes) {
        if (!quiz.question || !Array.isArray(quiz.options) || quiz.options.length !== 4) {
          throw new Error('Format de quiz invalide (manque options ou question)');
        }
      }

      return quizzes;
    } catch (error) {
      console.error('Error generating quizzes:', error);
      throw new Error(`Échec de génération : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}