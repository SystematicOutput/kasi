import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Set the root to the 'public' directory where the frontend source code lives
  root: 'public',
  plugins: [react()],
  server: {
    // Proxy API requests to the backend server during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Build the output to a 'dist' directory at the project root
    outDir: '../dist',
    emptyOutDir: true,
  }
});