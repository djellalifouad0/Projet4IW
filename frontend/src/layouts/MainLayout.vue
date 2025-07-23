<template>
  <div class="main-layout">
    <Navbar v-if="!isAuthPage && !isCartePage && !isDiscussionMobile" />
    <main class="main-content">
      <SearchBar v-if="!isAuthPage && !isCartePage && !isDiscussionMobile" v-model="search" @search="handleSearch" />
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

    const isAuthPage = computed(() => {
      return route.path === '/login' || route.path === '/register'
    })
    
    const isCartePage = computed(() => {
      return route.path === '/carte'
    })

    eventBus.on('discussion-mobile-chat-opened', () => {
      isDiscussionMobile.value = true
    })
    
    eventBus.on('discussion-mobile-chat-closed', () => {
      isDiscussionMobile.value = false
    })    // Debug: surveiller les changements de route
    watchEffect(() => {
      console.log('Route actuelle:', route.path)

      if (route.path !== '/discussions') {
        isDiscussionMobile.value = false
      }
    })

    const handleSearch = (searchQuery) => {


      console.log('Recherche lancée:', searchQuery)
    }

    return { 
      isAuthPage, 
      isCartePage, 
      isDiscussionMobile,
      search,
      handleSearch
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
  background: transparent; /* Rendre transparent pour voir le background animé */
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
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

