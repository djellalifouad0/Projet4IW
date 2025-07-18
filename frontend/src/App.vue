<template>
  <ErrorBoundary>
    <router-view />
    <ToastContainer />
  </ErrorBoundary>
</template>

<script>
import ErrorBoundary from './components/ErrorBoundary.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useSEO } from './composables/useSEO.js'

export default {
  name: 'App',
  components: { 
    ErrorBoundary,
    ToastContainer
  },
  setup() {
    // Initialiser le SEO global
    const { setSEO } = useSEO()
    
    // Configuration SEO par défaut pour l'application
    setSEO()

    return {}
  }
}
</script>


<style>
.main-layout {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: #fefcf6;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0;
}
</style>
