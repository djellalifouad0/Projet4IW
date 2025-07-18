// Configuration SEO centralisée pour SkillSwap

export const SEO_CONFIG = {
  // Configuration de base
  site: {
    name: 'SkillSwap',
    url: 'https://skillswap.com',
    description: 'SkillSwap est la plateforme innovante pour échanger vos compétences avec d\'autres passionnés. Apprenez, enseignez et développez-vous professionnellement.',
    keywords: 'échange compétences, formation, apprentissage, partage savoir, plateforme éducative, skills, swap',
    author: 'SkillSwap',
    language: 'fr',
    locale: 'fr_FR',
    type: 'website'
  },

  // Images par défaut
  images: {
    logo: '/src/assets/images/SkillSwap Logo.png',
    defaultAvatar: '/src/assets/images/default-avatar.png',
    ogImage: '/src/assets/images/SkillSwap-og-image.png',
    favicon: '/src/assets/images/SkillSwap Logo.png'
  },

  // Réseaux sociaux
  social: {
    twitter: '@skillswap',
    facebook: 'https://facebook.com/skillswap',
    linkedin: 'https://linkedin.com/company/skillswap',
    instagram: 'https://instagram.com/skillswap'
  },

  // Configuration par page
  pages: {
    home: {
      title: 'SkillSwap - Accueil | Échangez vos compétences',
      description: 'Découvrez SkillSwap, la plateforme qui connecte les passionnés pour échanger des compétences. Rejoignez notre communauté d\'apprentissage collaboratif.',
      keywords: 'accueil skillswap, échange compétences, communauté apprentissage, plateforme skills',
      ogType: 'website',
      priority: '1.0',
      changefreq: 'daily'
    },
    dashboard: {
      title: 'Dashboard - SkillSwap | Gérez vos échanges',
      description: 'Accédez à votre tableau de bord SkillSwap. Suivez vos échanges de compétences, vos rendez-vous et votre progression.',
      keywords: 'dashboard, tableau de bord, gestion échanges, suivi compétences',
      priority: '0.8',
      changefreq: 'daily',
      noindex: false,
      requiresAuth: true
    },
    profile: {
      title: 'Profil - SkillSwap | Votre espace personnel',
      description: 'Gérez votre profil SkillSwap. Ajoutez vos compétences, consultez vos évaluations et personnalisez votre expérience.',
      keywords: 'profil utilisateur, compétences personnelles, évaluations, paramètres compte',
      ogType: 'profile',
      priority: '0.7',
      changefreq: 'weekly',
      requiresAuth: true
    },
    publicProfile: {
      title: 'Profil utilisateur - SkillSwap',
      description: 'Découvrez le profil d\'un membre de la communauté SkillSwap, ses compétences et ses évaluations.',
      keywords: 'profil public, compétences utilisateur, évaluations, membre communauté',
      ogType: 'profile',
      priority: '0.6',
      changefreq: 'weekly'
    },
    post: {
      title: 'Publication - SkillSwap',
      description: 'Découvrez cette publication sur SkillSwap et participez aux échanges de compétences.',
      keywords: 'publication, post, échange compétences, discussion, communauté',
      ogType: 'article',
      priority: '0.6',
      changefreq: 'weekly'
    },
    carte: {
      title: 'Carte - SkillSwap | Trouvez des experts près de vous',
      description: 'Explorez la carte interactive SkillSwap pour découvrir des experts et apprenants dans votre région.',
      keywords: 'carte interactive, experts locaux, géolocalisation, proximité compétences',
      priority: '0.7',
      changefreq: 'weekly'
    },
    discussions: {
      title: 'Discussions - SkillSwap | Communiquez avec la communauté',
      description: 'Participez aux discussions SkillSwap. Échangez avec d\'autres membres, posez vos questions et partagez vos expériences.',
      keywords: 'discussions, messagerie, communauté, échanges, communication',
      priority: '0.6',
      changefreq: 'daily',
      requiresAuth: true
    },
    notifications: {
      title: 'Notifications - SkillSwap | Restez informé',
      description: 'Consultez vos notifications SkillSwap. Ne manquez aucune opportunité d\'échange ou message important.',
      keywords: 'notifications, alertes, messages, mises à jour, informations',
      priority: '0.3',
      changefreq: 'daily',
      noindex: true,
      requiresAuth: true
    },
    settings: {
      title: 'Paramètres - SkillSwap | Personnalisez votre expérience',
      description: 'Configurez vos paramètres SkillSwap. Gérez vos préférences, votre confidentialité et vos notifications.',
      keywords: 'paramètres, configuration, préférences, confidentialité, notifications',
      priority: '0.3',
      changefreq: 'monthly',
      noindex: true,
      requiresAuth: true
    },
    login: {
      title: 'Connexion - SkillSwap | Accédez à votre compte',
      description: 'Connectez-vous à votre compte SkillSwap pour accéder à vos échanges de compétences et votre communauté.',
      keywords: 'connexion, login, accès compte, authentification',
      priority: '0.5',
      changefreq: 'monthly'
    },
    register: {
      title: 'Inscription - SkillSwap | Rejoignez la communauté',
      description: 'Inscrivez-vous sur SkillSwap et commencez à échanger vos compétences avec une communauté passionnée.',
      keywords: 'inscription, registration, nouveau compte, rejoindre communauté',
      priority: '0.5',
      changefreq: 'monthly'
    }
  },

  // Templates de données structurées
  structuredData: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SkillSwap",
      "url": "https://skillswap.com",
      "logo": "https://skillswap.com/src/assets/images/SkillSwap Logo.png",
      "description": "Plateforme d'échange de compétences permettant aux utilisateurs d'apprendre et d'enseigner diverses compétences",
      "foundingDate": "2024",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "contact@skillswap.com"
      }
    },
    
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SkillSwap",
      "url": "https://skillswap.com",
      "description": "Plateforme d'échange de compétences permettant aux utilisateurs d'apprendre et d'enseigner diverses compétences",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://skillswap.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  },

  // Configuration des robots
  robots: {
    allow: [
      '/',
      '/src/assets/images/',
      '/src/assets/styles/',
      '/*.css$',
      '/*.js$'
    ],
    disallow: [
      '/api/',
      '/admin/',
      '/*.json$',
      '/parametres',
      '/notifications'
    ],
    crawlDelay: 1,
    sitemap: 'https://skillswap.com/sitemap.xml'
  },

  // Configuration du sitemap
  sitemap: {
    baseUrl: 'https://skillswap.com',
    maxUrls: 50000,
    defaultChangefreq: 'weekly',
    defaultPriority: '0.5',
    excludePatterns: [
      '/parametres',
      '/notifications',
      '/api/*',
      '/admin/*'
    ]
  },

  // Optimisations techniques
  performance: {
    preloadImages: [
      '/src/assets/images/SkillSwap Logo.png'
    ],
    criticalCSS: true,
    lazyLoadImages: true,
    minifyHTML: true,
    compressImages: true
  },

  // Validation SEO
  validation: {
    titleMaxLength: 60,
    descriptionMaxLength: 160,
    keywordsMaxLength: 255,
    altTextMaxLength: 125,
    urlMaxLength: 75
  },

  // Analytics et suivi
  analytics: {
    googleAnalytics: '', // À remplir avec votre ID GA
    googleSearchConsole: '', // À remplir avec votre code GSC
    bingWebmaster: '', // À remplir avec votre code Bing
    hotjar: '' // À remplir avec votre ID Hotjar si utilisé
  }
}

