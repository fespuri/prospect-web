import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/auth': {
        target: 'https://prospect-axsc2elqy-passos2047s-projects.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/prospect': {
        target: 'https://prospect-axsc2elqy-passos2047s-projects.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});