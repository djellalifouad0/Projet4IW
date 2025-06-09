<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />
    <div v-else class="error-message">
      <h2>Une erreur s'est produite</h2>
      <p>{{ errorMessage }}</p>
      <button @click="resetError" class="retry-btn">Réessayer</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorBoundary',
  data() {
    return {
      hasError: false,
      errorMessage: ''
    }
  },
  errorCaptured(err, vm, info) {
    this.hasError = true
    this.errorMessage = err.message || 'Erreur inconnue'
    console.error('ErrorBoundary a capturé une erreur:', err, info)
    return false // Empêche la propagation de l'erreur
  },
  methods: {
    resetError() {
      this.hasError = false
      this.errorMessage = ''
    }
  },
  watch: {
    '$route'() {
      // Réinitialiser l'erreur lors d'un changement de route
      if (this.hasError) {
        this.resetError()
      }
    }
  }
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  text-align: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin: 20px;
}

.error-message h2 {
  color: #dc2626;
  margin-bottom: 16px;
}

.error-message p {
  color: #6b7280;
  margin-bottom: 24px;
  max-width: 500px;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #b91c1c;
}
</style>
