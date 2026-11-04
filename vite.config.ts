import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: { '/api': 'http://127.0.0.1:4174' },
  },

  preview: {
    allowedHosts: ['navlog.stern-betta.ts.net'],
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
