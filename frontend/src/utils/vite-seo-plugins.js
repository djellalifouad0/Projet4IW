// Plugin Vite pour générer automatiquement le sitemap.xml

export function sitemapPlugin(options = {}) {
  const {
    baseUrl = 'https://skillswap.com',
    routes = [],
    outDir = 'dist'
  } = options

  return {
    name: 'sitemap-generator',
    generateBundle() {
      const defaultRoutes = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
        { url: '/login', changefreq: 'monthly', priority: '0.5' },
        { url: '/register', changefreq: 'monthly', priority: '0.5' },
        { url: '/dashboard', changefreq: 'daily', priority: '0.8' },
        { url: '/carte', changefreq: 'weekly', priority: '0.7' },
        { url: '/discussions', changefreq: 'daily', priority: '0.6' }
      ]

      const allRoutes = [...defaultRoutes, ...routes]
      const currentDate = new Date().toISOString().split('T')[0]

      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod || currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`

      // Émettre le fichier sitemap.xml
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapContent
      })

      console.log('✓ Sitemap generated successfully')
    }
  }
}

// Plugin pour copier robots.txt
export function robotsPlugin() {
  return {
    name: 'robots-generator',
    generateBundle() {
      const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://skillswap.com/sitemap.xml

# Délai de crawl recommandé (en secondes)
Crawl-delay: 1

# Pages à exclure du crawl
Disallow: /api/
Disallow: /admin/
Disallow: /*.json$
Disallow: /parametres
Disallow: /notifications

# Autoriser les ressources importantes
Allow: /src/assets/images/
Allow: /src/assets/styles/
Allow: /*.css$
Allow: /*.js$`

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsContent
      })

      console.log('✓ Robots.txt generated successfully')
    }
  }
}
