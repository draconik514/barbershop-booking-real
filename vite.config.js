import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    minify: 'oxc',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-router-dom') || id.includes('react-dom') || (id.includes('node_modules/react/') && !id.includes('react-'))) return 'vendor-react'
          if (id.includes('react-hot-toast') || id.includes('date-fns')) return 'vendor-ui'
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
