import {
  HomeIcon,
  BookOpenIcon,
  SparklesIcon,
  AcademicCapIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  CalendarIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import type { NavigationPage, Theme } from '../../shared/types';

interface SidebarProps {
  currentPage: NavigationPage | 'settings';
  onNavigate: (page: NavigationPage | 'settings') => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Sidebar({ currentPage, onNavigate, theme, onToggleTheme }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Tableau de bord', icon: HomeIcon },
    { id: 'library' as const, label: 'Bibliothèque', icon: BookOpenIcon },
    { id: 'generate' as const, label: 'Générer contenu', icon: SparklesIcon },
    { id: 'review' as const, label: 'Révision', icon: AcademicCapIcon },
    { id: 'quiz' as const, label: 'Quiz', icon: PuzzlePieceIcon },
    { id: 'exercises' as const, label: 'Exercices', icon: ClipboardDocumentListIcon },
    { id: 'formulas' as const, label: 'Formulaire', icon: CalculatorIcon },
    { id: 'calendar' as const, label: 'Calendrier', icon: CalendarIcon },
    { id: 'statistics' as const, label: 'Statistiques', icon: ChartBarIcon },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          PSI Révision
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Votre assistant de révision
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-item w-full ${isActive ? 'sidebar-item-active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button
          onClick={onToggleTheme}
          className="sidebar-item w-full"
        >
          {theme === 'light' ? (
            <>
              <MoonIcon className="w-5 h-5" />
              <span>Mode sombre</span>
            </>
          ) : (
            <>
              <SunIcon className="w-5 h-5" />
              <span>Mode clair</span>
            </>
          )}
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`sidebar-item w-full ${currentPage === 'settings' ? 'sidebar-item-active' : ''}`}
        >
          <Cog6ToothIcon className="w-5 h-5" />
          <span>Paramètres</span>
        </button>
      </div>
    </aside>
  );
}
