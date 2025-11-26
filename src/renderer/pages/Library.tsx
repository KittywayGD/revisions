import { useState, useEffect } from 'react';
import {
  PlusIcon,
  FolderIcon,
  DocumentTextIcon,
  TrashIcon,
  SparklesIcon,
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
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedSubject === subject.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <span className="font-medium text-sm">{subject.name}</span>
            </button>
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
    </div>
  );
}

function ChapterCard({ chapter, onNavigate }: { chapter: Chapter; onNavigate: (page: 'generate') => void }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <DocumentTextIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {chapter.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
        {chapter.content.substring(0, 100)}...
      </p>
      <button
        onClick={() => onNavigate('generate')}
        className="btn btn-primary w-full text-sm"
      >
        <SparklesIcon className="w-4 h-4 mr-2" />
        Générer contenu
      </button>
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
