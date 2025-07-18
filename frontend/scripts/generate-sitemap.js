// Script pour générer le sitemap.xml dynamiquement
import fs from 'fs'
import path from 'path'

class SitemapGenerator {
  constructor(baseUrl = 'https://skillswap.com') {
    this.baseUrl = baseUrl
    this.urls = []
  }

  // Ajouter une URL au sitemap
  addUrl(url, options = {}) {
    const {
      lastmod = new Date().toISOString().split('T')[0],
      changefreq = 'weekly',
      priority = '0.5'
    } = options

    this.urls.push({
      loc: `${this.baseUrl}${url}`,
      lastmod,
      changefreq,
      priority
    })
  }

  // Ajouter les routes statiques
  addStaticRoutes() {
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/login', changefreq: 'monthly', priority: '0.5' },
      { url: '/register', changefreq: 'monthly', priority: '0.5' },
      { url: '/dashboard', changefreq: 'daily', priority: '0.8' },
      { url: '/carte', changefreq: 'weekly', priority: '0.7' },
      { url: '/discussions', changefreq: 'daily', priority: '0.6' }
    ]

    staticRoutes.forEach(route => {
      this.addUrl(route.url, {
        changefreq: route.changefreq,
        priority: route.priority
      })
    })
  }

  // Simuler l'ajout de routes dynamiques (à adapter selon votre API)
  addDynamicRoutes() {
    // Exemple de posts (à remplacer par un appel API réel)
    const samplePosts = [
      { id: 1, updatedAt: '2024-01-15' },
      { id: 2, updatedAt: '2024-01-20' },
      { id: 3, updatedAt: '2024-01-25' }
    ]

    samplePosts.forEach(post => {
      this.addUrl(`/post/${post.id}`, {
        lastmod: post.updatedAt,
        changefreq: 'weekly',
        priority: '0.6'
      })
    })

    // Exemple de profils publics (à remplacer par un appel API réel)
    const sampleProfiles = [
      { token: 'abc123', updatedAt: '2024-01-10' },
      { token: 'def456', updatedAt: '2024-01-12' },
      { token: 'ghi789', updatedAt: '2024-01-14' }
    ]

    sampleProfiles.forEach(profile => {
      this.addUrl(`/profile/${profile.token}`, {
        lastmod: profile.updatedAt,
        changefreq: 'weekly',
        priority: '0.5'
      })
    })
  }

  // Générer le XML du sitemap
  generateXML() {
    const urlsXML = this.urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXML}
