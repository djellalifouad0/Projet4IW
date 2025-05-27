<template>
  <div class="login-wrapper">
    <div class="login-left">
      <img src="../assets/images/SkillSwap Logo.png" alt="SkillSwap" class="login-logo" />
      <span class="login-logo-title">SkillSwap</span>
    </div>
    <div class="login-box">
      <h2>Bienvenue sur SkillSwap</h2>
      <div class="switch-link">
        <span>Pas de compte ?</span> <br />
        <router-link to="/register">Inscrivez-vous</router-link>
      </div>
      <h1>Connectez-vous</h1>
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="Adresse e-mail" required />
        <div class="password-field">
          <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Mot de passe" required />
          <button type="button" @click="showPassword = !showPassword">👁</button>
        </div>
        <router-link to="/forgot-password" class="forgot">Mot de passe oublié</router-link>
        <button type="submit" class="primary">Se connecter</button>
      </form>
      <div class="divider">OU</div>
      <button class="google-login">Se connecter avec Google</button>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import { useRouter } from 'vue-router'

export default {
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      error: '',
      loading: false,
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async handleLogin() {
      this.error = '';
      this.loading = true;
      try {
        const res = await api.post('/auth/login', {
          email: this.email,
          password: this.password,
        });
        localStorage.setItem('token', res.data.token);
        this.$router.push('/dashboard');
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur de connexion';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
