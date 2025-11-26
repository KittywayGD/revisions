import fs from 'fs/promises';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FileService {
  async extractContent(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.pdf':
        return this.extractPdfContent(filePath);
      case '.md':
      case '.txt':
        return this.extractTextContent(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  private async extractPdfContent(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Déterminer le chemin du worker
      let workerPath = path.join(__dirname, 'pdf-worker.cjs');

      // En production, si le fichier est dans app.asar, on doit utiliser la version dépaquetée
      // car on va utiliser ELECTRON_RUN_AS_NODE qui ne sait pas lire dans l'ASAR
      if (workerPath.includes('app.asar')) {
        workerPath = workerPath.replace('app.asar', 'app.asar.unpacked');
      }

      console.log('Launching PDF worker at:', workerPath);

      const worker = fork(workerPath, [], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
          ...process.env,
          // CRUCIAL : Force le processus à agir comme un Node.js standard
          // Cela évite les conflits avec DOMMatrix et les APIs Electron
          ELECTRON_RUN_AS_NODE: '1',
        },
      });

      let timeoutId: NodeJS.Timeout;
      let stderrData = '';
      let resolved = false;

      if (worker.stderr) {
        worker.stderr.on('data', (data) => {
          const msg = data.toString();
          stderrData += msg;
          console.error('PDF Worker stderr:', msg);
        });
      }

      worker.on('message', (message: any) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        
        if (message.success) {
          resolve(message.text);
        } else {
          reject(new Error(message.error || 'Unknown worker error'));
        }
        worker.kill();
      });

      worker.on('error', (error) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        console.error('PDF Worker execution error:', error);
        reject(new Error(`PDF worker failed to start: ${error.message}`));
      });

      worker.on('exit', (code) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        if (code !== 0) {
          console.error(`PDF Worker exited with code ${code}. Stderr: ${stderrData}`);
          reject(new Error(`PDF worker exited with code ${code}: ${stderrData}`));
        }
      });

      // Timeout de sécurité (30s)
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          worker.kill();
          reject(new Error('Délai d\'attente dépassé pour l\'extraction PDF (30s)'));
        }
      }, 30000);

      // Envoyer le fichier à traiter
      worker.send({ filePath });
    });
  }

  private async extractTextContent(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error('Error reading text file:', error);
      throw new Error('Failed to read file');
    }
  }
}