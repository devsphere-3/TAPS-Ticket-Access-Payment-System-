import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) — manualChunks harus function
        manualChunks(id) {
          if (id.includes('node_modules/html5-qrcode')) return 'qr-scanner'
          if (id.includes('node_modules/qrcode.react')) return 'qr-generator'
          if (id.includes('node_modules/react-dom'))    return 'react-vendor'
          if (id.includes('node_modules/react-router')) return 'router'
          if (id.includes('node_modules/axios'))        return 'axios'
          if (id.includes('node_modules/react'))        return 'react-vendor'
        },
      },
    },
  },
})
