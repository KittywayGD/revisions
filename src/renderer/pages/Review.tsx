import { useState, useEffect } from 'react';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Review() {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const cards = await window.electronAPI.getFlashcardsDueForReview();
      setFlashcards(cards);
      setLoading(false);
      if (cards.length === 0) {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      setLoading(false);
    }
  };

  const handleRating = async (rating: 'easy' | 'medium' | 'hard') => {
    const currentCard = flashcards[currentIndex];
    const success = rating !== 'hard';

    try {
      await window.electronAPI.recordReview(currentCard.id, rating, success);

      setSessionStats((prev) => ({
        correct: prev.correct + (success ? 1 : 0),
        total: prev.total + 1,
      }));

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setFlipped(false);
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Error recording review:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (sessionComplete || flashcards.length === 0) {
    return (
      <div className="p-8">
        <div className="card max-w-2xl mx-auto text-center py-16">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {sessionStats.total > 0 ? 'Session terminée !' : 'Aucune carte à réviser'}
          </h2>
          {sessionStats.total > 0 ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Vous avez révisé {sessionStats.total} carte{sessionStats.total > 1 ? 's' : ''}
              </p>
              <div className="flex justify-center gap-8 mb-8">
                <div>
                  <p className="text-3xl font-bold text-green-600">{sessionStats.correct}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Réussies</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Taux de réussite</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Toutes vos cartes sont à jour ! Revenez plus tard.
            </p>
          )}
          <button
            onClick={() => {
              setSessionComplete(false);
              setCurrentIndex(0);
              setSessionStats({ correct: 0, total: 0 });
              loadFlashcards();
            }}
            className="btn btn-primary"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Nouvelle session
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Révision
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-sm rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
          {currentCard.subject_name} - {currentCard.chapter_name}
        </span>
      </div>

      <div
        className={`flip-card ${flipped ? 'flipped' : ''} mb-8 cursor-pointer`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flip-card-inner relative">
          <div className="flip-card-front card min-h-[400px] flex flex-col items-center justify-center p-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">QUESTION</p>
            <p className="text-2xl text-center text-gray-900 dark:text-gray-100">
              {currentCard.question}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-8">
              Cliquez pour voir la réponse
            </p>
          </div>
          <div className="flip-card-back card min-h-[400px] flex flex-col items-center justify-center p-8 absolute inset-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">RÉPONSE</p>
            <p className="text-xl text-center text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {currentCard.answer}
            </p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-4 animate-fade-in">
          <button
            onClick={() => handleRating('hard')}
            className="flex-1 py-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Difficile
            <p className="text-xs mt-1 opacity-70">À revoir bientôt</p>
          </button>
          <button
            onClick={() => handleRating('medium')}
            className="flex-1 py-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
          >
            Moyen
            <p className="text-xs mt-1 opacity-70">Revoir dans quelques jours</p>
          </button>
          <button
            onClick={() => handleRating('easy')}
            className="flex-1 py-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Facile
            <p className="text-xs mt-1 opacity-70">Revoir plus tard</p>
          </button>
        </div>
      )}
    </div>
  );
}
