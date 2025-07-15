import api from './api';

const dashboardService = {
  /**
   * Récupère les statistiques du tableau de bord
   * @returns {Promise} Promesse contenant les statistiques utilisateur
   */
  async getUserStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
};

export default dashboardService;
