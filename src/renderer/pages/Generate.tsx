import { useState, useEffect } from 'react';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { Subject, Chapter } from '../../shared/types';

export default function Generate() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [contentType, setContentType] = useState<'flashcards' | 'quizzes' | 'formulas'>('flashcards');
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadChapters(selectedSubject);
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    const data = await window.electronAPI.getSubjects();
    setSubjects(data);
    if (data.length > 0) {
      setSelectedSubject(data[0].id);
    }
  };

  const loadChapters = async (subjectId: number) => {
    const data = await window.electronAPI.getChaptersBySubject(subjectId);
    setChapters(data);
    if (data.length > 0) {
      setSelectedChapter(data[0].id);
    }
  };

  const handleGenerate = async () => {
    if (!selectedChapter || !selectedSubject) return;

    const chapter = chapters.find((c) => c.id === selectedChapter);
    if (!chapter) return;

    setGenerating(true);
    setGenerated(false);

    try {
      if (contentType === 'flashcards') {
        const results = await window.electronAPI.generateFlashcards(
          chapter.content,
          count,
          chapter.name
        );

        for (const result of results) {
          await window.electronAPI.createFlashcard({
            chapter_id: selectedChapter,
            question: result.question,
            answer: result.answer,
            difficulty: result.difficulty,
          });
        }
      } else if (contentType === 'quizzes') {
        const results = await window.electronAPI.generateQuizzes(
          chapter.content,
          count,
          chapter.name
        );

        for (const result of results) {
          await window.electronAPI.createQuiz({
            chapter_id: selectedChapter,
            question: result.question,
            option_a: result.options[0],
            option_b: result.options[1],
            option_c: result.options[2],
            option_d: result.options[3],
            correct_option: ['a', 'b', 'c', 'd'][result.correct],
            explanation: result.explanation,
          });
        }
      } else {
        // Generate formulas
        const results = await window.electronAPI.generateFormulas(
          chapter.content,
          chapter.name
        );

        for (const result of results) {
          const variablesJson = result.variables ? JSON.stringify(result.variables) : undefined;
          await window.electronAPI.createFormula(
            selectedSubject,
            result.theme,
            result.title,
            result.formula,
            result.description,
            variablesJson,
            selectedChapter
          );
        }
      }

      setGenerated(true);
    } catch (error: any) {
      console.error('Error generating content:', error);
      alert(error.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  if (subjects.length === 0) {
    return (
      <div className="p-8">
        <div className="card text-center py-16">
          <SparklesIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Vous devez d'abord importer des cours dans la bibliothèque
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Générer du contenu
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Utilisez l'IA pour créer automatiquement des flashcards et des quiz
        </p>
      </div>

      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Matière</label>
          <select
            value={selectedSubject || ''}
            onChange={(e) => setSelectedSubject(Number(e.target.value))}
            className="input"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Chapitre</label>
          <select
            value={selectedChapter || ''}
            onChange={(e) => setSelectedChapter(Number(e.target.value))}
            className="input"
            disabled={chapters.length === 0}
          >
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type de contenu</label>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={contentType === 'flashcards'}
                onChange={() => setContentType('flashcards')}
                className="text-primary-600"
              />
              <span>Flashcards</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={contentType === 'quizzes'}
                onChange={() => setContentType('quizzes')}
                className="text-primary-600"
              />
              <span>Quiz (QCM)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={contentType === 'formulas'}
                onChange={() => setContentType('formulas')}
                className="text-primary-600"
              />
              <span>Formules</span>
            </label>
          </div>
        </div>

        {contentType !== 'formulas' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre d'éléments (recommandé: 5-15)
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(30, Number(e.target.value))))}
              min="1"
              max="30"
              className="input"
            />
          </div>
        )}

        {generated && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-400">
            <CheckCircleIcon className="w-6 h-6" />
            <div>
              <p className="font-medium">Génération réussie !</p>
              <p className="text-sm">
                {contentType === 'formulas'
                  ? 'Formules extraites et ajoutées au formulaire'
                  : `${count} ${contentType === 'flashcards' ? 'flashcards' : 'quiz'} créé${count > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !selectedChapter}
          className="btn btn-primary w-full"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Génération en cours...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Générer
            </>
          )}
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            💡 Astuce: La génération utilise Claude Haiku 4.5 pour créer du contenu adapté au
            niveau PSI.
          </p>
          <p className="mt-2">
            Assurez-vous d'avoir configuré votre clé API Anthropic dans les paramètres.
          </p>
        </div>
      </div>
    </div>
  );
}
