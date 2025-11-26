import { useState, useEffect } from 'react';
import { AcademicCapIcon, BookOpenIcon, ChartBarIcon, FireIcon } from '@heroicons/react/24/outline';
import type { Subject, Statistics } from '../../shared/types';

interface DashboardProps {
  onNavigate: (page: 'library' | 'review' | 'statistics') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [dueCards, setDueCards] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subjectsData, statsData, dueCardsData] = await Promise.all([
        window.electronAPI.getSubjects(),
        window.electronAPI.getStatistics(),
        window.electronAPI.getFlashcardsDueForReview(),
      ]);

      setSubjects(subjectsData);
      setStats(statsData);
      setDueCards(dueCardsData.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Tableau de bord
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Bienvenue dans votre espace de révision PSI
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('review')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cartes à réviser</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                {dueCards}
              </p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <AcademicCapIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total flashcards</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {stats?.totalFlashcards || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Révisions totales</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {stats?.totalReviews || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FireIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('statistics')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Taux de réussite</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {stats?.successRate ? `${Math.round(stats.successRate)}%` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ChartBarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Start review button */}
      {dueCards > 0 && (
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Prêt pour réviser ?</h3>
              <p className="mt-2 opacity-90">
                Vous avez {dueCards} carte{dueCards > 1 ? 's' : ''} en attente de révision
              </p>
            </div>
            <button
              onClick={() => onNavigate('review')}
              className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Commencer
            </button>
          </div>
        </div>
      )}

      {/* Subjects overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Vos matières
          </h2>
          <button
            onClick={() => onNavigate('library')}
            className="btn btn-secondary text-sm"
          >
            Voir bibliothèque
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Vous n'avez pas encore ajouté de matières
            </p>
            <button
              onClick={() => onNavigate('library')}
              className="btn btn-primary"
            >
              Commencer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer"
                style={{ borderColor: subject.color }}
                onClick={() => onNavigate('library')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {subject.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
