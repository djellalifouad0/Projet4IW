<template>
  <div class="analytics-dashboard">
    <div class="dashboard-header">
      <h1>Tableau de Bord Analytics</h1>
      <div class="period-selector">
        <select v-model="selectedPeriod" @change="loadDashboard">
          <option value="day">Jour</option>
          <option value="week">Semaine</option>
          <option value="month">Mois</option>
        </select>
        <input 
          type="date" 
          v-model="selectedDate" 
          @change="loadDashboard"
          class="date-picker"
        />
        <button @click="refreshData" class="refresh-btn" :disabled="loading">
          🔄 Actualiser
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Chargement des données...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="dashboardData" class="dashboard-content">
      <!-- Résumé général -->
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Utilisateurs Actifs</h3>
          <div class="big-number">{{ dashboardData.summary.activeUsers }}</div>
        </div>
        <div class="summary-card">
          <h3>Événements Total</h3>
          <div class="big-number">{{ dashboardData.summary.totalEvents }}</div>
        </div>
        <div class="summary-card">
          <h3>Taux d'Engagement</h3>
          <div class="big-number">{{ dashboardData.summary.engagementRate }}</div>
        </div>
      </div>

      <!-- KPI par catégorie -->
      <div class="kpi-sections">
        <!-- Engagement Utilisateur -->
        <div class="kpi-section">
          <h2>📝 Engagement Utilisateur</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Publications Créées</div>
              <div class="kpi-value">{{ dashboardData.kpis.userEngagement.postPublishClicks }}</div>
              <div class="kpi-description">Clics sur "Publier"</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Likes</div>
              <div class="kpi-value">{{ dashboardData.kpis.userEngagement.postLikes }}</div>
              <div class="kpi-description">Likes sur les posts</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Commentaires</div>
              <div class="kpi-value">{{ dashboardData.kpis.userEngagement.postComments }}</div>
              <div class="kpi-description">Commentaires postés</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Vues de Posts</div>
              <div class="kpi-value">{{ dashboardData.kpis.userEngagement.postViews }}</div>
              <div class="kpi-description">Ouvertures de posts</div>
            </div>
          </div>
        </div>

        <!-- Activité Utilisateur -->
        <div class="kpi-section">
          <h2>🔍 Activité & Navigation</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Vues de Profils</div>
              <div class="kpi-value">{{ dashboardData.kpis.userActivity.profileViews }}</div>
              <div class="kpi-description">Clics sur les profils</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Recherches</div>
              <div class="kpi-value">{{ dashboardData.kpis.userActivity.searchExecuted }}</div>
              <div class="kpi-description">Recherches effectuées</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Filtres</div>
              <div class="kpi-value">{{ dashboardData.kpis.userActivity.filterClicks }}</div>
              <div class="kpi-description">Utilisations des filtres</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Carte</div>
              <div class="kpi-value">{{ dashboardData.kpis.userActivity.mapClicks }}</div>
              <div class="kpi-description">Clics sur la carte</div>
            </div>
          </div>
        </div>

        <!-- Communication -->
        <div class="kpi-section">
          <h2>💬 Communication</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Conversations</div>
              <div class="kpi-value">{{ dashboardData.kpis.communication.conversationsStarted }}</div>
              <div class="kpi-description">Nouvelles conversations</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Messages</div>
              <div class="kpi-value">{{ dashboardData.kpis.communication.messagesSent }}</div>
              <div class="kpi-description">Messages envoyés</div>
            </div>
          </div>
        </div>

        <!-- Métriques Utilisateur -->
        <div class="kpi-section">
          <h2>👥 Métriques Utilisateur</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Utilisateurs Actifs (Jour)</div>
              <div class="kpi-value">{{ dashboardData.kpis.userMetrics.dailyActiveUsers }}</div>
              <div class="kpi-description">DAU</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Utilisateurs Actifs (Semaine)</div>
              <div class="kpi-value">{{ dashboardData.kpis.userMetrics.weeklyActiveUsers }}</div>
              <div class="kpi-description">WAU</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Utilisateurs Actifs (Mois)</div>
              <div class="kpi-value">{{ dashboardData.kpis.userMetrics.monthlyActiveUsers }}</div>
              <div class="kpi-description">MAU</div>
            </div>
          </div>
        </div>

        <!-- Temps et Performance -->
        <div class="kpi-section">
          <h2>⏱️ Temps & Performance</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Temps sur Accueil</div>
              <div class="kpi-value">{{ formatTime(dashboardData.kpis.timeMetrics.homepageTimeSpent) }}</div>
              <div class="kpi-description">Temps moyen en secondes</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques de tendance -->
      <div class="trends-section" v-if="trendsData">
        <h2>📈 Tendances</h2>
        <div class="trends-chart">
          <!-- Ici vous pouvez intégrer Chart.js ou une autre bibliothèque de graphiques -->
          <canvas ref="trendsChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'AnalyticsDashboard',
  data() {
    return {
      dashboardData: null,
      trendsData: null,
      loading: true,
      error: null,
      selectedPeriod: 'day',
      selectedDate: new Date().toISOString().split('T')[0]
    }
  },
  async mounted() {
    await this.loadDashboard()
    await this.loadTrends()
  },
  methods: {
    async loadDashboard() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/analytics/dashboard', {
          params: {
            period: this.selectedPeriod,
            date: this.selectedDate
          }
        })
        
        if (response.data.success) {
          this.dashboardData = response.data.data
        } else {
          this.error = response.data.message || 'Erreur lors du chargement des données'
        }
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error)
        this.error = 'Erreur de connexion au serveur'
      } finally {
        this.loading = false
      }
    },
    
    async loadTrends() {
      try {
        const response = await api.get('/analytics/trends', {
          params: {
            period: this.selectedPeriod,
            range: 7
          }
        })
        
        if (response.data.success) {
          this.trendsData = response.data.data
          // Ici vous pouvez traiter les données pour les graphiques
        }
      } catch (error) {
        console.error('Erreur lors du chargement des tendances:', error)
      }
    },
    
    async refreshData() {
      await Promise.all([
        this.loadDashboard(),
        this.loadTrends()
      ])
    },
    
    formatTime(seconds) {
      if (!seconds) return '0s'
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`
      } else {
        return `${secs}s`
      }
    }
  }
}
</script>

<style scoped>
.analytics-dashboard {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #333;
}

.period-selector {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.period-selector select,
.date-picker {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
}

.refresh-btn {
  background: #ECBC76;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #E48700;
  color: white;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 5px;
  text-align: center;
  margin-bottom: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}

.summary-card h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.big-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #E48700;
  margin: 0;
}

.kpi-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.kpi-section {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.kpi-section h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  border-bottom: 2px solid #ECBC76;
  padding-bottom: 0.5rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ECBC76;
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.kpi-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #E48700;
  margin-bottom: 0.3rem;
}

.kpi-description {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.trends-section {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-top: 2rem;
}

.trends-chart {
  height: 400px;
  position: relative;
}

@media (max-width: 768px) {
  .analytics-dashboard {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .period-selector {
    flex-wrap: wrap;
  }
  
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
