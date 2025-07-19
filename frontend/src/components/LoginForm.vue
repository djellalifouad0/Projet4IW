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

        <div v-if="showOtp">
          <input v-model="otp" type="text" placeholder="Code OTP" required />
        </div>

        <router-link to="/forgot-password" class="forgot">Mot de passe oublié</router-link>

        <button type="submit" class="primary" :disabled="loading">
          <span v-if="loading">Connexion…</span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <div class="divider">OU</div>

      <div id="googleSignInButton" style="display: flex; justify-content: center;"></div>

      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      otp: '',
      showPassword: false,
      showOtp: false,
      error: '',
      loading: false,
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  mounted() {
    const clientId = '211678426929-22c5s4tksctlud2p36qt3q9p10jdnpf4.apps.googleusercontent.com' // 👈 mets ici ton vrai client_id Google
    if (!window.google) {
      this.error = 'SDK Google non chargé. Vérifie ton index.html.';
      return;
    }
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: this.handleGoogleCredential
    });
    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      { theme: "outline", size: "large" }
    );
  },
  methods: {
    async handleLogin() {
      this.error = '';
      this.loading = true;
      try {
        const res = await api.post('/auth/login', {
          email: this.email,
          password: this.password,
          otp: this.otp || undefined,
        });
        localStorage.setItem('token', res.data.token);
        this.$router.push('/');
      } catch (err) {
        const msg = err.response?.data?.error || 'Erreur de connexion';
        if (msg.includes('OTP') || msg.includes('2FA')) {
          this.showOtp = true;
        }
        this.error = msg;
      } finally {
        this.loading = false;
      }
    },

    async handleGoogleCredential(response) {
      this.error = '';
      this.loading = true;
      try {
        const idToken = response.credential;

        const res = await api.post('/auth/google', { idToken });
        localStorage.setItem('token', res.data.token);
        this.$router.push('/');
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur Google Auth';
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>
