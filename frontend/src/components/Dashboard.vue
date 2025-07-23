<template>
  <div class="dashboard-content">
    <h1 class="dashboard-title">Tableau de bord</h1>
    <div class="dashboard-welcome">
      Bienvenue sur votre espace personnel SkillSwap !
    </div>

    
    <div class="stats-section" v-if="!loading">
      <h2 class="section-title">Vos statistiques</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/icons/agenda.svg" alt="Échanges" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.appointmentsCount || 0 }}</div>
            <div class="stat-label">Échanges réalisés</div>
            <div class="stat-detail">{{ stats.appointmentsAccepted || 0 }} acceptés</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/icons/star_full.svg" alt="Avis" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.averageRating || 0 }}/5</div>
            <div class="stat-label">Moyenne des avis</div>
            <div class="stat-detail">{{ stats.totalRatings || 0 }} avis reçus</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/icons/carte.svg" alt="Compétences" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.skillsCount || 0 }}</div>
            <div class="stat-label">Annonces publiées</div>
            <div class="stat-detail">{{ stats.likesReceived || 0 }} likes reçus</div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="activity-section" v-if="!loading && stats.monthlyActivity">
      <h2 class="section-title">Votre activité (6 derniers mois)</h2>
      <div class="activity-chart">
        <div class="chart-container">
          <div class="chart-bars">
            <div 
              v-for="(month, index) in stats.monthlyActivity" 
              :key="index"
              class="chart-bar-group"
            >
              <div class="chart-bars-container">
                <div 
                  class="chart-bar appointments" 
                  :style="{ height: getBarHeight(month.appointments, maxValue) + '%' }"
                  :title="`${month.appointments} échanges en ${formatMonth(month.month)}`"
                ></div>
                <div 
                  class="chart-bar ratings" 
                  :style="{ height: getBarHeight(month.ratings, maxValue) + '%' }"
                  :title="`${month.ratings} avis reçus en ${formatMonth(month.month)}`"
                ></div>
              </div>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color appointments"></div>
              <span>Échanges</span>
            </div>
            <div class="legend-item">
              <div class="legend-color ratings"></div>
              <span>Avis reçus</span>
            </div>
          </div>
        </div>
      </div>
    </div>



    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement des statistiques...</p>
    </div>

    
    <div v-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadStats" class="retry-button">Réessayer</button>
    </div>
  </div>
</template>

<script>
import dashboardService from '@/services/dashboardService'

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {},
      loading: true,
      error: null
    }
  },
  computed: {
    maxAppointments() {
      if (!this.stats.monthlyActivity) return 1
      return Math.max(...this.stats.monthlyActivity.map(m => m.appointments), 1)
    },
    maxRatings() {
      if (!this.stats.monthlyActivity) return 1
      return Math.max(...this.stats.monthlyActivity.map(m => m.ratings), 1)
    },
    maxValue() {
      if (!this.stats.monthlyActivity) return 1
      const maxApp = Math.max(...this.stats.monthlyActivity.map(m => m.appointments), 0)
      const maxRat = Math.max(...this.stats.monthlyActivity.map(m => m.ratings), 0)
      return Math.max(maxApp, maxRat, 1)
    }
  },
  async mounted() {
    console.log('Dashboard component mounted')
    await this.loadStats()
  },
  methods: {
    async loadStats() {
      console.log('Loading stats...')
      this.loading = true
      this.error = null
      try {
        this.stats = await dashboardService.getUserStats()
        console.log('Stats loaded:', this.stats)
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        this.error = `Erreur lors du chargement des statistiques: ${error.message || error}`
      } finally {
        this.loading = false
      }
    },
    getBarHeight(value, max) {
      if (max === 0) return 0
      return Math.max((value / max) * 100, 2) // Minimum 2% pour la visibilité
    },
    formatMonth(monthYear) {
      const [month, year] = monthYear.split('/')
      const monthNames = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
        'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
      ]
      return `${monthNames[parseInt(month) - 1]} ${year}`
    }
  }
}
</script>

<style scoped>
.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem 1.5rem;
  background: #FFFEF9;
  min-height: 100vh;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.dashboard-title {
  font-size: 3rem;
  color: #E48700;
  margin-bottom: 1rem;
  font-weight: 800;
  text-align: center;
}

.dashboard-welcome {
  font-size: 1.25rem;
  color: #28303F;
  margin-bottom: 3rem;
  background: #FFF4E3;
  padding: 1.5rem 3rem;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(228, 135, 0, 0.1);
  text-align: center;
  border: none;
  max-width: 800px;
  width: 100%;
}

.section-title {
  font-size: 2rem;
  color: #28303F;
  margin-bottom: 2rem;
  font-weight: 700;
  text-align: center;
  width: 100%;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -10px;
  width: 60px;
  height: 4px;
  background: #E48700;
  border-radius: 2px;
}

