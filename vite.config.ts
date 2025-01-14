import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../out',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});