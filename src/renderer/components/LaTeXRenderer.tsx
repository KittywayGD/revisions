import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

/**
 * Composant pour rendre du contenu avec du LaTeX
 * Supporte les formules inline ($...$) et display ($$...$$)
 */
export default function LaTeXRenderer({ content, className = '' }: LaTeXRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Traiter le contenu pour détecter et rendre le LaTeX
    const processedContent = processLaTeX(content);
    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return <div ref={containerRef} className={className} />;
}

/**
 * Traite une chaîne de caractères pour rendre le LaTeX
 */
function processLaTeX(text: string): string {
  // Pattern pour détecter les formules display ($$...$$)
  const displayPattern = /\$\$([\s\S]+?)\$\$/g;
  
  // Pattern pour détecter les formules inline ($...$)
  const inlinePattern = /\$([^\$\n]+?)\$/g;

  // D'abord, remplacer les formules display
  let processed = text.replace(displayPattern, (match, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      });
    } catch (error) {
      console.error('LaTeX render error (display):', error);
      return `<span class="text-red-500">Erreur LaTeX: ${match}</span>`;
    }
  });

  // Ensuite, remplacer les formules inline
  processed = processed.replace(inlinePattern, (match, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      });
    } catch (error) {
      console.error('LaTeX render error (inline):', error);
      return `<span class="text-red-500">Erreur LaTeX: ${match}</span>`;
    }
  });

  return processed;
}

/**
 * Fonction utilitaire pour vérifier si un texte contient du LaTeX
 */
export function containsLaTeX(text: string): boolean {
  return /\$[\s\S]+?\$/.test(text);
}
