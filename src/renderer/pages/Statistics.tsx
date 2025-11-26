import { useState, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import type { Statistics } from '../../shared/types';

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await window.electronAPI.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
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

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="p-8">
        <div className="card text-center py-16">
          <ChartBarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Aucune statistique disponible
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Commencez à réviser pour voir vos progrès !
          </p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...stats.reviewsBySubject.map((s) => s.count), 1);

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Statistiques
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Suivez votre progression et vos performances
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total flashcards</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalFlashcards}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Révisions effectuées</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalReviews}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Taux de réussite</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {Math.round(stats.successRate)}%
          </p>
        </div>
      </div>

      {/* Reviews by subject */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Révisions par matière
        </h2>
        <div className="space-y-4">
          {stats.reviewsBySubject.map((subject) => (
            <div key={subject.subject_id}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {subject.subject_name}
                </span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {subject.count} révisions · {Math.round(subject.success_rate)}% réussite
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all"
                  style={{ width: `${(subject.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {stats.reviewsByDay.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Activité récente (30 derniers jours)
          </h2>
          <div className="flex items-end gap-2 h-48">
            {stats.reviewsByDay.reverse().map((day) => {
              const maxDayCount = Math.max(...stats.reviewsByDay.map((d) => d.count));
              const height = (day.count / maxDayCount) * 100;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary-600 rounded-t transition-all hover:bg-primary-700 cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${day.count} révisions`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
