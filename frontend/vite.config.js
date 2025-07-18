import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { sitemapPlugin, robotsPlugin } from './src/utils/vite-seo-plugins.js'

export default defineConfig({
  plugins: [
    vue(),
    sitemapPlugin({
      baseUrl: 'https://skillswap.com',
      routes: [
        // Ajoutez ici des routes dynamiques si nécessaire
        // { url: '/post/exemple', changefreq: 'weekly', priority: '0.6' }
      ]
    }),
    robotsPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000
  },
  build: {
    // Optimisations pour le SEO
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['axios']
        }
      }
    },
    // Générer des noms de fichiers avec hash pour le cache
    assetsDir: 'assets',
    // Optimiser les images
    assetsInlineLimit: 4096
  },
  // Configuration pour améliorer la performance (Core Web Vitals)
  esbuild: {
    drop: ['console', 'debugger']
  }
})
