import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 브라우저 CORS 회피: /candiy/* → https://api.candiy.io/*
      '/candiy': {
        target: 'https://api.candiy.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/candiy/, ''),
      },
    },
  },
})
