import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose process.env to the client-side code for Vercel deployment
    'process.env': process.env
  }
})
