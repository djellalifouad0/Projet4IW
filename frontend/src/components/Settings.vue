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
      <button type="button" class="settings-btn" @click="saveSettings">Enregistrer</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Settings',
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
  margin-bottom: 0.7rem;
  font-weight: bold;
}
.settings-form {
  background: #FFF4E3;
  border-radius: 14px;
  box-shadow: 0 2px 8px #0001;
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
}
.settings-btn:hover {
  background: #E48700;
  color: #fff;
}
@media (max-width: 700px) {
  .settings-form {
    padding: 1.2rem 0.7rem;
    min-width: 0;
    max-width: 100%;
  }
}
</style>
