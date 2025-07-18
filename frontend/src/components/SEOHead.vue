<template>
  <!-- Ce composant n'a pas de rendu visuel, il gère seulement les meta tags -->
</template>

<script>
import { watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'SEOHead',
  props: {
    title: {
      type: String,
      default: 'SkillSwap - Plateforme d\'échange de compétences'
    },
    description: {
      type: String,
      default: 'SkillSwap est la plateforme innovante pour échanger vos compétences avec d\'autres passionnés. Apprenez, enseignez et développez-vous professionnellement.'
    },
    keywords: {
      type: String,
      default: 'échange compétences, formation, apprentissage, partage savoir, plateforme éducative, skills, swap'
    },
    ogImage: {
      type: String,
      default: '/src/assets/images/SkillSwap Logo.png'
    },
    ogType: {
      type: String,
      default: 'website'
    },
    canonical: {
      type: String,
      default: null
    },
    noindex: {
      type: Boolean,
      default: false
    },
    structuredData: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const originalTitle = document.title
    const addedElements = []

    const updateMetaTag = (attribute, attributeValue, content) => {
      if (!content) return

      let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, attributeValue)
        document.head.appendChild(element)
        addedElements.push(element)
      }
      element.setAttribute('content', content)
    }

    const updateCanonicalLink = (href) => {
      if (!href) return

      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
        addedElements.push(canonical)
      }
      canonical.setAttribute('href', href)
    }

    const addStructuredData = (data) => {
      if (!data) return

      const existingScript = document.querySelector('script[type="application/ld+json"][data-seo-component]')
      if (existingScript) {
        existingScript.remove()
      }

      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-seo-component', 'true')
      script.textContent = JSON.stringify(data)
      document.head.appendChild(script)
      addedElements.push(script)
    }

    const updateSEO = () => {
      // Title
      document.title = props.title

      // Description
      updateMetaTag('name', 'description', props.description)
      updateMetaTag('property', 'og:description', props.description)
      updateMetaTag('property', 'twitter:description', props.description)

      // Keywords
      updateMetaTag('name', 'keywords', props.keywords)

      // Robots
      const robotsContent = props.noindex ? 'noindex, nofollow' : 'index, follow'
      updateMetaTag('name', 'robots', robotsContent)

      // Open Graph
      updateMetaTag('property', 'og:title', props.title)
      updateMetaTag('property', 'og:image', props.ogImage)
      updateMetaTag('property', 'og:type', props.ogType)
      if (props.canonical) {
        updateMetaTag('property', 'og:url', props.canonical)
      }

      // Twitter
      updateMetaTag('property', 'twitter:title', props.title)
      updateMetaTag('property', 'twitter:image', props.ogImage)
      if (props.canonical) {
        updateMetaTag('property', 'twitter:url', props.canonical)
      }

      // Canonical
      if (props.canonical) {
        updateCanonicalLink(props.canonical)
      }

      // Structured Data
      if (props.structuredData) {
        addStructuredData(props.structuredData)
      }
    }

    // Watchers pour les props
    watch(() => props.title, updateSEO)
    watch(() => props.description, updateSEO)
    watch(() => props.keywords, updateSEO)
    watch(() => props.ogImage, updateSEO)
    watch(() => props.canonical, updateSEO)
    watch(() => props.structuredData, updateSEO, { deep: true })

    onMounted(() => {
      updateSEO()
    })

    onUnmounted(() => {
      // Restaurer le titre original
      document.title = originalTitle
      
      // Supprimer les éléments ajoutés par ce composant
      addedElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element)
        }
      })
    })

    return {}
  }
}
</script>
