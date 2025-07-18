import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SEO_CONFIG, getPageSEO, validateSEO } from '../config/seo.config.js'

export function useSEO() {
  const route = useRoute()
  
  // État réactif du SEO
  const seoData = ref({ ...SEO_CONFIG.site })

  // Fonction pour mettre à jour les meta tags
  const updateMetaTags = (seo) => {
    // Valider les données SEO
    const validation = validateSEO(seo)
    if (!validation.isValid) {
      console.warn('SEO validation errors:', validation.errors)
    }
    if (validation.warnings.length > 0) {
      console.warn('SEO validation warnings:', validation.warnings)
    }

    // Title
    document.title = seo.title || SEO_CONFIG.site.name

    // Description
    updateMetaTag('name', 'description', seo.description || SEO_CONFIG.site.description)
    updateMetaTag('property', 'og:description', seo.description || SEO_CONFIG.site.description)
    updateMetaTag('property', 'twitter:description', seo.description || SEO_CONFIG.site.description)

    // Keywords
    updateMetaTag('name', 'keywords', seo.keywords || SEO_CONFIG.site.keywords)

    // Robots
    const robotsContent = seo.noindex ? 'noindex, nofollow' : 'index, follow'
    updateMetaTag('name', 'robots', robotsContent)

    // Open Graph
    updateMetaTag('property', 'og:title', seo.title || SEO_CONFIG.site.name)
    updateMetaTag('property', 'og:image', seo.ogImage || SEO_CONFIG.site.url + SEO_CONFIG.images.ogImage)
    updateMetaTag('property', 'og:type', seo.ogType || SEO_CONFIG.site.type)
    updateMetaTag('property', 'og:url', seo.canonical || SEO_CONFIG.site.url + route.path)
    updateMetaTag('property', 'og:site_name', SEO_CONFIG.site.name)
    updateMetaTag('property', 'og:locale', SEO_CONFIG.site.locale)

    // Twitter
    updateMetaTag('property', 'twitter:card', 'summary_large_image')
    updateMetaTag('property', 'twitter:title', seo.title || SEO_CONFIG.site.name)
    updateMetaTag('property', 'twitter:image', seo.ogImage || SEO_CONFIG.site.url + SEO_CONFIG.images.ogImage)
    updateMetaTag('property', 'twitter:url', seo.canonical || SEO_CONFIG.site.url + route.path)
    updateMetaTag('property', 'twitter:site', SEO_CONFIG.social.twitter)

    // Language
    updateMetaTag('name', 'language', SEO_CONFIG.site.language)
    updateMetaTag('http-equiv', 'content-language', SEO_CONFIG.site.locale)

    // Author
    updateMetaTag('name', 'author', SEO_CONFIG.site.author)

    // Canonical
    updateCanonicalLink(seo.canonical || SEO_CONFIG.site.url + route.path)

    // Ajouter les données structurées de base
    addStructuredData(SEO_CONFIG.structuredData.organization)
    if (route.path === '/') {
      addStructuredData(SEO_CONFIG.structuredData.website)
    }
  }

  // Fonction utilitaire pour mettre à jour un meta tag
  const updateMetaTag = (attribute, attributeValue, content) => {
    if (!content) return

    let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, attributeValue)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  // Fonction pour mettre à jour le lien canonical
  const updateCanonicalLink = (href) => {
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', href)
  }

  // Fonction pour ajouter des données structurées
  const addStructuredData = (data) => {
    // Supprimer l'ancien script s'il existe avec le même type
    const existingScript = document.querySelector(`script[type="application/ld+json"][data-schema="${data['@type']}"]`)
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-schema', data['@type'])
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  // Fonction pour définir le SEO d'une page
  const setSEO = (customSEO = {}) => {
    // Déterminer le nom de la page basé sur la route
    let pageName = 'home'
    
    if (route.path === '/dashboard') pageName = 'dashboard'
    else if (route.path === '/profile') pageName = 'profile'
    else if (route.path.startsWith('/profile/')) pageName = 'publicProfile'
    else if (route.path.startsWith('/post/')) pageName = 'post'
    else if (route.path === '/carte') pageName = 'carte'
    else if (route.path === '/discussions') pageName = 'discussions'
    else if (route.path === '/notifications') pageName = 'notifications'
    else if (route.path === '/parametres') pageName = 'settings'
    else if (route.path === '/login') pageName = 'login'
    else if (route.path === '/register') pageName = 'register'

    const pageConfig = getPageSEO(pageName, customSEO)
    seoData.value = pageConfig
    updateMetaTags(pageConfig)
  }

  // Fonction pour définir le SEO dynamique (pour les pages avec paramètres)
  const setDynamicSEO = (title, description, keywords = '', ogImage = null, additionalData = {}) => {
    const dynamicSEO = {
      title: title.includes('SkillSwap') ? title : `${title} - SkillSwap`,
      description,
      keywords: keywords || SEO_CONFIG.site.keywords,
      ogImage: ogImage || SEO_CONFIG.site.url + SEO_CONFIG.images.ogImage,
      ...additionalData
    }

    setSEO(dynamicSEO)
  }

  // Fonction pour SEO d'un profil utilisateur
  const setProfileSEO = (user) => {
    if (!user) return

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": user.name,
      "url": `${SEO_CONFIG.site.url}/profile/${user.profileToken}`,
      "image": user.avatar || SEO_CONFIG.site.url + SEO_CONFIG.images.defaultAvatar,
      "description": user.bio || `Membre de la communauté SkillSwap`,
      "knowsAbout": user.skills?.map(skill => skill.name) || [],
      "memberOf": {
        "@type": "Organization",
        "name": "SkillSwap"
      }
    }

    setDynamicSEO(
      `Profil de ${user.name}`,
      user.bio || `Découvrez le profil de ${user.name} sur SkillSwap et ses compétences.`,
      `${user.name}, profil, compétences, ${user.skills?.map(s => s.name).join(', ') || ''}`,
      user.avatar,
      {
        ogType: 'profile',
        canonical: `${SEO_CONFIG.site.url}/profile/${user.profileToken}`
      }
    )

    addStructuredData(structuredData)
  }

  // Fonction pour SEO d'un post
  const setPostSEO = (post) => {
    if (!post) return

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.content?.substring(0, 160) || "",
      "image": post.image || SEO_CONFIG.site.url + SEO_CONFIG.images.ogImage,
      "author": {
        "@type": "Person",
        "name": post.author?.name || "Membre SkillSwap"
      },
      "publisher": SEO_CONFIG.structuredData.organization,
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt || post.createdAt,
      "url": `${SEO_CONFIG.site.url}/post/${post.id}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${SEO_CONFIG.site.url}/post/${post.id}`
      }
    }

    setDynamicSEO(
      post.title,
      post.content?.substring(0, 160) || `Découvrez cette publication sur SkillSwap.`,
      `${post.title}, publication, échange compétences, ${post.author?.name || ''}`,
      post.image,
      {
        ogType: 'article',
        canonical: `${SEO_CONFIG.site.url}/post/${post.id}`
      }
    )

    addStructuredData(structuredData)
  }

  // Précharger les images critiques
  const preloadCriticalImages = () => {
    SEO_CONFIG.performance.preloadImages.forEach(imageSrc => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = SEO_CONFIG.site.url + imageSrc
      document.head.appendChild(link)
    })
  }

  // Watcher pour les changements de route
  watch(() => route.path, () => {
    setSEO()
  }, { immediate: true })

  onMounted(() => {
    setSEO()
    preloadCriticalImages()
  })

  return {
    seoData,
    setSEO,
    setDynamicSEO,
    setProfileSEO,
    setPostSEO,
    addStructuredData,
    updateMetaTags,
    SEO_CONFIG
  }
}
