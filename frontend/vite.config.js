import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ command }) => ({
  // base path subfolder — production build akan pakai /tiket/
  // dev mode tetap pakai '/' agar proxy & hot reload normal
  base: command === 'build' ? '/tiket/' : '/',

  plugins: [
    react(),
    tailwindcss(),
    mkcert(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
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
}))
