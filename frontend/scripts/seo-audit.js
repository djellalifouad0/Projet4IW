// Script d'audit SEO automatique pour SkillSwap
import fs from 'fs'
import path from 'path'

class SEOAuditor {
  constructor() {
    this.results = {
      score: 0,
      maxScore: 0,
      issues: [],
      recommendations: [],
      passed: []
    }
  }

  // Vérifier le fichier index.html
  auditIndexHTML() {
    const indexPath = path.join(process.cwd(), 'index.html')
    
    if (!fs.existsSync(indexPath)) {
      this.addIssue('index.html non trouvé', 'critical')
      return
    }

    const content = fs.readFileSync(indexPath, 'utf-8')

    // Vérifications critiques
    this.checkMetaTag(content, 'title', 'Titre de la page')
    this.checkMetaTag(content, 'meta name="description"', 'Meta description')
    this.checkMetaTag(content, 'meta name="viewport"', 'Meta viewport')
    this.checkMetaTag(content, 'meta charset', 'Encodage des caractères')

    // Vérifications Open Graph
    this.checkMetaTag(content, 'meta property="og:title"', 'Open Graph title')
    this.checkMetaTag(content, 'meta property="og:description"', 'Open Graph description')
    this.checkMetaTag(content, 'meta property="og:image"', 'Open Graph image')
    this.checkMetaTag(content, 'meta property="og:url"', 'Open Graph URL')

    // Vérifications Twitter Card
    this.checkMetaTag(content, 'meta property="twitter:card"', 'Twitter Card')
    this.checkMetaTag(content, 'meta property="twitter:title"', 'Twitter title')

    // Vérifications techniques
    this.checkMetaTag(content, 'link rel="canonical"', 'URL canonique')
    this.checkMetaTag(content, 'link rel="icon"', 'Favicon')
    
    // Vérifier les données structurées
    if (content.includes('application/ld+json')) {
      this.addPassed('Données structurées JSON-LD présentes')
      this.addScore(5)
    } else {
      this.addIssue('Données structurées JSON-LD manquantes', 'medium')
    }

    // Vérifier la langue
    if (content.includes('lang="fr"')) {
      this.addPassed('Langue française définie')
      this.addScore(2)
    } else {
      this.addIssue('Langue non définie ou incorrecte', 'medium')
    }
  }

  // Vérifier la présence d'un meta tag
  checkMetaTag(content, pattern, name) {
    this.maxScore += 2
    if (content.includes(pattern)) {
      this.addPassed(`${name} présent`)
      this.addScore(2)
    } else {
      this.addIssue(`${name} manquant`, 'high')
    }
  }

  // Vérifier les fichiers SEO essentiels
  auditSEOFiles() {
    const files = [
      { path: 'public/robots.txt', name: 'robots.txt', score: 3 },
      { path: 'dist/sitemap.xml', name: 'sitemap.xml', score: 5 }
    ]

    files.forEach(file => {
      this.maxScore += file.score
      if (fs.existsSync(path.join(process.cwd(), file.path))) {
        this.addPassed(`${file.name} présent`)
        this.addScore(file.score)
      } else {
        this.addIssue(`${file.name} manquant`, 'medium')
        this.addRecommendation(`Créer le fichier ${file.name}`)
      }
    })
  }

  // Vérifier la structure des composables SEO
  auditSEOImplementation() {
    const seoFiles = [
      'src/composables/useSEO.js',
      'src/services/seoService.js',
      'src/components/SEOHead.vue',
      'src/components/Breadcrumb.vue'
    ]

    seoFiles.forEach(file => {
      this.maxScore += 3
      if (fs.existsSync(path.join(process.cwd(), file))) {
        this.addPassed(`Fichier SEO ${file} implémenté`)
        this.addScore(3)
      } else {
        this.addIssue(`Fichier SEO ${file} manquant`, 'medium')
      }
    })
  }

  // Vérifier la configuration du routeur
  auditRouterConfig() {
    const routerPath = path.join(process.cwd(), 'src/router/index.js')
    
    if (!fs.existsSync(routerPath)) {
      this.addIssue('Fichier routeur non trouvé', 'critical')
      return
    }

    const content = fs.readFileSync(routerPath, 'utf-8')

    this.maxScore += 10

    // Vérifier les meta données par route
    if (content.includes('meta:')) {
      this.addPassed('Meta données par route configurées')
      this.addScore(5)
    } else {
      this.addIssue('Meta données par route manquantes', 'high')
      this.addRecommendation('Ajouter des meta données pour chaque route')
    }

    // Vérifier le scrollBehavior
    if (content.includes('scrollBehavior')) {
      this.addPassed('ScrollBehavior configuré')
      this.addScore(2)
    } else {
      this.addIssue('ScrollBehavior non configuré', 'low')
    }

    // Vérifier les guards de navigation
    if (content.includes('beforeEach')) {
      this.addPassed('Guards de navigation présents')
      this.addScore(3)
    } else {
      this.addIssue('Guards de navigation manquants', 'medium')
    }
  }

