import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    testTimeout: 30000,
    // Testlar bitta backendga qarshi ketma-ket ishlaydi — parallel
    // bo'lsa login'lar bir-birini almashtirib yuboradi.
    fileParallelism: false,
  },
})
