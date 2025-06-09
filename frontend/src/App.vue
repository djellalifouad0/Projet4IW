<template>
  <ErrorBoundary>
    <router-view />
    <ToastContainer />
  </ErrorBoundary>
</template>

<script>
import ErrorBoundary from './components/ErrorBoundary.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useTheme } from './composables/useTheme'
import { onMounted } from 'vue'

export default {
  name: 'App',
  components: { 
    ErrorBoundary,
    ToastContainer
  },
  setup() {
    const { initTheme } = useTheme()
    
    onMounted(() => {
      initTheme()
    })
    
    return {}
  }
}
</script>


<style>
.main-layout {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0;
}
</style>
