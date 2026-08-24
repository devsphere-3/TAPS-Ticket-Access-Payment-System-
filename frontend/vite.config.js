import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // HTTPS self-signed — agar kamera (getUserMedia) bisa jalan di IP lokal
    basicSsl(),
  ],
  server: {
    // Expose ke jaringan lokal agar bisa diakses via IP dari HP/device lain
    host: '0.0.0.0',
    https: true,
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