.stats-section {
  width: 100%;
  margin-bottom: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1000px;
  justify-items: center;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
  width: 100%;
  max-width: 350px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(228, 135, 0, 0.2);
}

.stat-icon {
  margin-right: 1.5rem;
  background: #E48700;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 60px;
}

.stat-icon img {
  width: 32px;
  height: 32px;
  
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: #E48700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: #28303F;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.stat-detail {
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

.activity-section {
  width: 100%;
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.activity-chart {
  background: #ffffff;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: none;
  width: 100%;
  max-width: 1000px;
}

.chart-container {
  width: 100%;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: end;
  height: 280px;
  margin-bottom: 2rem;
  padding: 0 1rem;
  position: relative;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 100px;
}

.chart-bars-container {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 8px;
  height: 240px;
  margin-bottom: 1rem;
}

.chart-bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-bar.appointments {
  background: #E48700;
}

.chart-bar.ratings {
  background: #28303F;
}

.chart-bar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1rem;
  color: #28303F;
  font-weight: 600;
  background: #ffffff;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: #FFF4E3;
  transform: translateY(-2px);
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-color.appointments {
  background: #E48700;
}

.legend-color.ratings {
  background: #28303F;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #666;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #E48700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #d32f2f;
  text-align: center;
  background: #fff5f5;
  border-radius: 16px;
  border: 2px solid #d32f2f;
  max-width: 600px;
  width: 100%;
}

.retry-button {
  background: #E48700;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(228, 135, 0, 0.3);
}

.retry-button:hover {
  background: #d77700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(228, 135, 0, 0.4);
}

@media (max-width: 1200px) {
  .dashboard-content {
    padding: 1.5rem 1rem;
  }
  
  .dashboard-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .chart-bars {
    height: 200px;
    padding: 0 0.5rem;
  }

  .chart-bars-container {
    height: 160px;
  }

  .chart-legend {
    gap: 2rem;
    flex-wrap: wrap;
  }

  .activity-chart {
    padding: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 700px) {
  .dashboard-content {
    padding: 1rem 0.5rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-welcome {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }

  .activity-chart {
    padding: 1.5rem;
  }

  .chart-bar-group {
    max-width: 80px;
  }

  .chart-bar {
    width: 16px;
  }

  .chart-bars {
    height: 150px;
  }

  .chart-legend {
    gap: 1rem;
  }

  .legend-item {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem 1rem;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .chart-bars {
    height: 120px;
  }

  .chart-bars-container {
    height: 100px;
  }
}

/* Styles pour le mode sombre */
.dark-theme .dashboard-content {
  background: #1e1e1e;
  color: #ffffff;
}

.dark-theme .dashboard-title {
  color: #ffffff;
}

.dark-theme .dashboard-welcome {
  background: #1A1F2E;
  color: #e0e0e0;
  border: none;
}

.dark-theme .section-title {
  color: #ffffff;
}

.dark-theme .stat-card {
  background: #1A1F2E;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-theme .stat-card:hover {
  box-shadow: 0 8px 30px rgba(228, 135, 0, 0.4);
}

.dark-theme .stat-number {
  color: #E48700;
}

.dark-theme .stat-label {
  color: #e0e0e0;
}

.dark-theme .stat-detail {
  color: #b0b0b0;
}

.dark-theme .activity-chart {
  background: #1A1F2E;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-theme .chart-bars {
  background: transparent;
}

.dark-theme .chart-bar.appointments {
  background: #E48700;
}

.dark-theme .chart-bar.ratings {
  background: #ffffff;
}

.dark-theme .legend-item {
  background: #1A1F2E;
  color: #e0e0e0;
  border: none;
}

.dark-theme .legend-item:hover {
  background: #3d3d3d;
}

.dark-theme .legend-color.appointments {
  background: #E48700;
}

.dark-theme .legend-color.ratings {
  background: #ffffff;
}

.dark-theme .loading-container {
  color: #b0b0b0;
}

.dark-theme .loading-spinner {
  border-color: #3d3d3d;
  border-top-color: #E48700;
}

.dark-theme .error-container {
  background: #2d1f1f;
  color: #ffb3b3;
  border-color: #d32f2f;
}

.dark-theme .loading-spinner {
  border-color: #3d3d3d;
  border-top-color: #E48700;
}

.dark-theme .error-container {
  background: #2d1f1f;
  color: #ffb3b3;
  border-color: #d32f2f;
}

/* Styles supplémentaires pour tous les textes et éléments */
.dark-theme .chart-container {
  color: #ffffff;
}

.dark-theme .chart-bar-group {
  color: #ffffff;
}

.dark-theme * {
  border-color: inherit;
}
</style>

