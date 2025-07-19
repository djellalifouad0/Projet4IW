<template>
  <div v-if="isVisible" class="payment-modal-overlay" @click="closeModal">
    <div class="payment-modal" @click.stop>
      <div class="payment-modal-header">
        <h3>Confirmer le paiement</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <div class="payment-modal-content">
        <div v-if="appointment" class="appointment-summary">
          <h4>{{ appointment.title || 'Rendez-vous' }}</h4>
          <p class="appointment-date">{{ formatDate(appointment.appointmentDate) }}</p>
          <p class="appointment-with">Avec {{ getOtherUserName(appointment) }}</p>
          
          <div class="price-breakdown">
            <div class="price-line">
              <span>Prix du service:</span>
              <span>{{ (appointment.price || 0).toFixed(2) }}€</span>
            </div>
            <div class="price-line">
              <span>Commission plateforme:</span>
              <span>{{ (appointment.commission || 0).toFixed(2) }}€</span>
            </div>
            <div class="price-line total">
              <span><strong>Total à payer:</strong></span>
              <span><strong>{{ (appointment.totalPrice || 0).toFixed(2) }}€</strong></span>
            </div>
          </div>
        </div>
        
        <div v-else class="appointment-summary">
          <p>Chargement des informations du rendez-vous...</p>
        </div>
        
        <div class="payment-actions">
          <button @click="closeModal" class="btn-cancel">
            Annuler
          </button>
          <button @click="proceedToPayment" class="btn-pay" :disabled="isProcessing">
            <span v-if="!isProcessing">Payer avec Stripe</span>
            <span v-else>Redirection...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StripeService from '@/services/stripeService';

export default {
  name: 'PaymentModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    appointment: {
      type: Object,
      required: true
    },
    loggedInUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isProcessing: false
    };
  },
  mounted() {
    console.log('PaymentModal component mounted');
  },
  watch: {
    isVisible(newVal) {
      console.log('PaymentModal visibility changed to:', newVal);
      if (newVal && this.appointment) {
        console.log('PaymentModal opened for appointment:', this.appointment.title);
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    
    async proceedToPayment() {
      try {
        this.isProcessing = true;
        
        // Créer la session de paiement Stripe
        const paymentData = await StripeService.createPaymentSession(this.appointment.id);
        
        // Rediriger vers Stripe
        StripeService.redirectToPayment(paymentData.sessionUrl);
        
      } catch (error) {
        console.error('Erreur paiement:', error);
        alert('Erreur lors de la création du paiement: ' + error.message);
      } finally {
        this.isProcessing = false;
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
    
    getOtherUserName(appointment) {
      if (!appointment) return 'Utilisateur inconnu';
      if (appointment.requesterId === this.loggedInUser?.id) {
        return appointment.receiver?.username || 'Utilisateur inconnu';
      } else {
        return appointment.requester?.username || 'Utilisateur inconnu';
      }
    }
  }
};
</script>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.payment-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.payment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.payment-modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.payment-modal-content {
  padding: 20px;
}

.appointment-summary {
  margin-bottom: 24px;
}

.appointment-summary h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.1rem;
}

.appointment-date,
.appointment-with {
  margin: 4px 0;
  color: #666;
  font-size: 0.9rem;
}

.price-breakdown {
  margin-top: 16px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.price-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #333;
}

.price-line.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ddd;
  font-size: 1.1rem;
}

.payment-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-pay {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background-color: #efefef;
}

.btn-pay {
  background-color: #635bff;
  color: white;
}

.btn-pay:hover:not(:disabled) {
  background-color: #5a54d9;
  transform: translateY(-1px);
}

.btn-pay:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 480px) {
  .payment-modal {
    width: 95%;
    margin: 10px;
  }
  
  .payment-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-pay {
    width: 100%;
  }
}
</style>
