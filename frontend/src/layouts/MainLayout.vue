<template>
  <div class="main-layout">
    <Navbar v-if="!isAuthPage && !isCartePage && !isDiscussionMobile" />
    <main class="main-content">
      <SearchBar v-if="!isAuthPage && !isCartePage && !isDiscussionMobile" v-model="search" />
      <ErrorBoundary>
        <router-view />
      </ErrorBoundary>
    </main>
  </div>
</template>

<script>
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import SearchBar from '../components/SearchBar.vue'
import ErrorBoundary from '../components/ErrorBoundary.vue'
import eventBus from '../services/eventBus'

export default {
  name: 'MainLayout',
  components: { 
    Navbar, 
    SearchBar, 
    ErrorBoundary 
  },
  setup() {
    const route = useRoute()
    const search = ref('')
    const isDiscussionMobile = ref(false)
    
    // Computed properties pour détecter les pages spéciales
    const isAuthPage = computed(() => {
      return route.path === '/login' || route.path === '/register'
    })
    
    const isCartePage = computed(() => {
      return route.path === '/carte'
    })

    // Écouter les événements de chat mobile
    eventBus.on('discussion-mobile-chat-opened', () => {
      isDiscussionMobile.value = true
    })
    
    eventBus.on('discussion-mobile-chat-closed', () => {
      isDiscussionMobile.value = false
    })

    // Debug: surveiller les changements de route
    watchEffect(() => {
      console.log('Route actuelle:', route.path)
      // Reset l'état mobile si on quitte les discussions
      if (route.path !== '/discussions') {
        isDiscussionMobile.value = false
      }
    })

    return { 
      isAuthPage, 
      isCartePage, 
      isDiscussionMobile,
      search
    }
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: row;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-primary);
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
  transition: background-color 0.3s ease;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0;
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;
}
</style>
