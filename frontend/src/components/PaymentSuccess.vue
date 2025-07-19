<template>
  <div class="payment-success-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Vérification du paiement en cours...</p>
    </div>
    
    <div v-else-if="paymentSuccess" class="success-container">
      <div class="success-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
      </div>
      
      <h2>Paiement réussi !</h2>
      <p>Votre rendez-vous a été confirmé et payé avec succès.</p>
      
      <div v-if="appointmentDetails" class="appointment-summary">
        <h3>Détails du rendez-vous</h3>
        <div class="detail-item">
          <strong>Titre:</strong> {{ appointmentDetails.title }}
        </div>
        <div class="detail-item">
          <strong>Date:</strong> {{ formatDate(appointmentDetails.appointmentDate) }}
        </div>
        <div class="detail-item">
          <strong>Montant payé:</strong> {{ appointmentDetails.totalPrice?.toFixed(2) }}€
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="goToProfile" class="btn-primary">
          Voir mes rendez-vous
        </button>
        <button @click="goToHome" class="btn-secondary">
          Retour à l'accueil
        </button>
      </div>
    </div>
    
    <div v-else class="error-container">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      
      <h2>Erreur de paiement</h2>
      <p>{{ errorMessage }}</p>
      
      <div class="action-buttons">
        <button @click="goToProfile" class="btn-primary">
          Mes rendez-vous
        </button>
        <button @click="goToHome" class="btn-secondary">
          Retour à l'accueil
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import StripeService from '@/services/stripeService';

export default {
  name: 'PaymentSuccess',
  data() {
    return {
      loading: true,
      paymentSuccess: false,
      appointmentDetails: null,
      errorMessage: ''
    };
  },
  async mounted() {
    await this.verifyPayment();
  },
  methods: {
    async verifyPayment() {
      try {
        const sessionId = this.$route.query.session_id;
        const appointmentId = this.$route.query.appointment_id;
        
        if (!sessionId || !appointmentId) {
          throw new Error('Paramètres de paiement manquants');
        }
        
        const result = await StripeService.verifyPaymentSuccess(sessionId, appointmentId);
        
        if (result.success) {
          this.paymentSuccess = true;
          this.appointmentDetails = result.appointment;
        } else {
          throw new Error('Le paiement n\'a pas pu être vérifié');
        }
        
      } catch (error) {
        console.error('Erreur vérification paiement:', error);
        this.paymentSuccess = false;
        this.errorMessage = error.message || 'Une erreur est survenue lors de la vérification du paiement';
      } finally {
        this.loading = false;
      }
    },
    
    goToProfile() {
      this.$router.push('/profile');
    },
    
    goToHome() {
      this.$router.push('/');
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.payment-success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f5f5f5;
}

.loading-container,
.success-container,
.error-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #635bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-icon,
.error-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

h2 {
  color: #333;
  margin-bottom: 16px;
  font-size: 1.5rem;
}

p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.appointment-summary {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin: 24px 0;
  text-align: left;
}

.appointment-summary h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.1rem;
}

.detail-item {
  margin-bottom: 8px;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background-color: #635bff;
  color: white;
}

.btn-primary:hover {
  background-color: #5a54d9;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background-color: #efefef;
}

/* Responsive */
@media (max-width: 480px) {
  .payment-success-container {
    padding: 10px;
  }
  
  .loading-container,
  .success-container,
  .error-container {
    padding: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
