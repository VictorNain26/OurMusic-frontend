import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const apiBaseUrl = env.VITE_API_BASE_URL;

  return {
    base: './',
    plugins: [react(),tailwindcss(),],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: apiBaseUrl
        ? {
            '/api': {
              target: apiBaseUrl,
              changeOrigin: true,
            },
          }
        : undefined,
      cors: {
        origin: true,
        credentials: true,
      },
    },
  };
});
