<template>
  <div class="login-wrapper">
    <div class="login-left">
      <img src="../assets/images/SkillSwap Logo.png" alt="SkillSwap" class="login-logo" />
      <span class="login-logo-title">SkillSwap</span>
    </div>
    <div class="login-box">
      <h2>Bienvenue sur SkillSwap</h2> 
      <div class="switch-link">
        <span>Déjà un compte ?</span> <br />
        <router-link to="/login">Connectez-vous</router-link>
      </div>
      <h1>Inscrivez-vous</h1>
      <form @submit.prevent="handleRegister">
        <div class="flex-row">
          <input v-model="email" type="email" placeholder="adresse e-mail" required />
          <input v-model="phone" type="tel" placeholder="Numéro de téléphone" required />
        </div>
        <div class="flex-row">
          <input v-model="firstName" type="text" placeholder="Prénom" required />
          <input v-model="lastName" type="text" placeholder="Nom" required />
        </div>
        <input v-model="password" type="password" placeholder="Mot de passe" required />
        <button type="submit" class="primary">S'inscrire</button>
      </form>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'

export default {
  components: {
    RouterLink
  },
  data() {
    return {
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      password: '',
    };
  },
  methods: {
    handleRegister() {
      console.log('Inscription avec', this.email);
    },
  },
};
</script>
