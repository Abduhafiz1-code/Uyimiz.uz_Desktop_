import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Django sukut bo'yicha 8000-portda ishlaydi. Boshqa port kerak bo'lsa:
  //   VITE_API_TARGET=http://127.0.0.1:8001 npm run dev
  const target = env.VITE_API_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      open: true,
      // Dev'da VITE_API_BASE bo'sh bo'ladi va so'rovlar nisbiy yo'l bilan
      // ketadi — shu proxy ularni lokal Django'ga uzatadi, CORS kerak emas.
      proxy: {
        '/api': { target, changeOrigin: true },
        '/media': { target, changeOrigin: true },
      },
    },
  }
})
