<template>
  <div class="advanced-stats">
    <div class="stats-header">
      <h2>📊 Statistiques Avancées</h2>
      <select v-model="period" @change="fetchStats" class="period-select">
        <option value="7">7 derniers jours</option>
        <option value="30">30 derniers jours</option>
        <option value="90">3 derniers mois</option>
      </select>
    </div>

    <div class="charts-grid">
      <!-- Graphique des utilisateurs actifs -->
      <div class="chart-container">
        <h3>👥 Utilisateurs Actifs</h3>
        <div class="chart-content">
          <div class="metric-row">
            <span class="metric-label">Aujourd'hui:</span>
            <span class="metric-value">{{ stats.activeToday || 0 }}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Cette semaine:</span>
            <span class="metric-value">{{ stats.activeWeek || 0 }}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Ce mois:</span>
            <span class="metric-value">{{ stats.activeMonth || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Graphique des compétences populaires -->
      <div class="chart-container">
        <h3>🎯 Compétences Populaires</h3>        <div class="chart-content">
          <div v-for="skill in stats.topSkills || []" :key="skill.id" class="skill-item">
            <span class="skill-name">{{ skill.description?.substring(0, 30) }}{{ skill.description?.length > 30 ? '...' : '' }}</span>
            <div class="skill-bar">
              <div 
                class="skill-progress" 
                :style="{ width: (skill.views / Math.max(...(stats.topSkills || []).map(s => s.views)) * 100) + '%' }"
              ></div>
            </div>
            <span class="skill-count">{{ skill.views }}</span>
          </div>
        </div>
      </div>

      <!-- Activité par jour -->
      <div class="chart-container full-width">
        <h3>📈 Activité Quotidienne</h3>
        <div class="activity-chart">
          <div v-for="(day, index) in stats.dailyActivity || []" :key="index" class="activity-day">
            <div class="activity-bars">
              <div 
                class="bar bar-users" 
                :style="{ height: Math.max(5, (day.newUsers / maxUsers * 100)) + 'px' }"
                :title="`${day.newUsers} nouveaux utilisateurs`"
              ></div>
              <div 
                class="bar bar-messages" 
                :style="{ height: Math.max(5, (day.messages / maxMessages * 100)) + 'px' }"
                :title="`${day.messages} messages`"
              ></div>
              <div 
                class="bar bar-skills" 
                :style="{ height: Math.max(5, (day.skills / maxSkills * 100)) + 'px' }"
                :title="`${day.skills} compétences`"
              ></div>
            </div>
            <span class="day-label">{{ formatDayLabel(day.date) }}</span>
          </div>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color bar-users"></span>
            <span>Nouveaux utilisateurs</span>
          </div>
          <div class="legend-item">
            <span class="legend-color bar-messages"></span>
            <span>Messages</span>
          </div>
          <div class="legend-item">
            <span class="legend-color bar-skills"></span>
            <span>Compétences</span>
          </div>
        </div>
      </div>

      <!-- Statistiques des rendez-vous -->
      <div class="chart-container">
        <h3>📅 Rendez-vous</h3>
        <div class="chart-content">
          <div class="appointment-stats">
            <div class="stat-circle pending">
              <span class="stat-number">{{ stats.appointments?.pending || 0 }}</span>
              <span class="stat-label">En attente</span>
            </div>
            <div class="stat-circle accepted">
              <span class="stat-number">{{ stats.appointments?.accepted || 0 }}</span>
              <span class="stat-label">Acceptés</span>
            </div>
            <div class="stat-circle declined">
              <span class="stat-number">{{ stats.appointments?.declined || 0 }}</span>
              <span class="stat-label">Refusés</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top utilisateurs -->
      <div class="chart-container">
        <h3>⭐ Top Utilisateurs</h3>
        <div class="chart-content">
          <div v-for="(user, index) in stats.topUsers || []" :key="user.id" class="top-user">
            <div class="user-rank">{{ index + 1 }}</div>
            <img :src="user.avatar || '/default-avatar.png'" :alt="user.username" class="user-avatar-small" />
            <div class="user-info">
              <strong>{{ user.username }}</strong>
              <span>{{ user.skillsCount }} compétences</span>
            </div>
            <div class="user-rating">
              ⭐ {{ user.averageRating?.toFixed(1) || '0.0' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import adminService from '../services/adminService'

export default {
  name: 'AdvancedStats',
  data() {
    return {
      period: '7',
      stats: {}
    }
  },
  computed: {
    maxUsers() {
      const activities = this.stats.dailyActivity || []
      return Math.max(...activities.map(d => d.newUsers), 1)
    },
    maxMessages() {
      const activities = this.stats.dailyActivity || []
      return Math.max(...activities.map(d => d.messages), 1)
    },
    maxSkills() {
      const activities = this.stats.dailyActivity || []
      return Math.max(...activities.map(d => d.skills), 1)
    }
  },
  async created() {
    await this.fetchStats()
  },
  methods: {
    async fetchStats() {
      try {
        // Pour cette démo, on utilise les stats du dashboard
        // Dans une vraie application, on créerait une route spécifique avec les paramètres de période
        this.stats = await adminService.getDashboardStats()
        
        // Simuler quelques données supplémentaires pour la démo
        this.stats.activeToday = Math.floor(Math.random() * 50) + 10
        this.stats.activeWeek = Math.floor(Math.random() * 200) + 50
        this.stats.activeMonth = Math.floor(Math.random() * 500) + 200
        
        this.stats.topSkills = [
          { id: 1, title: 'JavaScript', views: 150 },
          { id: 2, title: 'Python', views: 120 },
          { id: 3, title: 'Design UI/UX', views: 95 },
          { id: 4, title: 'React', views: 80 },
          { id: 5, title: 'Node.js', views: 65 }
        ]
        
        this.stats.topUsers = [
          { id: 1, username: 'JohnDoe', skillsCount: 8, averageRating: 4.8 },
          { id: 2, username: 'JaneSmith', skillsCount: 6, averageRating: 4.7 },
          { id: 3, username: 'DevMaster', skillsCount: 10, averageRating: 4.6 },
          { id: 4, username: 'DesignPro', skillsCount: 5, averageRating: 4.5 },
          { id: 5, username: 'CodeNinja', skillsCount: 7, averageRating: 4.4 }
        ]
        
        this.stats.appointments = {
          pending: Math.floor(Math.random() * 20) + 5,
          accepted: Math.floor(Math.random() * 50) + 20,
          declined: Math.floor(Math.random() * 15) + 3
        }
        
        // Générer des données d'activité quotidienne pour les 7 derniers jours
        this.stats.dailyActivity = this.generateDailyActivity()
        
      } catch (error) {
        console.error('Erreur chargement statistiques avancées:', error)
      }
    },
    
    generateDailyActivity() {
      const activities = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        activities.push({
          date: date.toISOString().split('T')[0],
          newUsers: Math.floor(Math.random() * 20) + 1,
          messages: Math.floor(Math.random() * 100) + 10,
          skills: Math.floor(Math.random() * 15) + 1
        })
      }
      return activities
    },
    
    formatDayLabel(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.advanced-stats {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 1rem;
  margin-top: 2rem;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-header h2 {
  margin: 0;
  color: #333;
}

.period-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.chart-container.full-width {
  grid-column: 1 / -1;
}

.chart-container h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.chart-content {
  height: 200px;
  overflow-y: auto;
}

/* Métriques simples */
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.metric-label {
  color: #666;
}

.metric-value {
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

/* Compétences populaires */
.skill-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.skill-name {
  font-weight: 500;
  color: #333;
}

.skill-bar {
  background: #e9ecef;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 100%;
  transition: width 0.3s ease;
}

.skill-count {
  font-size: 0.9rem;
  color: #666;
  min-width: 30px;
  text-align: right;
}

/* Graphique d'activité */
.activity-chart {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 150px;
  padding: 1rem 0;
  overflow-x: auto;
}

.activity-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 60px;
}

.activity-bars {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 120px;
}

.bar {
  width: 8px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.bar-users {
  background: linear-gradient(to top, #4CAF50, #81C784);
}

.bar-messages {
  background: linear-gradient(to top, #2196F3, #64B5F6);
}

.bar-skills {
  background: linear-gradient(to top, #FF9800, #FFB74D);
}

.day-label {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* Statistiques des rendez-vous */
.appointment-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
}

.stat-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
}

.stat-circle.pending {
  background: linear-gradient(135deg, #FFC107, #FFD54F);
}

.stat-circle.accepted {
  background: linear-gradient(135deg, #4CAF50, #81C784);
}

.stat-circle.declined {
  background: linear-gradient(135deg, #F44336, #E57373);
}

.stat-number {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  text-align: center;
}

/* Top utilisateurs */
.top-user {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-rank {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info strong {
  color: #333;
  font-size: 0.9rem;
}

.user-info span {
  color: #666;
  font-size: 0.8rem;
}

.user-rating {
  font-size: 0.9rem;
  color: #FF9800;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .advanced-stats {
    padding: 1rem;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-chart {
    gap: 0.5rem;
  }
  
  .activity-day {
    min-width: 40px;
  }
  
  .chart-legend {
    flex-direction: column;
    gap: 1rem;
  }
  
  .appointment-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
