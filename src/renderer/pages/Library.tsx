import { useState, useEffect } from 'react';
import {
  PlusIcon,
  FolderIcon,
  DocumentTextIcon,
  TrashIcon,
  SparklesIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { Subject, Chapter } from '../../shared/types';

interface LibraryProps {
  onNavigate: (page: 'generate') => void;
}

export default function Library({ onNavigate }: LibraryProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [showNewChapterModal, setShowNewChapterModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadChapters(selectedSubject);
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    try {
      const data = await window.electronAPI.getSubjects();
      setSubjects(data);
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0].id);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (subjectId: number) => {
    try {
      const data = await window.electronAPI.getChaptersBySubject(subjectId);
      setChapters(data);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const handleImportFile = async () => {
    if (!selectedSubject) return;

    try {
      const file = await window.electronAPI.selectFile();
      if (file) {
        await window.electronAPI.createChapter(
          selectedSubject,
          file.name,
          file.content,
          file.path
        );
        loadChapters(selectedSubject);
      }
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Erreur lors de l\'importation du fichier');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Subjects sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Matières
          </h2>
          <button
            onClick={() => setShowNewSubjectModal(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Ajouter une matière"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`flex items-center gap-2 group ${
                selectedSubject === subject.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg'
                  : ''
              }`}
            >
              <button
                onClick={() => setSelectedSubject(subject.id)}
                className="flex-1 flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="font-medium text-sm">{subject.name}</span>
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Êtes-vous sûr de vouloir supprimer "${subject.name}" et tous ses chapitres ?`)) {
                    try {
                      await window.electronAPI.deleteSubject(subject.id);
                      if (selectedSubject === subject.id) {
                        setSelectedSubject(null);
                      }
                      loadSubjects();
                    } catch (error) {
                      console.error('Error deleting subject:', error);
                      alert('Erreur lors de la suppression');
                    }
                  }
                }}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Supprimer la matière"
              >
                <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            Aucune matière. Cliquez sur + pour commencer.
          </div>
        )}
      </div>

      {/* Chapters content */}
      <div className="flex-1 p-8 overflow-auto">
        {selectedSubject ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {subjects.find((s) => s.id === selectedSubject)?.name}
              </h1>
              <div className="flex gap-3">
                <button onClick={handleImportFile} className="btn btn-secondary">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Importer un cours
                </button>
              </div>
            </div>

            {chapters.length === 0 ? (
              <div className="card text-center py-16">
                <FolderIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Aucun chapitre dans cette matière
                </p>
                <button onClick={handleImportFile} className="btn btn-primary">
                  Importer votre premier cours
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    onNavigate={onNavigate}
                    onViewDetails={() => setSelectedChapter(chapter)}
                    onDelete={async () => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer le chapitre "${chapter.name}" ?`)) {
                        try {
                          await window.electronAPI.deleteChapter(chapter.id);
                          if (selectedSubject) {
                            loadChapters(selectedSubject);
                          }
                        } catch (error) {
                          console.error('Error deleting chapter:', error);
                          alert('Erreur lors de la suppression');
                        }
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FolderIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Sélectionnez une matière pour voir ses chapitres
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {showNewSubjectModal && (
        <NewSubjectModal
          onClose={() => setShowNewSubjectModal(false)}
          onSuccess={() => {
            loadSubjects();
            setShowNewSubjectModal(false);
          }}
        />
      )}

      {selectedChapter && (
        <ChapterDetailsModal
          chapter={selectedChapter}
          onClose={() => setSelectedChapter(null)}
        />
      )}
    </div>
  );
}

function ChapterCard({
  chapter,
  onNavigate,
  onViewDetails,
  onDelete
}: {
  chapter: Chapter;
  onNavigate: (page: 'generate') => void;
  onViewDetails: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <DocumentTextIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <button
          onClick={onDelete}
          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
          title="Supprimer le chapitre"
        >
          <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {chapter.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
        {chapter.content.substring(0, 100)}...
      </p>
      <div className="space-y-2">
        <button
          onClick={() => onNavigate('generate')}
          className="btn btn-primary w-full text-sm"
        >
          <SparklesIcon className="w-4 h-4 mr-2" />
          Générer contenu
        </button>
        <button
          onClick={onViewDetails}
          className="btn btn-secondary w-full text-sm"
        >
          <ChevronRightIcon className="w-4 h-4 mr-2" />
          Voir détails
        </button>
      </div>
    </div>
  );
}

function ChapterDetailsModal({ chapter, onClose }: { chapter: Chapter; onClose: () => void }) {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [flashcardsData, quizzesData] = await Promise.all([
        window.electronAPI.getFlashcardsByChapter(chapter.id),
        window.electronAPI.getQuizzesByChapter(chapter.id),
      ]);
      setFlashcards(flashcardsData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlashcard = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette flashcard ?')) {
      try {
        await window.electronAPI.deleteFlashcard(id);
        loadContent();
      } catch (error) {
        console.error('Error deleting flashcard:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      try {
        await window.electronAPI.deleteQuiz(id);
        loadContent();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {chapter.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
          </div>
        ) : (
          <div className="overflow-y-auto space-y-6">
            {/* Flashcards Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Flashcards ({flashcards.length})
              </h3>
              {flashcards.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucune flashcard générée pour ce chapitre
                </p>
              ) : (
                <div className="space-y-2">
                  {flashcards.map((flashcard) => (
                    <div
                      key={flashcard.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {flashcard.question}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {flashcard.answer}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteFlashcard(flashcard.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quizzes Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Quiz ({quizzes.length})
              </h3>
              {quizzes.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun quiz généré pour ce chapitre
                </p>
              ) : (
                <div className="space-y-2">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {quiz.question}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Réponse correcte: {quiz.correct_option.toUpperCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewSubjectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const colors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F59E0B', // Orange
    '#10B981', // Green
    '#06B6D4', // Cyan
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await window.electronAPI.createSubject(name, color);
      onSuccess();
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('Erreur lors de la création de la matière');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card max-w-md w-full m-4">
        <h2 className="text-xl font-semibold mb-4">Nouvelle matière</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nom de la matière</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Ex: Physique, Mathématiques..."
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Couleur</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
