import api from './api';

/**
 * Service pour gérer les paiements Stripe
 */
class StripeService {
  /**
   * Créer une session de paiement pour un rendez-vous
   * @param {number} appointmentId - ID du rendez-vous
   * @returns {Promise<Object>} URL de redirection Stripe
   */
  static async createPaymentSession(appointmentId) {
    try {
      const response = await api.post(`/appointments/${appointmentId}/create-payment-session`);
      return response.data;
    } catch (error) {
      console.error('Erreur création session paiement:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la création de la session de paiement');
    }
  }

  /**
   * Vérifier le succès d'un paiement
   * @param {string} sessionId - ID de la session Stripe
   * @param {number} appointmentId - ID du rendez-vous
   * @returns {Promise<Object>} Résultat de la vérification
   */
  static async verifyPaymentSuccess(sessionId, appointmentId) {
    try {
      const response = await api.get('/appointments/payment-success', {
        params: {
          session_id: sessionId,
          appointment_id: appointmentId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la vérification du paiement');
    }
  }

  /**
   * Rediriger vers la page de paiement Stripe
   * @param {string} sessionUrl - URL de la session Stripe
   */
  static redirectToPayment(sessionUrl) {
    window.location.href = sessionUrl;
  }
}

export default StripeService;
