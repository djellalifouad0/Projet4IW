// Service pour la gestion des données structurées et SEO avancé

export class SEOService {
  static baseUrl = 'https://skillswap.com'
  
  // Données structurées pour l'organisation
  static getOrganizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SkillSwap",
      "url": this.baseUrl,
      "logo": `${this.baseUrl}/src/assets/images/SkillSwap Logo.png`,
      "description": "Plateforme d'échange de compétences permettant aux utilisateurs d'apprendre et d'enseigner diverses compétences",
      "foundingDate": "2024",
      "sameAs": [
        "https://facebook.com/skillswap",
        "https://twitter.com/skillswap",
        "https://linkedin.com/company/skillswap"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "contact@skillswap.com"
      }
    }
  }

  // Données structurées pour un profil utilisateur
  static getPersonSchema(user) {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": user.name,
      "url": `${this.baseUrl}/profile/${user.profileToken}`,
      "image": user.avatar || `${this.baseUrl}/src/assets/images/default-avatar.png`,
      "description": user.bio || `Membre de la communauté SkillSwap`,
      "knowsAbout": user.skills?.map(skill => skill.name) || [],
      "memberOf": {
        "@type": "Organization",
        "name": "SkillSwap"
      }
    }
  }

  // Données structurées pour un post/article
  static getArticleSchema(post) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.content?.substring(0, 160) || "",
      "image": post.image || `${this.baseUrl}/src/assets/images/SkillSwap Logo.png`,
      "author": {
        "@type": "Person",
        "name": post.author?.name || "SkillSwap User"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SkillSwap",
        "logo": {
          "@type": "ImageObject",
          "url": `${this.baseUrl}/src/assets/images/SkillSwap Logo.png`
        }
      },
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt || post.createdAt,
      "url": `${this.baseUrl}/post/${post.id}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${this.baseUrl}/post/${post.id}`
      }
    }
  }

  // Données structurées pour une compétence
  static getSkillSchema(skill) {
    return {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": skill.name,
      "description": skill.description || `Compétence disponible sur SkillSwap`,
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "Compétences SkillSwap",
        "description": "Ensemble des compétences disponibles sur la plateforme SkillSwap"
      }
    }
  }

  // Données structurées pour la page d'accueil
  static getWebsiteSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SkillSwap",
      "url": this.baseUrl,
      "description": "Plateforme d'échange de compétences permettant aux utilisateurs d'apprendre et d'enseigner diverses compétences",
      "publisher": this.getOrganizationSchema(),
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${this.baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    }
  }

  // Données structurées pour une évaluation
  static getRatingSchema(rating) {
    return {
      "@context": "https://schema.org",
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": rating.score,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": rating.author?.name || "Utilisateur SkillSwap"
      },
      "reviewBody": rating.comment || "",
      "datePublished": rating.createdAt,
      "itemReviewed": {
        "@type": "Person",
        "name": rating.target?.name || "Utilisateur SkillSwap"
      }
    }
  }

  // Générer des meta tags Open Graph personnalisés
  static generateOGTags(data) {
    return {
      'og:title': data.title,
      'og:description': data.description,
      'og:image': data.image || `${this.baseUrl}/src/assets/images/SkillSwap Logo.png`,
      'og:url': data.url || this.baseUrl,
      'og:type': data.type || 'website',
      'og:site_name': 'SkillSwap',
      'og:locale': 'fr_FR'
    }
  }

  // Générer des meta tags Twitter Card
  static generateTwitterTags(data) {
    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': data.title,
      'twitter:description': data.description,
      'twitter:image': data.image || `${this.baseUrl}/src/assets/images/SkillSwap Logo.png`,
      'twitter:url': data.url || this.baseUrl,
      'twitter:site': '@skillswap'
    }
  }

  // Optimiser les images pour le SEO
  static optimizeImageForSEO(imageSrc, alt, title) {
    return {
      src: imageSrc,
      alt: alt || 'Image SkillSwap',
      title: title || alt || 'Image SkillSwap',
      loading: 'lazy',
      decoding: 'async'
    }
  }

  // Générer un slug SEO-friendly
  static generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
      .trim('-') // Supprimer les tirets en début/fin
  }

  // Valider une URL pour le SEO
  static validateSEOUrl(url) {
    const seoRules = {
      maxLength: 75,
      hasProtocol: true,
      noSpecialChars: true,
      readable: true
    }

    const issues = []

    if (url.length > seoRules.maxLength) {
      issues.push(`URL trop longue (${url.length} caractères, maximum recommandé: ${seoRules.maxLength})`)
    }

    if (!url.match(/^https?:\/\//)) {
      issues.push('URL doit commencer par http:// ou https://')
    }

    if (url.match(/[^a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]/)) {
      issues.push('URL contient des caractères spéciaux non recommandés')
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    }
  }
}
