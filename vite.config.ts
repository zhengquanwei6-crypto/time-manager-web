import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('react-dom') ||
            id.includes('react-router-dom') ||
            id.includes('/react/')
          ) {
            return 'react-vendor';
          }

          if (id.includes('/dayjs/')) {
            return 'date-vendor';
          }

          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
