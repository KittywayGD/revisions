import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Generate from './pages/Generate';
import Review from './pages/Review';
import QuizPage from './pages/QuizPage';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import type { NavigationPage, Theme } from '../shared/types';

function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage | 'settings'>('dashboard');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load theme from settings
    window.electronAPI.getTheme().then((savedTheme) => {
      const themeValue = (savedTheme || 'light') as Theme;
      setTheme(themeValue);
      document.documentElement.classList.toggle('dark', themeValue === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    window.electronAPI.setTheme(newTheme);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'library':
        return <Library onNavigate={setCurrentPage} />;
      case 'generate':
        return <Generate />;
      case 'review':
        return <Review />;
      case 'quiz':
        return <QuizPage />;
      case 'statistics':
        return <Statistics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex-1 overflow-auto">{renderPage()}</main>
    </div>
  );
}

export default App;
