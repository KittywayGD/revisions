import { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { ExerciseWithSubject } from '../../shared/types';
import LaTeXRenderer from '../components/LaTeXRenderer';

type ExerciseStatus = 'not_started' | 'in_progress' | 'completed' | 'to_review';

const statusConfig = {
  not_started: {
    label: 'À faire',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: ClockIcon,
  },
  in_progress: {
    label: 'En cours',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: ChevronRightIcon,
  },
  completed: {
    label: 'Terminé',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: CheckCircleIcon,
  },
  to_review: {
    label: 'À revoir',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: ClockIcon,
  },
};

const difficultyConfig = {
  easy: { label: 'Facile', color: 'text-green-600 dark:text-green-400' },
  medium: { label: 'Moyen', color: 'text-yellow-600 dark:text-yellow-400' },
  hard: { label: 'Difficile', color: 'text-red-600 dark:text-red-400' },
};

export default function Exercises() {
  const [exercises, setExercises] = useState<ExerciseWithSubject[]>([]);
  const [filterStatus, setFilterStatus] = useState<ExerciseStatus | 'all'>('all');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithSubject | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const data = await window.electronAPI.getAllExercises();
    setExercises(data);
  };

  const handleStatusChange = async (exerciseId: number, newStatus: ExerciseStatus) => {
    await window.electronAPI.updateExerciseStatus(exerciseId, newStatus);
    await loadExercises();
    if (selectedExercise?.id === exerciseId) {
      setSelectedExercise({ ...selectedExercise, status: newStatus });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      await window.electronAPI.deleteExercise(id);
      await loadExercises();
      if (selectedExercise?.id === id) {
        setSelectedExercise(null);
      }
    }
  };

  const filteredExercises =
    filterStatus === 'all' ? exercises : exercises.filter((ex) => ex.status === filterStatus);

  const exercisesByStatus = {
    not_started: exercises.filter((ex) => ex.status === 'not_started').length,
    in_progress: exercises.filter((ex) => ex.status === 'in_progress').length,
    completed: exercises.filter((ex) => ex.status === 'completed').length,
    to_review: exercises.filter((ex) => ex.status === 'to_review').length,
  };

  if (exercises.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Exercices</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Travaillez sur de vrais exercices d'application
          </p>
        </div>

        <div className="card text-center py-16">
          <AcademicCapIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Aucun exercice généré pour le moment
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Allez dans "Générer contenu" pour créer des exercices à partir de vos cours
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Exercices</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {exercises.length} exercice{exercises.length > 1 ? 's' : ''} disponible
          {exercises.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(exercisesByStatus).map(([status, count]) => {
          const config = statusConfig[status as ExerciseStatus];
          const Icon = config.icon;
          return (
            <div key={status} className={`card ${config.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {count}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${config.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Tous ({exercises.length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as ExerciseStatus)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {config.label} ({exercisesByStatus[status as ExerciseStatus]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise List */}
        <div className="space-y-4">
          {filteredExercises.map((exercise) => {
            const StatusIcon = statusConfig[exercise.status].icon;
            return (
              <div
                key={exercise.id}
                onClick={() => {
                  setSelectedExercise(exercise);
                  setShowSolution(false);
                }}
                className={`card cursor-pointer transition-all hover:shadow-lg ${
                  selectedExercise?.id === exercise.id
                    ? 'ring-2 ring-primary-500'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: exercise.subject_color }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {exercise.subject_name} • {exercise.chapter_name}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {exercise.title}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(exercise.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      statusConfig[exercise.status].bgColor
                    } ${statusConfig[exercise.status].color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig[exercise.status].label}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      difficultyConfig[exercise.difficulty].color
                    }`}
                  >
                    {difficultyConfig[exercise.difficulty].label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Exercise Detail */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          {selectedExercise ? (
            <div className="card">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedExercise.subject_color }}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedExercise.subject_name} • {selectedExercise.chapter_name}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedExercise.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      difficultyConfig[selectedExercise.difficulty].color
                    }`}
                  >
                    {difficultyConfig[selectedExercise.difficulty].label}
                  </span>
                </div>
              </div>

              {/* Status selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Statut</label>
                <select
                  value={selectedExercise.status}
                  onChange={(e) =>
                    handleStatusChange(selectedExercise.id, e.target.value as ExerciseStatus)
                  }
                  className="input"
                >
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statement */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  📝 Énoncé
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <LaTeXRenderer content={selectedExercise.statement} />
                </div>
              </div>

              {/* Solution */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ✅ Solution
                  </h3>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    {showSolution ? (
                      <>
                        <EyeSlashIcon className="w-4 h-4" />
                        Masquer
                      </>
                    ) : (
                      <>
                        <EyeIcon className="w-4 h-4" />
                        Voir la solution
                      </>
                    )}
                  </button>
                </div>

                {showSolution ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <LaTeXRenderer content={selectedExercise.solution} />
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center text-gray-400 dark:text-gray-500">
                    <EyeSlashIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Cliquez pour révéler la solution</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <AcademicCapIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Sélectionnez un exercice pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
