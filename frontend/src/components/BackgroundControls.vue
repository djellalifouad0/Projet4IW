<template>
  <div class="background-controls">
    <h3>Arrière-plan animé</h3>
    
    <div class="control-group">
      <label class="toggle-switch">
        <input 
          type="checkbox" 
          v-model="isEnabled"
          @change="handleToggle"
        >
        <span class="slider"></span>
        <span class="label-text">Activer l'arrière-plan animé</span>
      </label>
    </div>

    <div v-if="isEnabled" class="control-group">
      <label>Type d'animation :</label>
      <div class="radio-group">
        <label class="radio-option">
          <input 
            type="radio" 
            value="three" 
            v-model="backgroundType"
            @change="handleTypeChange"
            :disabled="!supportsWebGL"
          >
          <span class="radio-label">
            3D Avancé (Three.js)
            <small v-if="!supportsWebGL" class="warning">Non supporté par votre navigateur</small>
          </span>
        </label>
        
        <label class="radio-option">
          <input 
            type="radio" 
            value="css" 
            v-model="backgroundType"
            @change="handleTypeChange"
          >
          <span class="radio-label">
            CSS Léger
            <small>Recommandé pour les appareils mobiles</small>
          </span>
        </label>
      </div>
    </div>

    <div class="performance-info">
      <small>
        <strong>Info :</strong> L'animation s'adapte automatiquement à votre appareil.
        Les animations sont réduites si vous avez activé "Réduire les mouvements" dans votre système.
      </small>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'

export default {
  name: 'BackgroundControls',
  setup() {
    const backgroundManager = inject('backgroundManager', null)
    
    const isEnabled = ref(true)
    const backgroundType = ref('three')
    const supportsWebGL = ref(true)

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

    const handleToggle = () => {
      localStorage.setItem('background-enabled', isEnabled.value.toString())
      // Émettre un événement personnalisé pour notifier le BackgroundManager
      window.dispatchEvent(new CustomEvent('background-preference-changed', {
        detail: { enabled: isEnabled.value, type: backgroundType.value }
      }))
    }

    const handleTypeChange = () => {
      localStorage.setItem('background-preference', backgroundType.value)
      window.dispatchEvent(new CustomEvent('background-preference-changed', {
        detail: { enabled: isEnabled.value, type: backgroundType.value }
      }))
    }

    onMounted(() => {
      detectWebGLSupport()
      
      // Charger les préférences sauvegardées
      const savedEnabled = localStorage.getItem('background-enabled')
      const savedType = localStorage.getItem('background-preference')
      
      if (savedEnabled !== null) {
        isEnabled.value = savedEnabled === 'true'
      }
      
      if (savedType && ['three', 'css'].includes(savedType)) {
        backgroundType.value = savedType
      } else if (!supportsWebGL.value) {
        backgroundType.value = 'css'
      }
    })

    return {
      isEnabled,
      backgroundType,
      supportsWebGL,
      handleToggle,
      handleTypeChange
    }
  }
}
</script>

<style scoped>
.background-controls {
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.background-controls h3 {
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-size: 1.1rem;
}

.control-group {
  margin-bottom: 16px;
}

.control-group label {
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

/* Toggle Switch */
.toggle-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0 !important;
}

.toggle-switch input {
  display: none;
}

.slider {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: 24px;
  transition: background 0.3s ease;
  margin-right: 12px;
}

.slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--text-muted);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch input:checked + .slider {
  background: var(--accent);
}

.toggle-switch input:checked + .slider::before {
  transform: translateX(24px);
  background: white;
}

.label-text {
  color: var(--text-primary);
  font-weight: normal;
}

/* Radio Group */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  margin-bottom: 0 !important;
}

.radio-option input {
  margin: 4px 12px 0 0;
  accent-color: var(--accent);
}

.radio-option input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.radio-option:has(input:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

.radio-label {
  color: var(--text-primary);
  font-weight: normal;
  display: flex;
  flex-direction: column;
}

.radio-label small {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 2px;
}

.radio-label small.warning {
  color: var(--warning);
}

/* Performance Info */
.performance-info {
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 3px solid var(--accent);
}

.performance-info small {
  color: var(--text-tertiary);
  line-height: 1.4;
}

.performance-info strong {
  color: var(--accent);
}
</style>
