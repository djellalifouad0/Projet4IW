<template>
  <div class="css-animated-background">
    <div class="floating-shapes">
      <div 
        v-for="(shape, index) in shapes" 
        :key="index"
        class="shape"
        :class="`shape-${shape.type}`"
        :style="{
          '--delay': shape.delay + 's',
          '--duration': shape.duration + 's',
          '--size': shape.size + 'px',
          '--color': shape.color,
          '--start-x': shape.startX + '%',
          '--end-x': shape.endX + '%',
          '--start-y': shape.startY + '%',
          '--end-y': shape.endY + '%',
        }"
      ></div>
    </div>
    
    <!-- Effet de grille lumineuse -->
    <div class="grid-overlay"></div>
    
    <!-- Effet de particules CSS -->
    <div class="css-particles">
      <div 
        v-for="n in 20" 
        :key="n"
        class="particle"
        :style="{
          '--delay': (n * 0.5) + 's',
          '--duration': (8 + Math.random() * 4) + 's',
          '--x': Math.random() * 100 + '%',
          '--y': Math.random() * 100 + '%',
        }"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'CSSAnimatedBackground',
  setup() {
    const shapes = ref([])

    const generateShapes = () => {
      const shapeTypes = ['circle', 'square', 'triangle']
      const colors = [
        'rgba(244, 164, 116, 0.3)', // --accent: #F4A474 plus opaque
        'rgba(232, 139, 90, 0.3)',  // --accent-hover: #E88B5A plus opaque
        'rgba(212, 166, 101, 0.3)', // --accent-light: #D4A665 plus opaque
        'rgba(226, 232, 240, 0.15)', // --text-primary: #e2e8f0 plus opaque
        'rgba(203, 213, 224, 0.15)', // --text-secondary: #cbd5e0 plus opaque
      ]

      const newShapes = []
      for (let i = 0; i < 15; i++) {
        newShapes.push({
          type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
          delay: Math.random() * 10,
          duration: 15 + Math.random() * 10,
          size: 20 + Math.random() * 80,
          color: colors[Math.floor(Math.random() * colors.length)],
          startX: Math.random() * 100,
          endX: Math.random() * 100,
          startY: Math.random() * 100,
          endY: Math.random() * 100,
        })
      }
      shapes.value = newShapes
    }

    onMounted(() => {
      console.log('=== CSS BACKGROUND MOUNTED ===')
      generateShapes()
    })

    return {
      shapes
    }
  }
}
</script>

<style scoped>
.css-animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -999; /* Z-index plus bas pour être sûr */
  pointer-events: none;
  overflow: hidden;
  /* Background plus visible avec couleurs fixes pour dark mode */
  background: linear-gradient(
    135deg,
    #0f1419 0%,
    #1a1f2e 30%,
    #242936 60%,
    #0f1419 100%
  );
}

/* Formes flottantes */
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: var(--color);
  animation: float var(--duration) ease-in-out infinite var(--delay);
  opacity: 0;
}

.shape-circle {
  border-radius: 50%;
  background: radial-gradient(circle, var(--color) 0%, transparent 70%);
}

.shape-square {
  border-radius: 4px;
  transform: rotate(45deg);
  background: linear-gradient(45deg, var(--color) 0%, transparent 70%);
}

.shape-triangle {
  width: 0;
  height: 0;
  background: transparent;
  border-left: calc(var(--size) / 2) solid transparent;
  border-right: calc(var(--size) / 2) solid transparent;
  border-bottom: var(--size) solid var(--color);
}

@keyframes float {
  0%, 100% {
    transform: translate(var(--start-x), var(--start-y)) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translate(var(--end-x), var(--end-y)) rotate(180deg);
    opacity: 0.8;
  }
  90% {
    opacity: 1;
  }
}

/* Grille lumineuse */
.grid-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(244, 164, 116, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(244, 164, 116, 0.08) 1px, transparent 1px);
  background-size: 100px 100px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(100px, 100px);
  }
}

/* Particules CSS */
.css-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #F4A474;
  border-radius: 50%;
  left: var(--x);
  top: var(--y);
  animation: particleFloat var(--duration) ease-in-out infinite var(--delay);
  opacity: 0;
  box-shadow: 0 0 8px #F4A474;
}

@keyframes particleFloat {
  0%, 100% {
    opacity: 0;
    transform: translateY(0px) scale(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-100px) scale(1);
  }
}

/* Effet de pulsation de fond */
.css-animated-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(244, 164, 116, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(232, 139, 90, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 30% 80%, rgba(212, 166, 101, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(226, 232, 240, 0.08) 0%, transparent 50%);
  animation: pulse 12s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Accessibilité - Réduire les animations */
@media (prefers-reduced-motion: reduce) {
  .shape,
  .particle,
  .grid-overlay,
  .css-animated-background::before {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
  
  .css-animated-background::before {
    opacity: 0.5;
    transform: none;
  }
}

/* Performance - Réduire les effets sur mobile */
@media (max-width: 768px) {
  .floating-shapes .shape:nth-child(n+8) {
    display: none;
  }
  
  .css-particles .particle:nth-child(n+10) {
    display: none;
  }
}
</style>