// Fonction helper pour obtenir la configuration d'une page
export function getPageSEO(pageName, customData = {}) {
  const pageConfig = SEO_CONFIG.pages[pageName] || SEO_CONFIG.pages.home
  const siteConfig = SEO_CONFIG.site

  return {
    title: customData.title || pageConfig.title || siteConfig.name,
    description: customData.description || pageConfig.description || siteConfig.description,
    keywords: customData.keywords || pageConfig.keywords || siteConfig.keywords,
    ogType: customData.ogType || pageConfig.ogType || siteConfig.type,
    ogImage: customData.ogImage || siteConfig.url + SEO_CONFIG.images.ogImage,
    canonical: customData.canonical || siteConfig.url,
    noindex: customData.noindex || pageConfig.noindex || false,
    priority: pageConfig.priority || SEO_CONFIG.sitemap.defaultPriority,
    changefreq: pageConfig.changefreq || SEO_CONFIG.sitemap.defaultChangefreq
  }
}

// Fonction helper pour valider les données SEO
export function validateSEO(data) {
  const errors = []
  const warnings = []
  const config = SEO_CONFIG.validation

  if (!data.title) {
    errors.push('Title is required')
  } else if (data.title.length > config.titleMaxLength) {
    warnings.push(`Title too long (${data.title.length} chars, max ${config.titleMaxLength})`)
  }

  if (!data.description) {
    errors.push('Description is required')
  } else if (data.description.length > config.descriptionMaxLength) {
    warnings.push(`Description too long (${data.description.length} chars, max ${config.descriptionMaxLength})`)
  }

  if (data.keywords && data.keywords.length > config.keywordsMaxLength) {
    warnings.push(`Keywords too long (${data.keywords.length} chars, max ${config.keywordsMaxLength})`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export default SEO_CONFIG
