import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue()],
    server: { port: 5173, host: '0.0.0.0' },
    define: { __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:8080') }
  }
})
