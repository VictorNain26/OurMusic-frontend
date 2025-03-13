import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['ourmusic.fr'],
    proxy: {
      '/api': {
        target: 'https://ourmusic-api.ovh',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      }
    },
    cors: {
      origin: 'https://ourmusic.fr',
      credentials: true,
    }
  }
})