  // Vérifier la configuration Vite
  auditViteConfig() {
    const vitePath = path.join(process.cwd(), 'vite.config.js')
    
    if (!fs.existsSync(vitePath)) {
      this.addIssue('vite.config.js non trouvé', 'critical')
      return
    }

    const content = fs.readFileSync(vitePath, 'utf-8')
    this.maxScore += 8

    // Vérifier les plugins SEO
    if (content.includes('sitemapPlugin')) {
      this.addPassed('Plugin sitemap configuré')
      this.addScore(3)
    } else {
      this.addIssue('Plugin sitemap manquant', 'medium')
    }

    if (content.includes('robotsPlugin')) {
      this.addPassed('Plugin robots.txt configuré')
      this.addScore(2)
    } else {
      this.addIssue('Plugin robots.txt manquant', 'medium')
    }

    // Vérifier les optimisations de build
    if (content.includes('manualChunks')) {
      this.addPassed('Optimisation des chunks configurée')
      this.addScore(2)
    } else {
      this.addRecommendation('Configurer la séparation des chunks pour améliorer le chargement')
    }

    if (content.includes('assetsInlineLimit')) {
      this.addPassed('Limite d\'inline des assets configurée')
      this.addScore(1)
    }
  }

  // Méthodes utilitaires
  addIssue(message, severity) {
    this.results.issues.push({ message, severity })
  }

  addRecommendation(message) {
    this.results.recommendations.push(message)
  }

  addPassed(message) {
    this.results.passed.push(message)
  }

  addScore(points) {
    this.results.score += points
  }

  // Générer le rapport
  generateReport() {
    this.auditIndexHTML()
    this.auditSEOFiles()
    this.auditSEOImplementation()
    this.auditRouterConfig()
    this.auditViteConfig()

    const percentage = Math.round((this.results.score / this.maxScore) * 100)
    
    console.log('\n🔍 AUDIT SEO SKILLSWAP')
    console.log('========================')
    console.log(`📊 Score: ${this.results.score}/${this.maxScore} (${percentage}%)`)
    
    // Afficher le niveau
    let level = '🔴 Critique'
    if (percentage >= 90) level = '🟢 Excellent'
    else if (percentage >= 75) level = '🟡 Bon'
    else if (percentage >= 50) level = '🟠 Moyen'
    
    console.log(`📈 Niveau: ${level}`)

    // Afficher les réussites
    if (this.results.passed.length > 0) {
      console.log('\n✅ Points forts:')
      this.results.passed.forEach(item => console.log(`  • ${item}`))
    }

    // Afficher les problèmes par ordre de priorité
    if (this.results.issues.length > 0) {
      console.log('\n❌ Problèmes détectés:')
      
      const critical = this.results.issues.filter(i => i.severity === 'critical')
      const high = this.results.issues.filter(i => i.severity === 'high')
      const medium = this.results.issues.filter(i => i.severity === 'medium')
      const low = this.results.issues.filter(i => i.severity === 'low')

      if (critical.length > 0) {
        console.log('\n  🚨 CRITIQUE:')
        critical.forEach(issue => console.log(`    • ${issue.message}`))
      }

      if (high.length > 0) {
        console.log('\n  🔴 ÉLEVÉ:')
        high.forEach(issue => console.log(`    • ${issue.message}`))
      }

      if (medium.length > 0) {
        console.log('\n  🟡 MOYEN:')
        medium.forEach(issue => console.log(`    • ${issue.message}`))
      }

      if (low.length > 0) {
        console.log('\n  🟢 FAIBLE:')
        low.forEach(issue => console.log(`    • ${issue.message}`))
      }
    }

    // Afficher les recommandations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommandations:')
      this.results.recommendations.forEach(rec => console.log(`  • ${rec}`))
    }

    console.log('\n========================\n')

    return {
      score: this.results.score,
      maxScore: this.maxScore,
      percentage,
      level,
      issues: this.results.issues,
      recommendations: this.results.recommendations,
      passed: this.results.passed
    }
  }
}

// Exécuter l'audit
const auditor = new SEOAuditor()
const report = auditor.generateReport()

// Sauvegarder le rapport
const reportData = {
  timestamp: new Date().toISOString(),
  ...report
}

fs.writeFileSync(
  path.join(process.cwd(), 'seo-audit-report.json'),
  JSON.stringify(reportData, null, 2)
)

console.log('📄 Rapport sauvegardé dans seo-audit-report.json')

// Exit code basé sur le score
process.exit(report.percentage >= 75 ? 0 : 1)
