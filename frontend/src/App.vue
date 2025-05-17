<template>
  <router-view />
</template>


<script>
import Navbar from './components/Navbar.vue'
import { useRoute } from 'vue-router'

export default {
  components: { Navbar },
  setup() {
    const route = useRoute()
    const isAuthPage = route.path === '/login' || route.path === '/register'
    return { isAuthPage }
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
