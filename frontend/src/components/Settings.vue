<template>
  <div class="settings-content">
    <h1 class="settings-title">Paramètres</h1>
    <form class="settings-form">
      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input id="username" v-model="username" type="text" />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" />
      </div>
      <div class="form-group">
        <label for="password">Nouveau mot de passe</label>
        <input id="password" v-model="password" type="password" />
      </div>
      <div class="form-group theme-group">
        <label>Thème de l'application</label>
        <ThemeToggle />
      </div>
      <button type="button" class="settings-btn" @click="saveSettings">Enregistrer</button>
    </form>
  </div>
</template>

<script>
import ThemeToggle from './ThemeToggle.vue'

export default {
  name: 'Settings',
  components: {
    ThemeToggle
  },
  data() {
    return {
      username: '',
      email: '',
      password: ''
    }
  },
  methods: {
    saveSettings() {
      // Logique d'enregistrement à compléter
      alert('Paramètres enregistrés !');
    }
  }
}
</script>

<style scoped>
.settings-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem 1rem 2.2rem 1rem;
  background: var(--bg-primary);
  width: 700px;
  max-width: 100%;
  margin: 0 auto;
  transition: background-color 0.3s ease;
}
.settings-title {
  font-size: 2.1rem;
  color: var(--accent);
  margin-bottom: 0.7rem;
  font-weight: bold;
  transition: color 0.3s ease;
}
.settings-form {
  background: var(--card-bg);
  border-radius: 14px;
  box-shadow: var(--shadow);
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: background-color 0.3s ease;
}
.form-group label {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.4rem;
  display: block;
  transition: color 0.3s ease;
}
.form-group input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1.5px solid var(--input-border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-primary);
  margin-top: 0.2rem;
  transition: border 0.18s, background-color 0.3s ease, color 0.3s ease;
}
.form-group input:focus {
  border-color: var(--input-focus);
  outline: none;
}
.theme-group {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.settings-btn {
  background: var(--accent);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1.08rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  margin-top: 1rem;
}
.settings-btn:hover {
  background: var(--primary-light);
  color: var(--text-primary);
}
@media (max-width: 700px) {
  .settings-form {
    padding: 1.2rem 0.7rem;
    min-width: 0;
    max-width: 100%;
  }
}
</style>
