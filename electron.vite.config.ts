import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Plugin to copy pdf-worker.cjs to dist
function copyPdfWorker() {
  return {
    name: 'copy-pdf-worker',
    writeBundle() {
      const src = path.resolve(__dirname, 'src/services/pdf-worker.cjs');
      const dest = path.resolve(__dirname, 'dist/main/pdf-worker.cjs');
      fs.copyFileSync(src, dest);
    }
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyPdfWorker()],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/main/main.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/main/preload.ts'),
        },
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
        },
      },
    },
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@services': path.resolve(__dirname, './src/services'),
        '@components': path.resolve(__dirname, './src/renderer/components'),
        '@pages': path.resolve(__dirname, './src/renderer/pages'),
        '@hooks': path.resolve(__dirname, './src/renderer/hooks'),
        '@utils': path.resolve(__dirname, './src/renderer/utils'),
      },
    },
  },
});
