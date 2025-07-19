<template>
  <div class="payment-page">
    <div class="payment-container">
      <div class="payment-header">
        <h1>Confirmer le paiement</h1>
        <p class="payment-subtitle">Finalisez votre réservation</p>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des informations...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Erreur</h3>
        <p>{{ error }}</p>
        <button @click="goBack" class="btn-back">
          Retour au profil
        </button>
      </div>
      
      <div v-else-if="appointment" class="payment-content">
        <div class="appointment-card">
          <h2>{{ appointment.title }}</h2>
          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">Date :</span>
              <span class="value">{{ formatDate(appointment.appointmentDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Avec :</span>
              <span class="value">{{ getProviderName(appointment) }}</span>
            </div>
            <div v-if="appointment.description" class="detail-row">
              <span class="label">Description :</span>
              <span class="value">{{ appointment.description }}</span>
            </div>
            <div v-if="appointment.location" class="detail-row">
              <span class="label">Lieu :</span>
              <span class="value">{{ appointment.location }}</span>
            </div>
          </div>
        </div>
        
        <div class="payment-summary">
          <h3>Résumé du paiement</h3>
          <div class="price-breakdown">
            <div class="price-line">
              <span>Prix du service</span>
              <span>{{ appointment.price?.toFixed(2) }}€</span>
            </div>
            <div class="price-line">
              <span>Commission plateforme (11%)</span>
              <span>{{ appointment.commission?.toFixed(2) }}€</span>
            </div>
            <div class="price-line total">
              <span><strong>Total à payer</strong></span>
              <span><strong>{{ appointment.totalPrice?.toFixed(2) }}€</strong></span>
            </div>
          </div>
        </div>
        
        <div class="payment-actions">
          <button @click="goBack" class="btn-cancel">
            Annuler
          </button>
          <button @click="proceedToPayment" class="btn-pay" :disabled="isProcessing">
            <span v-if="!isProcessing">
              Payer avec Stripe
            </span>
            <span v-else>
              <div class="spinner-small"></div>
              Redirection...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StripeService from '@/services/stripeService';
import api from '@/services/api';
import authService from '@/services/authService';

export default {
  name: 'PaymentPage',
  data() {
    return {
      appointment: null,
      loading: true,
      error: null,
      isProcessing: false
    };
  },
  async mounted() {
    await this.loadAppointment();
  },
  methods: {
    async loadAppointment() {
      try {
        const appointmentId = this.$route.params.appointmentId;
        if (!appointmentId) {
          this.error = 'ID du rendez-vous manquant';
          this.loading = false;
          return;
        }

        // Récupérer les détails du rendez-vous
        const response = await api.get(`/appointments/${appointmentId}`);
        this.appointment = response.data;
        
        // Vérifier que l'utilisateur connecté est bien le receveur (celui qui doit payer)
        let loggedInUser = null;
        try {
          loggedInUser = await authService.getUserInfo();
        } catch (e) {
          console.error('Erreur récupération utilisateur connecté:', e);
          this.error = 'Erreur d\'authentification. Veuillez vous reconnecter.';
          this.loading = false;
          return;
        }
        
        console.log('Logged user:', loggedInUser);
        console.log('Logged user ID:', loggedInUser?.id);
        console.log('Appointment receiver ID:', this.appointment.receiverId);
        console.log('Appointment requester ID:', this.appointment.requesterId);
        
        if (this.appointment.receiverId !== loggedInUser?.id) {
          this.error = 'Vous n\'êtes pas autorisé à accéder à cette page de paiement';
          this.loading = false;
          return;
        }
        
        this.loading = false;
      } catch (error) {
        console.error('Erreur chargement rendez-vous:', error);
        this.error = error.response?.data?.error || 'Erreur lors du chargement';
        this.loading = false;
      }
    },
    
    async proceedToPayment() {
      try {
        this.isProcessing = true;
        
        const paymentData = await StripeService.createPaymentSession(this.appointment.id);
        
        // Rediriger vers Stripe
        window.location.href = paymentData.sessionUrl;
        
      } catch (error) {
        console.error('Erreur paiement:', error);
        alert('Erreur lors de la création du paiement: ' + error.message);
        this.isProcessing = false;
      }
    },
    
    async goBack() {
      try {
        const user = await authService.getUserInfo();
        const profileToken = user?.profileToken;
        
        if (profileToken) {
          console.log('User found, redirecting to profile with token:', profileToken);
          this.$router.push(`/profile/${profileToken}`);
        } else {
          console.log('No profile token, redirecting to home');
          this.$router.push('/');
        }
      } catch (e) {
        console.error('Error getting user info:', e);
        console.log('User not authenticated, redirecting to login');
        this.$router.push('/login');
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Date non définie';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getProviderName(appointment) {
      if (!appointment) return 'Utilisateur inconnu';
      // Le provider est celui qui reçoit le rendez-vous (receiver)
      return appointment.receiver?.username || 'Utilisateur inconnu';
    }
  }
};
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.payment-header {
  text-align: center;
  margin-bottom: 32px;
}

.payment-header h1 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 600;
}

.payment-subtitle {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #333;
  margin: 0 0 12px 0;
}

.error-state p {
  color: #666;
  margin: 0 0 24px 0;
}

.appointment-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.appointment-card h2 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 1.5rem;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-row .label {
  font-weight: 500;
  color: #555;
  min-width: 100px;
}

.detail-row .value {
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

.payment-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.payment-summary h3 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 1.25rem;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.price-line.total {
  border-top: 2px solid #ddd;
  padding-top: 16px;
  margin-top: 8px;
  font-size: 1.1rem;
}

.payment-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-cancel,
.btn-pay,
.btn-back {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 140px;
}

.btn-cancel,
.btn-back {
  background-color: #f5f5f5;
  color: #666;
}

.btn-cancel:hover,
.btn-back:hover {
  background-color: #efefef;
  transform: translateY(-1px);
}

.btn-pay {
  background-color: #635bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-pay:hover:not(:disabled) {
  background-color: #5a54d9;
  transform: translateY(-1px);
}

.btn-pay:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .payment-page {
    padding: 16px;
  }
  
  .payment-container {
    padding: 24px;
  }
  
  .payment-header h1 {
    font-size: 1.5rem;
  }
  
  .payment-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-pay,
  .btn-back {
    width: 100%;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-row .value {
    text-align: left;
    margin-left: 0;
  }
}
</style>