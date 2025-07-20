<template>
  <div class="login-wrapper">
    <div class="login-left">
      <img src="../assets/images/SkillSwap Logo.png" alt="SkillSwap" class="login-logo" />
      <span class="login-logo-title">SkillSwap</span>
    </div>

    <div class="login-box">
      <h2>Mot de passe oublié</h2>

      <div class="switch-link">
        <span>Vous vous souvenez de votre mot de passe ?</span> <br />
        <router-link to="/login">Se connecter</router-link>
      </div>

      <h1>Réinitialiser votre mot de passe</h1>

      <form @submit.prevent="handleSubmit" v-if="!emailSent">
        <input
          v-model="email"
          type="email"
          placeholder="Adresse e-mail"
          required
          :disabled="isLoading"
        />

        <button type="submit" class="primary" :disabled="isLoading || !email">
          <span v-if="!isLoading">Envoyer le lien</span>
          <span v-else>Envoi en cours...</span>
        </button>
      </form>

      <div v-else class="success-message">
        <div class="success-content">
          <h3>Email envoyé !</h3>
          <p>
            Un lien de réinitialisation a été envoyé à <strong>{{ email }}</strong>.
            Vérifiez votre boîte mail et suivez les instructions.
          </p>
          <p class="note">Le lien est valide pendant 1 heure.</p>
          
          <div class="success-actions">
            <button @click="resetForm" class="secondary">
              Renvoyer un email
            </button>
            <router-link to="/login" class="primary">
              Retour à la connexion
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ForgotPasswordForm',
  data() {
    return {
      email: '',
      isLoading: false,
      emailSent: false,
      error: null
    };
  },
  methods: {
    async handleSubmit() {
      if (!this.email) return;

      this.isLoading = true;
      this.error = null;

      try {
        await api.post('/auth/forgot-password', {
          email: this.email
        });

        this.emailSent = true;
      } catch (error) {
        console.error('Erreur mot de passe oublié:', error);
        this.error = error.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.';
      } finally {
        this.isLoading = false;
      }
    },

    resetForm() {
      this.emailSent = false;
      this.email = '';
      this.error = null;
    }
  }
};
</script>

<style scoped>
.success-message {
  text-align: center;
  padding: 2rem;
}

.success-content h3 {
  color: #E48700;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.success-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.note {
  font-size: 0.9rem;
  color: #6b7280;
  font-style: italic;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.success-actions .secondary {
  background: transparent;
  color: #E48700;
  border: 1px solid #E48700;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.success-actions .secondary:hover {
  background: #E48700;
  color: white;
}

.success-actions .primary {
  background: #E48700;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #E48700;
  transition: all 0.2s;
}

.success-actions .primary:hover {
  background: #ECBC76;
  border-color: #ECBC76;
  color: #333;
}

.error {
  color: #ef4444;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}
</style>
