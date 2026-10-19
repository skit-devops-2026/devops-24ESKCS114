import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const clientDirectory = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: clientDirectory,
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
});