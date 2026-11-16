import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In development, "/api" requests are forwarded to the Express server.
// Default: Express running locally on port 5000.
// To use the live server instead:  API_PROXY=http://<server> npm run dev
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.API_PROXY || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
