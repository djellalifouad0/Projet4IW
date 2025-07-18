import { ref, computed } from 'vue'

export function useImageSEO() {
  
  // Fonction pour optimiser les attributs d'une image
  const optimizeImageAttributes = (src, alt, options = {}) => {
    const {
      title = alt,
      width = null,
      height = null,
      loading = 'lazy',
      decoding = 'async',
      sizes = null,
      srcset = null
    } = options

    return {
      src,
      alt: alt || 'Image SkillSwap',
      title: title || alt || 'Image SkillSwap',
      width,
      height,
      loading,
      decoding,
      sizes,
      srcset
    }
  }

  // Fonction pour générer des srcset responsive
  const generateResponsiveSrcset = (baseSrc, sizes = [320, 640, 1024, 1280]) => {
    if (!baseSrc) return null
    
    // Supposer que les images sont disponibles en différentes tailles
    const extension = baseSrc.split('.').pop()
    const nameWithoutExt = baseSrc.replace(`.${extension}`, '')
    
    return sizes
      .map(size => `${nameWithoutExt}-${size}w.${extension} ${size}w`)
      .join(', ')
  }

  // Fonction pour générer les sizes appropriées
  const generateSizes = (breakpoints = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw'
  }) => {
    return `(max-width: 768px) ${breakpoints.mobile}, (max-width: 1024px) ${breakpoints.tablet}, ${breakpoints.desktop}`
  }

  // Fonction pour optimiser les images d'avatar
  const optimizeAvatarImage = (src, userName, size = 'medium') => {
    const sizeMap = {
      small: { width: 40, height: 40 },
      medium: { width: 80, height: 80 },
      large: { width: 120, height: 120 }
    }

    const dimensions = sizeMap[size] || sizeMap.medium
    
    return optimizeImageAttributes(
      src || '/src/assets/images/default-avatar.png',
      `Photo de profil de ${userName || 'utilisateur'}`,
      {
        title: `Avatar de ${userName || 'utilisateur'}`,
        width: dimensions.width,
        height: dimensions.height,
        loading: size === 'small' ? 'eager' : 'lazy' // Charger immédiatement les petites images
      }
    )
  }

  // Fonction pour optimiser les images de posts
  const optimizePostImage = (src, postTitle, index = 0) => {
    return optimizeImageAttributes(
      src,
      `Image illustrant: ${postTitle}`,
      {
        title: postTitle,
        loading: index === 0 ? 'eager' : 'lazy', // Première image en eager
        sizes: generateSizes({
          mobile: '100vw',
          tablet: '80vw', 
          desktop: '60vw'
        })
      }
    )
  }

  // Fonction pour optimiser les images de compétences/catégories
  const optimizeSkillImage = (src, skillName) => {
    return optimizeImageAttributes(
      src,
      `Icône représentant la compétence: ${skillName}`,
      {
        title: `Compétence: ${skillName}`,
        width: 60,
        height: 60,
        loading: 'lazy'
      }
    )
  }

  // Fonction pour précharger les images critiques
  const preloadCriticalImages = (images = []) => {
    images.forEach(imageSrc => {
      if (imageSrc) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = imageSrc
        document.head.appendChild(link)
      }
    })
  }

  // Fonction pour lazy load avec intersection observer
  const setupLazyLoading = (imageElements) => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.classList.remove('lazy')
              img.classList.add('loaded')
              observer.unobserve(img)
            }
          }
        })
      })

      imageElements.forEach(img => imageObserver.observe(img))
    }
  }

  // Fonction pour valider les images pour le SEO
  const validateImageSEO = (img) => {
    const issues = []

    if (!img.alt || img.alt.trim() === '') {
      issues.push('Attribut alt manquant ou vide')
    }

    if (img.alt && img.alt.length > 125) {
      issues.push('Attribut alt trop long (max 125 caractères recommandé)')
    }

    if (!img.title) {
      issues.push('Attribut title manquant')
    }

    if (!img.width || !img.height) {
      issues.push('Dimensions width/height manquantes (peut causer du CLS)')
    }

    if (img.loading !== 'lazy' && img.loading !== 'eager') {
      issues.push('Attribut loading non optimisé')
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    }
  }

  // Composable pour une image responsive
  const useResponsiveImage = (src, alt, options = {}) => {
    const imageRef = ref(null)
    const isLoaded = ref(false)
    const hasError = ref(false)

    const imageAttributes = computed(() => 
      optimizeImageAttributes(src.value || src, alt.value || alt, options)
    )

    const onLoad = () => {
      isLoaded.value = true
    }

    const onError = () => {
      hasError.value = true
      console.warn(`Erreur de chargement d'image: ${src.value || src}`)
    }

    return {
      imageRef,
      imageAttributes,
      isLoaded,
      hasError,
      onLoad,
      onError
    }
  }

  return {
    optimizeImageAttributes,
    generateResponsiveSrcset,
    generateSizes,
    optimizeAvatarImage,
    optimizePostImage,
    optimizeSkillImage,
    preloadCriticalImages,
    setupLazyLoading,
    validateImageSEO,
    useResponsiveImage
  }
}
