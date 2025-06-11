<template>
  <div class="settings-content">
    <h1 class="settings-title">Paramètres</h1>
    
    <!-- Section Apparence -->
    <div class="settings-section">
      <h2 class="section-title">Apparence</h2>
      <div class="settings-card">
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Mode sombre</label>
            <p class="setting-description">Activez le mode sombre pour une expérience plus confortable la nuit</p>
          </div>
          <div class="setting-control">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>

    <!-- Section Compte -->
    <div class="settings-section">
      <h2 class="section-title">Compte</h2>
      <form class="settings-card">
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
        <button type="button" class="settings-btn" @click="saveSettings">Enregistrer</button>
      </form>
    </div>
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
  background: #FFFEF9;
  width: 700px;
  max-width: 100%;
  margin: 0 auto;
}

.settings-title {
  font-size: 2.1rem;
  color: #E48700;
  margin-bottom: 2rem;
  font-weight: bold;
  text-align: center;
}

.settings-section {
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.4rem;
  color: #28303F;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #ECBC76;
  padding-bottom: 0.5rem;
}

.settings-card {
  background: #FFF4E3;
  border-radius: 14px;
  box-shadow: 0 2px 8px #0001;
  padding: 2rem 2.5rem;
  min-width: 320px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #E0D5C7;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  color: #28303F;
  font-weight: 600;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.3rem;
}

.setting-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.setting-control {
  margin-left: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #28303F;
  font-weight: 500;
  margin-bottom: 0.4rem;
  display: block;
}

.form-group input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1.5px solid #ECBC76;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #28303F;
  margin-top: 0.2rem;
  transition: border 0.18s;
}

.form-group input:focus {
  border-color: #E48700;
  outline: none;
}

.settings-btn {
  background: #ECBC76;
  color: #28303F;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1.08rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  margin-top: 1rem;
  align-self: flex-start;
}

.settings-btn:hover {
  background: #E48700;
  color: #fff;
}

@media (max-width: 700px) {
  .settings-card {
    padding: 1.2rem;
    min-width: 0;
    max-width: 100%;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .setting-control {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .settings-content {
    padding: 1rem 0.5rem;
  }
}
</style>
