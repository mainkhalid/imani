import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this to resolve potential issues with Tailwind
  optimizeDeps: {
    include: ['tailwindcss']
  }
})