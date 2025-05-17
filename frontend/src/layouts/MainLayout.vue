<template>
  <div class="main-layout">
    <Navbar v-if="!isAuthPage" />
    <main class="main-content">
      <SearchBar v-if="!isAuthPage" v-model="search" />
      <router-view />
    </main>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import SearchBar from '../components/SearchBar.vue'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

export default {
  components: { Navbar, SearchBar },
  setup() {
    const route = useRoute()
    // Détecte si on est sur une page d'authentification
    const isAuthPage = computed(() =>
      route.path === '/login' || route.path === '/register'
    )
    const search = ref('')
    return { isAuthPage, search }
  }
}
</script>

<style scoped>
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
