<template>
  <div 
    ref="containerRef" 
    class="animated-background"
    :class="{ 'reduced-motion': prefersReducedMotion }"
  ></div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

export default {
  name: 'AnimatedBackground',
  setup() {
    const containerRef = ref(null)
    const prefersReducedMotion = ref(false)
    let scene, camera, renderer, particles
    let animationId = null

    // Vérifier les préférences d'accessibilité
    onMounted(() => {
      console.log('AnimatedBackground mounted') // Debug
      prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      console.log('Prefers reduced motion:', prefersReducedMotion.value) // Debug
    })

    const initThreeJS = () => {
      console.log('Initializing Three.js...') // Debug
      
      // Configuration de la scène
      scene = new THREE.Scene()
      
      // Configuration de la caméra
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.z = 5

      // Configuration du renderer
      renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0) // Transparent
      containerRef.value.appendChild(renderer.domElement)

      // Création des particules
      createParticles()
      
      // Démarrer l'animation
      animate()
    }

    const createParticles = () => {
      const particleCount = prefersReducedMotion.value ? 50 : 150
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      const sizes = new Float32Array(particleCount)

      // Couleurs du thème (converties en RGB 0-1)
      const themeColors = [
        { r: 244/255, g: 164/255, b: 116/255 }, // --accent: #F4A474
        { r: 232/255, g: 139/255, b: 90/255 },  // --accent-hover: #E88B5A
        { r: 212/255, g: 166/255, b: 101/255 }, // --accent-light: #D4A665
        { r: 226/255, g: 232/255, b: 240/255 }, // --text-primary: #e2e8f0
        { r: 203/255, g: 213/255, b: 224/255 }, // --text-secondary: #cbd5e0
      ]

      for (let i = 0; i < particleCount; i++) {
        // Position aléatoire
        positions[i * 3] = (Math.random() - 0.5) * 20
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10

        // Couleur aléatoire depuis le thème
        const color = themeColors[Math.floor(Math.random() * themeColors.length)]
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b

        // Taille aléatoire
        sizes[i] = Math.random() * 3 + 1
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

      // Shader personnalisé pour les particules
      const vertexShader = `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `

      const fragmentShader = `
        varying vec3 vColor;
        
        void main() {
          float r = distance(gl_PointCoord, vec2(0.5));
          if (r > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, r);
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      `

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
      })

      particles = new THREE.Points(geometry, material)
      scene.add(particles)
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Animation réduite si l'utilisateur préfère moins de mouvement
      const motionMultiplier = prefersReducedMotion.value ? 0.3 : 1.0

      // Animation des particules
      if (particles) {
        particles.rotation.x += 0.001 * motionMultiplier
        particles.rotation.y += 0.002 * motionMultiplier

        // Animation des positions
        const positions = particles.geometry.attributes.position.array
        const time = Date.now() * 0.001

        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + positions[i] * 0.1) * 0.001 * motionMultiplier
          positions[i] += Math.cos(time + positions[i + 1] * 0.1) * 0.001 * motionMultiplier
        }

        particles.geometry.attributes.position.needsUpdate = true
      }

      renderer.render(scene, camera)
    }

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }

    onMounted(() => {
      console.log('AnimatedBackground mounted - container check') // Debug
      if (containerRef.value) {
        console.log('Container found, initializing Three.js') // Debug
        initThreeJS()
        window.addEventListener('resize', handleResize)
      } else {
        console.error('Container not found!') // Debug
      }
    })

    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (renderer && containerRef.value && renderer.domElement) {
        containerRef.value.removeChild(renderer.domElement)
      }
      window.removeEventListener('resize', handleResize)
    })

    return {
      containerRef,
      prefersReducedMotion
    }
  }
}
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -999; /* Z-index plus bas pour être sûr */
  pointer-events: none;
  background: linear-gradient(
    135deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 100%
  );
}

.animated-background canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

/* Animation réduite pour l'accessibilité */
.reduced-motion canvas {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Dégradé de fallback pour les navigateurs ne supportant pas WebGL */
.animated-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(244, 164, 116, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(232, 139, 90, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(212, 166, 101, 0.05) 0%, transparent 50%);
  animation: backgroundPulse 8s ease-in-out infinite alternate;
}

@keyframes backgroundPulse {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.8;
  }
}

/* Arrêter l'animation si l'utilisateur préfère moins de mouvement */
@media (prefers-reduced-motion: reduce) {
  .animated-background::before {
    animation: none;
    opacity: 0.5;
  }
}
</style>
