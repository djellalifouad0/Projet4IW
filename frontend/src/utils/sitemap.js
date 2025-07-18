export function generateSitemap() {
  const baseUrl = 'https://skillswap.com'
  
  const staticRoutes = [
    {
      url: '/',
      changefreq: 'daily',
      priority: '1.0',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/login',
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/register',
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/dashboard',
      changefreq: 'daily',
      priority: '0.8',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/carte',
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/discussions',
      changefreq: 'daily',
      priority: '0.6',
      lastmod: new Date().toISOString().split('T')[0]
    }
  ]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return sitemapXml
}

// Fonction pour télécharger le sitemap
export function downloadSitemap() {
  const sitemap = generateSitemap()
  const blob = new Blob([sitemap], { type: 'text/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sitemap.xml'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
