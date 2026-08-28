import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: resolve('src/renderer'),
  // Why: pairing URLs may live under a reverse-proxy path prefix like
  // /orca/web-index.html, so built assets must resolve relative to the page.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'rewrite-default-to-web-index',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/') {
            req.url = '/web-index.html'
          }
          next()
        })
      }
    }
  ],
  define: {
    ORCA_FEATURE_WALL_ENABLED: 'true'
  },
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
      '@': resolve('src/renderer/src')
    }
  },
  build: {
    outDir: resolve('out/web'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve('src/renderer/web-index.html')
    }
  },
  worker: {
    format: 'es'
  }
})
