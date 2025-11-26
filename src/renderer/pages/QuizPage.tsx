import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { Subject, Chapter, Quiz } from '../../shared/types';

export default function QuizPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

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

  const startQuiz = async () => {
    if (!selectedChapter) return;

    const data = await window.electronAPI.getQuizzesByChapter(selectedChapter);
    if (data.length === 0) {
      alert('Aucun quiz disponible pour ce chapitre. Générez-en d\'abord !');
      return;
    }

    setQuizzes(data);
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setQuizComplete(false);
  };

  const handleAnswer = () => {
    if (!selectedAnswer) return;

    const currentQuiz = quizzes[currentIndex];
    const isCorrect = selectedAnswer === currentQuiz.correct_option;

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  if (!quizStarted) {
    return (
      <div className="p-8 max-w-3xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quiz</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Testez vos connaissances avec des QCM
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

          <button onClick={startQuiz} className="btn btn-primary w-full">
            Commencer le quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / quizzes.length) * 100);

    return (
      <div className="p-8">
        <div className="card max-w-2xl mx-auto text-center py-16">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Quiz terminé !
          </h2>
          <div className="mb-8">
            <p className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {percentage}%
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {score} / {quizzes.length} bonnes réponses
            </p>
          </div>
          <button
            onClick={() => {
              setQuizStarted(false);
              setQuizComplete(false);
              setSelectedAnswer(null);
              setShowResult(false);
            }}
            className="btn btn-primary"
          >
            Nouveau quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIndex];
  const progress = ((currentIndex + 1) / quizzes.length) * 100;
  const options = [
    { key: 'a', value: currentQuiz.option_a },
    { key: 'b', value: currentQuiz.option_b },
    { key: 'c', value: currentQuiz.option_c },
    { key: 'd', value: currentQuiz.option_d },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quiz</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentIndex + 1} / {quizzes.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="card mb-6">
        <p className="text-xl text-gray-900 dark:text-gray-100 mb-8">{currentQuiz.question}</p>

        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedAnswer === option.key;
            const isCorrect = option.key === currentQuiz.correct_option;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <button
                key={option.key}
                onClick={() => !showResult && setSelectedAnswer(option.key)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : showIncorrect
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-500 dark:text-gray-400">
                    {option.key.toUpperCase()}.
                  </span>
                  <span className="flex-1">{option.value}</span>
                  {showCorrect && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                  {showIncorrect && <XCircleIcon className="w-6 h-6 text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg animate-fade-in">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Explication :
            </p>
            <p className="text-blue-800 dark:text-blue-200">{currentQuiz.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {showResult ? (
          <button onClick={nextQuestion} className="btn btn-primary">
            {currentIndex < quizzes.length - 1 ? 'Question suivante' : 'Voir le résultat'}
          </button>
        ) : (
          <button
            onClick={handleAnswer}
            disabled={!selectedAnswer}
            className="btn btn-primary"
          >
            Valider
          </button>
        )}
      </div>
    </div>
  );
}
