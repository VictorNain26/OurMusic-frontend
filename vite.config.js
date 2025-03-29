import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: process.env.NODE_ENV === 'development' && process.env.VITE_API_BASE_URL
      ? {
          '/api': {
            target: process.env.VITE_API_BASE_URL,
            changeOrigin: true,
          },
        }
      : undefined,
    cors: {
      origin: true,
      credentials: true,
    },
  },
});
