<template>
  <div class="main-layout">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
export default { components: { Navbar } }
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
  /* no margin-left! */
  min-width: 0;
  padding: 0;
}
</style>
