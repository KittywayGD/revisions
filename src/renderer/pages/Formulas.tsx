import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import type { FormulaWithSubject, Subject } from '../../shared/types';
import LaTeXRenderer from '../components/LaTeXRenderer';

export default function Formulas() {
  const [formulas, setFormulas] = useState<FormulaWithSubject[]>([]);
  const [filteredFormulas, setFilteredFormulas] = useState<FormulaWithSubject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [themes, setThemes] = useState<string[]>([]);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FormulaWithSubject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFormulas();
  }, [formulas, searchQuery, selectedSubject, selectedTheme]);

  const loadData = async () => {
    try {
      const [formulasData, subjectsData] = await Promise.all([
        window.electronAPI.getFormulas(),
        window.electronAPI.getSubjects(),
      ]);
      setFormulas(formulasData);
      setSubjects(subjectsData);

      // Extract unique themes
      const uniqueThemes = Array.from(new Set(formulasData.map((f: FormulaWithSubject) => f.theme)));
      setThemes(uniqueThemes.sort());
    } catch (error) {
      console.error('Error loading formulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFormulas = () => {
    let filtered = [...formulas];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.formula.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query) ||
          f.theme.toLowerCase().includes(query) ||
          f.subject_name.toLowerCase().includes(query)
      );
    }

    // Filter by subject
    if (selectedSubject !== null) {
      filtered = filtered.filter((f) => f.subject_id === selectedSubject);
    }

    // Filter by theme
    if (selectedTheme !== null) {
      filtered = filtered.filter((f) => f.theme === selectedTheme);
    }

    setFilteredFormulas(filtered);
  };

  const handleDeleteFormula = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formule ?')) {
      try {
        await window.electronAPI.deleteFormula(id);
        loadData();
      } catch (error) {
        console.error('Error deleting formula:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const openNewFormulaModal = () => {
    setEditingFormula(null);
    setShowFormulaModal(true);
  };

  const openEditFormulaModal = (formula: FormulaWithSubject) => {
    setEditingFormula(formula);
    setShowFormulaModal(true);
  };

  // Group formulas by theme
  const formulasByTheme = filteredFormulas.reduce((acc, formula) => {
    if (!acc[formula.theme]) {
      acc[formula.theme] = [];
    }
    acc[formula.theme].push(formula);
    return acc;
  }, {} as Record<string, FormulaWithSubject[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Formulaire</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Toutes vos formules importantes, organisées et searchables
          </p>
        </div>
        <button onClick={openNewFormulaModal} className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Ajouter formule
        </button>
      </div>

      {/* Search and filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une formule, un thème..."
              className="input pl-10 w-full"
            />
          </div>

          {/* Subject filter */}
          <div className="flex gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400 self-center" />
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
              className="input"
            >
              <option value="">Toutes les matières</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            {/* Theme filter */}
            <select
              value={selectedTheme || ''}
              onChange={(e) => setSelectedTheme(e.target.value || null)}
              className="input"
            >
              <option value="">Tous les thèmes</option>
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>

            {(selectedSubject || selectedTheme || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject(null);
                  setSelectedTheme(null);
                }}
                className="btn btn-secondary"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          {filteredFormulas.length} formule{filteredFormulas.length > 1 ? 's' : ''} trouvée
          {filteredFormulas.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Formulas by theme */}
      {Object.keys(formulasByTheme).length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Aucune formule trouvée
          </p>
          <button onClick={openNewFormulaModal} className="btn btn-primary">
            Ajouter votre première formule
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(formulasByTheme)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([theme, themeFormulas]) => (
              <div key={theme}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="w-1 h-8 bg-primary-600 dark:bg-primary-400 rounded-full" />
                  {theme}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({themeFormulas.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {themeFormulas.map((formula) => (
                    <FormulaCard
                      key={formula.id}
                      formula={formula}
                      onEdit={() => openEditFormulaModal(formula)}
                      onDelete={() => handleDeleteFormula(formula.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {showFormulaModal && (
        <FormulaModal
          formula={editingFormula}
          subjects={subjects}
          onClose={() => setShowFormulaModal(false)}
          onSuccess={() => {
            setShowFormulaModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function FormulaCard({
  formula,
  onEdit,
  onDelete,
}: {
  formula: FormulaWithSubject;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showVariables, setShowVariables] = useState(false);

  let variables: Record<string, string> = {};
  if (formula.variables) {
    try {
      variables = JSON.parse(formula.variables);
    } catch (e) {
      console.error('Error parsing variables:', e);
    }
  }

  return (
    <div className="card group relative">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: formula.subject_color }}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{formula.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formula.subject_name}
              {formula.chapter_name && ` • ${formula.chapter_name}`}
            </p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Modifier"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Formula */}
      <div className="my-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-x-auto">
        <LaTeXRenderer content={`$$${formula.formula}$$`} className="text-center text-lg" />
      </div>

      {/* Description */}
      {formula.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{formula.description}</p>
      )}

      {/* Variables */}
      {Object.keys(variables).length > 0 && (
        <div>
          <button
            onClick={() => setShowVariables(!showVariables)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {showVariables ? 'Masquer' : 'Afficher'} les variables ({Object.keys(variables).length})
          </button>
          {showVariables && (
            <div className="mt-2 space-y-1">
              {Object.entries(variables).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <LaTeXRenderer content={`$${key}$`} className="font-medium text-gray-900 dark:text-gray-100" />
                  <span className="text-gray-500 dark:text-gray-400">:</span>
                  <span className="text-gray-600 dark:text-gray-300">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FormulaModal({
  formula,
  subjects,
  onClose,
  onSuccess,
}: {
  formula: FormulaWithSubject | null;
  subjects: Subject[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [subjectId, setSubjectId] = useState(formula?.subject_id || subjects[0]?.id || 0);
  const [theme, setTheme] = useState(formula?.theme || '');
  const [title, setTitle] = useState(formula?.title || '');
  const [formulaText, setFormulaText] = useState(formula?.formula || '');
  const [description, setDescription] = useState(formula?.description || '');
  const [variablesText, setVariablesText] = useState('');

  useEffect(() => {
    if (formula?.variables) {
      try {
        const vars = JSON.parse(formula.variables);
        const varsText = Object.entries(vars)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        setVariablesText(varsText);
      } catch (e) {
        console.error('Error parsing variables:', e);
      }
    }
  }, [formula]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !formulaText.trim() || !theme.trim()) return;

    // Parse variables
    let variablesJson = null;
    if (variablesText.trim()) {
      const vars: Record<string, string> = {};
      variablesText.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          vars[key.trim()] = valueParts.join(':').trim();
        }
      });
      variablesJson = JSON.stringify(vars);
    }

    try {
      if (formula) {
        await window.electronAPI.updateFormula(
          formula.id,
          theme,
          title,
          formulaText,
          description,
          variablesJson || undefined
        );
      } else {
        await window.electronAPI.createFormula(
          subjectId,
          theme,
          title,
          formulaText,
          description,
          variablesJson || undefined
        );
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving formula:', error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {formula ? 'Modifier' : 'Nouvelle'} formule
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Matière</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(Number(e.target.value))}
                className="input"
                disabled={!!formula}
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Thème</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="input"
                placeholder="Ex: Mécanique, Thermodynamique..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nom de la formule</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Ex: Énergie cinétique"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Formule (LaTeX, sans $$ $$)
            </label>
            <textarea
              value={formulaText}
              onChange={(e) => setFormulaText(e.target.value)}
              className="input font-mono"
              rows={3}
              placeholder="Ex: E_c = \frac{1}{2}mv^2"
            />
            {formulaText && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Prévisualisation :</p>
                <LaTeXRenderer content={`$$${formulaText}$$`} className="text-center" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={2}
              placeholder="Contexte d'utilisation, conditions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Variables (optionnel) - une par ligne : "variable: description"
            </label>
            <textarea
              value={variablesText}
              onChange={(e) => setVariablesText(e.target.value)}
              className="input font-mono text-sm"
              rows={4}
              placeholder={"m: masse (kg)\nv: vitesse (m/s)\nE_c: énergie cinétique (J)"}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {formula ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
