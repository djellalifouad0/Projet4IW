<template>
  <component 
    :is="currentBackgroundComponent" 
    v-if="backgroundEnabled && currentBackgroundComponent"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import AnimatedBackground from './AnimatedBackground.vue'
import CSSAnimatedBackground from './CSSAnimatedBackground.vue'
import LightAnimatedBackground from './LightAnimatedBackground.vue'

export default {
  name: 'BackgroundManager',
  components: {
    AnimatedBackground,
    CSSAnimatedBackground,
    LightAnimatedBackground
  },
  setup() {
    const backgroundType = ref('css') // Par défaut CSS car plus stable
    const backgroundEnabled = ref(true)
    const supportsWebGL = ref(true)
    const isDarkTheme = ref(false)

    // Détecter si le thème dark est actif
    const detectDarkTheme = () => {
      // Vérifier si la classe dark-theme est présente
      const hasClass = document.documentElement.classList.contains('dark-theme')
      
      console.log('=== THEME DETECTION ===')
      console.log('documentElement classes:', document.documentElement.className)
      console.log('has dark-theme class:', hasClass)
      console.log('CSS --bg-primary:', getComputedStyle(document.documentElement).getPropertyValue('--bg-primary'))
      
      // Pour l'instant, on active si la classe est présente
      isDarkTheme.value = hasClass
      console.log('isDarkTheme final:', isDarkTheme.value)
      console.log('========================')
    }

    // Détecter le support WebGL
    const detectWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        supportsWebGL.value = !!gl
      } catch (e) {
        supportsWebGL.value = false
      }
    }

    // Détecter les performances de l'appareil
    const detectDevicePerformance = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      
      if (prefersReducedMotion) {
        backgroundEnabled.value = false
      } else if (isMobile || isLowEnd || !supportsWebGL.value) {
        backgroundType.value = 'css'
      } else {
        backgroundType.value = 'css' // Utiliser CSS par défaut car plus stable
      }
    }

    const currentBackgroundComponent = computed(() => {
      console.log('COMPUTED currentBackgroundComponent:', {
        backgroundEnabled: backgroundEnabled.value,
        isDarkTheme: isDarkTheme.value,
        backgroundType: backgroundType.value,
        supportsWebGL: supportsWebGL.value
      })
      
      if (!backgroundEnabled.value) {
        console.log('Returning null because backgroundEnabled is false')
        return null
      }
      
      let component = null
      switch (backgroundType.value) {
        case 'three':
          component = supportsWebGL.value ? 'AnimatedBackground' : 'CSSAnimatedBackground'
          break
        case 'css':
          // Utiliser CSSAnimatedBackground pour dark mode, LightAnimatedBackground pour light mode
          component = isDarkTheme.value ? 'CSSAnimatedBackground' : 'LightAnimatedBackground'
          break
        default:
          component = null
      }
      
      console.log('Returning component:', component)
      return component
    })

    // Méthodes pour changer le type de background (utile pour les préférences utilisateur)
    const setBackgroundType = (type) => {
      backgroundType.value = type
      localStorage.setItem('background-preference', type)
    }

    const toggleBackground = () => {
      backgroundEnabled.value = !backgroundEnabled.value
      localStorage.setItem('background-enabled', backgroundEnabled.value.toString())
    }

    onMounted(() => {
      console.log('BackgroundManager mounted') // Debug
      
      detectWebGLSupport()
      detectDarkTheme() // Détecter le thème initial
      console.log('WebGL support:', supportsWebGL.value) // Debug
      
      // Charger les préférences utilisateur
      const savedType = localStorage.getItem('background-preference')
      const savedEnabled = localStorage.getItem('background-enabled')
      
      console.log('Saved preferences:', { savedType, savedEnabled }) // Debug
      
      if (savedEnabled !== null) {
        backgroundEnabled.value = savedEnabled === 'true'
      }
      
      if (savedType && ['three', 'css', 'none'].includes(savedType)) {
        backgroundType.value = savedType
      } else {
        detectDevicePerformance()
      }
      
      console.log('Final settings:', { 
        enabled: backgroundEnabled.value, 
        type: backgroundType.value,
        darkTheme: isDarkTheme.value,
        component: currentBackgroundComponent.value 
      }) // Debug

      // Observer les changements de classe sur le document pour détecter les changements de thème
      const observer = new MutationObserver(() => {
        const oldValue = isDarkTheme.value
        detectDarkTheme()
        if (oldValue !== isDarkTheme.value) {
          console.log('Theme changed to:', isDarkTheme.value ? 'dark' : 'light')
        }
      })
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
      
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      })

      // Écouter les changements de préférences
      window.addEventListener('background-preference-changed', (event) => {
        const { enabled, type } = event.detail
        backgroundEnabled.value = enabled
        backgroundType.value = type
      })
    })

    return {
      backgroundType,
      backgroundEnabled,
      currentBackgroundComponent,
      isDarkTheme,
      setBackgroundType,
      toggleBackground,
      supportsWebGL
    }
  }
}
</script>

<style scoped>
/* Pas de styles nécessaires, ce composant est juste un gestionnaire */
</style>
