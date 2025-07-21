<template>
  <ErrorBoundary>
    <router-view />
    <ToastContainer />
  </ErrorBoundary>
</template>

<script>
import ErrorBoundary from './components/ErrorBoundary.vue'
import ToastContainer from './components/ToastContainer.vue'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  components: { 
    ErrorBoundary,
    ToastContainer
  },
  setup() {
    const route = useRoute()

    onMounted(() => {
      // première page déjà trackée par le script dans index.html
      // rien à faire ici pour la première page
    })

    watch(
      () => route.fullPath,
      (newPath) => {
        if (window._paq) {
          window._paq.push(['setCustomUrl', newPath])
          window._paq.push(['setDocumentTitle', document.title])
          window._paq.push(['trackPageView'])
        }
      }
    )
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
