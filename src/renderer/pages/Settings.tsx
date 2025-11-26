import { useState, useEffect } from 'react';
import { KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const key = await window.electronAPI.getApiKey();
      if (key) {
        setApiKey(key);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await window.electronAPI.setApiKey(apiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Erreur lors de la sauvegarde');
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
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Paramètres</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Configurez votre application
        </p>
      </div>

      <div className="card space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <KeyIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Clé API Anthropic
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Entrez votre clé API Anthropic pour activer la génération de contenu par IA.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="input mb-4"
          />
          <button onClick={handleSave} className="btn btn-primary">
            Enregistrer
          </button>

          {saved && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-400">
              <CheckCircleIcon className="w-6 h-6" />
              <span>Clé API enregistrée avec succès</span>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Comment obtenir une clé API ?
          </h3>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
            <li>
              Créez un compte sur{' '}
              <a
                href="https://console.anthropic.com"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                console.anthropic.com
              </a>
            </li>
            <li>Accédez à la section "API Keys"</li>
            <li>Créez une nouvelle clé API</li>
            <li>Copiez la clé et collez-la ci-dessus</li>
          </ol>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Modèle utilisé
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cette application utilise <strong>Claude Haiku 4.5</strong> (claude-haiku-4-5-20251001)
            pour générer les flashcards et quiz. Ce modèle est rapide et économique tout en
            produisant du contenu de haute qualité adapté au niveau PSI.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            À propos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>PSI Révision</strong> - Version 1.0.0
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Application de révision pour étudiants en classe préparatoire PSI.
          </p>
        </div>
      </div>
    </div>
  );
}