</urlset>`
  }

  // Sauvegarder le sitemap
  saveSitemap(outputPath = 'public/sitemap.xml') {
    this.addStaticRoutes()
    this.addDynamicRoutes()

    const sitemapXML = this.generateXML()
    const fullPath = path.join(process.cwd(), outputPath)
    
    // Créer le dossier si nécessaire
    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(fullPath, sitemapXML)
    
    console.log(`✅ Sitemap généré avec ${this.urls.length} URLs`)
    console.log(`📁 Sauvegardé dans: ${fullPath}`)
    
    return fullPath
  }

  // Valider le sitemap
  validateSitemap() {
    const issues = []

    if (this.urls.length === 0) {
      issues.push('Aucune URL dans le sitemap')
    }

    if (this.urls.length > 50000) {
      issues.push('Trop d\'URLs (maximum 50,000 par sitemap)')
    }

    this.urls.forEach((url, index) => {
      if (!url.loc.startsWith('http')) {
        issues.push(`URL ${index + 1}: URL malformée (${url.loc})`)
      }

      if (url.priority && (parseFloat(url.priority) < 0 || parseFloat(url.priority) > 1)) {
        issues.push(`URL ${index + 1}: Priorité invalide (${url.priority})`)
      }

      const validChangefreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
      if (url.changefreq && !validChangefreq.includes(url.changefreq)) {
        issues.push(`URL ${index + 1}: Changefreq invalide (${url.changefreq})`)
      }
    })

    if (issues.length > 0) {
      console.log('⚠️  Problèmes détectés dans le sitemap:')
      issues.forEach(issue => console.log(`  • ${issue}`))
    } else {
      console.log('✅ Sitemap valide')
    }

    return issues
  }

  // Générer des statistiques
  generateStats() {
    const stats = {
      totalUrls: this.urls.length,
      byChangefreq: {},
      byPriority: {},
      avgPriority: 0
    }

    this.urls.forEach(url => {
      // Stats par changefreq
      stats.byChangefreq[url.changefreq] = (stats.byChangefreq[url.changefreq] || 0) + 1
      
      // Stats par priority
      const priority = parseFloat(url.priority)
      const priorityRange = priority >= 0.8 ? 'high' : priority >= 0.5 ? 'medium' : 'low'
      stats.byPriority[priorityRange] = (stats.byPriority[priorityRange] || 0) + 1
      
      stats.avgPriority += priority
    })

    stats.avgPriority = (stats.avgPriority / this.urls.length).toFixed(2)

    console.log('\n📊 Statistiques du sitemap:')
    console.log(`📄 Total URLs: ${stats.totalUrls}`)
    console.log(`🔄 Fréquence de mise à jour:`)
    Object.entries(stats.byChangefreq).forEach(([freq, count]) => {
      console.log(`  • ${freq}: ${count}`)
    })
    console.log(`⭐ Priorité:`)
    Object.entries(stats.byPriority).forEach(([range, count]) => {
      console.log(`  • ${range}: ${count}`)
    })
    console.log(`📈 Priorité moyenne: ${stats.avgPriority}`)

    return stats
  }
}

// Fonction pour récupérer les données dynamiques depuis l'API
async function fetchDynamicData() {
  try {
    // Ici vous pourriez faire des appels API pour récupérer:
    // - Les posts récents
    // - Les profils publics
    // - Les compétences populaires
    // etc.
    
    console.log('🔄 Récupération des données dynamiques...')
    
    // Exemple avec un appel API (à décommenter et adapter)
    /*
    const response = await fetch('http://localhost:5000/api/sitemap-data')
    const data = await response.json()
    return data
    */
    
    // Pour l'instant, retourner des données de test
    return {
      posts: [],
      profiles: [],
      skills: []
    }
  } catch (error) {
    console.warn('⚠️  Erreur lors de la récupération des données dynamiques:', error.message)
    return { posts: [], profiles: [], skills: [] }
  }
}

// Exécution du script
async function main() {
  console.log('🚀 Génération du sitemap SkillSwap...\n')
  
  const generator = new SitemapGenerator()
  
  // Récupérer les données dynamiques
  const dynamicData = await fetchDynamicData()
  
  // Ajouter les routes dynamiques si disponibles
  if (dynamicData.posts) {
    dynamicData.posts.forEach(post => {
      generator.addUrl(`/post/${post.id}`, {
        lastmod: post.updatedAt,
        changefreq: 'weekly',
        priority: '0.6'
      })
    })
  }
  
  if (dynamicData.profiles) {
    dynamicData.profiles.forEach(profile => {
      generator.addUrl(`/profile/${profile.token}`, {
        lastmod: profile.updatedAt,
        changefreq: 'monthly',
        priority: '0.5'
      })
    })
  }
  
  // Valider avant de sauvegarder
  const issues = generator.validateSitemap()
  
  if (issues.length === 0) {
    // Sauvegarder le sitemap
    const sitemapPath = generator.saveSitemap()
    
    // Afficher les statistiques
    generator.generateStats()
    
    // Créer aussi une version pour le build
    generator.saveSitemap('dist/sitemap.xml')
    
    console.log('\n🎉 Sitemap généré avec succès!')
  } else {
    console.log('\n❌ Génération annulée à cause des erreurs')
    process.exit(1)
  }
}

// Exécuter seulement si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { SitemapGenerator }
