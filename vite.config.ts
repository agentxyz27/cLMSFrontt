import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses, including the specific hostname
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
    allowedHosts: [
      'thinkpad.local', // Allow your specific hostname
      '.local'          // Or allow any address ending in .local
    ],
  }
})