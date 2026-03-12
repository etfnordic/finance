import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        markets:     resolve(__dirname, 'src/pages/markets/index.html'),
        calculators: resolve(__dirname, 'src/pages/calculators/index.html'),
        news:        resolve(__dirname, 'src/pages/news/index.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
