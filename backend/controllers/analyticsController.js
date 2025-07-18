const MatomoAnalyticsService = require('../services/matomoAnalyticsService');

class AnalyticsController {
  constructor() {
    this.matomoService = new MatomoAnalyticsService();
  }

  // Obtenir tous les KPI
  async getAllKPIs(req, res) {
    try {
      const { period = 'day', date = 'today' } = req.query;
      
      const kpis = await this.matomoService.getAllKPIs(period, date);
      
      if (!kpis) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des KPI'
        });
      }

      res.json({
        success: true,
        data: {
          period,
          date,
          kpis: {
            // Engagement utilisateur
            1: { name: 'Post Publish Clicks', value: kpis.postPublishClicks },
            2: { name: 'Post Likes', value: kpis.postLikes },
            3: { name: 'Post Comments', value: kpis.postComments },
            4: { name: 'Post Views', value: kpis.postViews },
            5: { name: 'Profile Views', value: kpis.profileViews },
            
            // Recherche et navigation
            6: { name: 'Search Executed', value: kpis.searchExecuted },
            7: { name: 'Filter Clicks', value: kpis.filterClicks },
            8: { name: 'Clear Search Clicks', value: kpis.clearSearchClicks },
            9: { name: 'Map Clicks', value: kpis.mapClicks },
            10: { name: 'Homepage Time Spent', value: kpis.homepageTimeSpent },
            
            // Communication
            11: { name: 'Conversations Started', value: kpis.conversationsStarted },
            12: { name: 'Messages Sent', value: kpis.messagesSent },
            
            // Métriques utilisateur
            22: { name: 'Daily Active Users', value: kpis.dailyActiveUsers },
            23: { name: 'Weekly Active Users', value: kpis.weeklyActiveUsers },
            24: { name: 'Monthly Active Users', value: kpis.monthlyActiveUsers }
          }
        }
      });
    } catch (error) {
      console.error('Erreur dans getAllKPIs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des KPI'
      });
    }
  }

  // Obtenir les données du tableau de bord
  async getDashboard(req, res) {
    try {
      const { period = 'day', date = 'today' } = req.query;
      
      const dashboardData = await this.matomoService.getDashboardData(period, date);
      
      if (!dashboardData) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des données du tableau de bord'
        });
      }

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Erreur dans getDashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du tableau de bord'
      });
    }
  }

  // Obtenir un KPI spécifique
  async getSpecificKPI(req, res) {
    try {
      const { kpiId } = req.params;
      const { period = 'day', date = 'today' } = req.query;
      
      let result;
      
      switch (parseInt(kpiId)) {
        case 1:
          result = await this.matomoService.getPostPublishClicks(period, date);
          break;
        case 2:
          result = await this.matomoService.getPostLikes(period, date);
          break;
        case 3:
          result = await this.matomoService.getPostComments(period, date);
          break;
        case 4:
          result = await this.matomoService.getPostViews(period, date);
          break;
        case 5:
          result = await this.matomoService.getProfileViews(period, date);
          break;
        case 6:
          result = await this.matomoService.getSearchExecuted(period, date);
          break;
        case 7:
          result = await this.matomoService.getFilterClicks(period, date);
          break;
        case 8:
          result = await this.matomoService.getClearSearchClicks(period, date);
          break;
        case 9:
          result = await this.matomoService.getMapClicks(period, date);
          break;
        case 10:
          result = await this.matomoService.getHomepageTimeSpent(period, date);
          break;
        case 11:
          result = await this.matomoService.getConversationsStarted(period, date);
          break;
        case 12:
          result = await this.matomoService.getMessagesSent(period, date);
          break;
        case 22:
          result = await this.matomoService.getDailyActiveUsers(date);
          break;
        case 23:
          result = await this.matomoService.getWeeklyActiveUsers(date);
          break;
        case 24:
          result = await this.matomoService.getMonthlyActiveUsers(date);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'KPI ID invalide'
          });
      }

      res.json({
        success: true,
        data: {
          kpiId: parseInt(kpiId),
          period,
          date,
          result
        }
      });
    } catch (error) {
      console.error('Erreur dans getSpecificKPI:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du KPI'
      });
    }
  }

  // Obtenir les tendances sur une période
  async getTrends(req, res) {
    try {
      const { period = 'day', range = '7' } = req.query;
      
      // Générer les dates pour la période demandée
      const dates = this.generateDateRange(period, parseInt(range));
      const trendsData = {};
      
      // Obtenir les données pour chaque date
      for (const date of dates) {
        const kpis = await this.matomoService.getAllKPIs(period, date);
        if (kpis) {
          trendsData[date] = kpis;
        }
      }

      res.json({
        success: true,
        data: {
          period,
          range: parseInt(range),
          trends: trendsData
        }
      });
    } catch (error) {
      console.error('Erreur dans getTrends:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des tendances'
      });
    }
  }

  // Méthode utilitaire pour générer une plage de dates
  generateDateRange(period, range) {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < range; i++) {
      const date = new Date(today);
      
      if (period === 'day') {
        date.setDate(today.getDate() - i);
      } else if (period === 'week') {
        date.setDate(today.getDate() - (i * 7));
      } else if (period === 'month') {
        date.setMonth(today.getMonth() - i);
      }
      
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates.reverse();
  }

  // Obtenir un rapport personnalisé
  async getCustomReport(req, res) {
    try {
      const { kpis, period = 'day', date = 'today' } = req.body;
      
      if (!kpis || !Array.isArray(kpis)) {
        return res.status(400).json({
          success: false,
          message: 'La liste des KPI est requise'
        });
      }

      const reportData = {};
      
      for (const kpiId of kpis) {
        try {
          const kpiData = await this.getKPIById(kpiId, period, date);
          reportData[kpiId] = kpiData;
        } catch (error) {
          console.error(`Erreur lors de la récupération du KPI ${kpiId}:`, error);
          reportData[kpiId] = null;
        }
      }

      res.json({
        success: true,
        data: {
          period,
          date,
          report: reportData
        }
      });
    } catch (error) {
      console.error('Erreur dans getCustomReport:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la génération du rapport'
      });
    }
  }

  // Méthode utilitaire pour obtenir un KPI par ID
  async getKPIById(kpiId, period, date) {
    switch (parseInt(kpiId)) {
      case 1: return await this.matomoService.getPostPublishClicks(period, date);
      case 2: return await this.matomoService.getPostLikes(period, date);
      case 3: return await this.matomoService.getPostComments(period, date);
      case 4: return await this.matomoService.getPostViews(period, date);
      case 5: return await this.matomoService.getProfileViews(period, date);
      case 6: return await this.matomoService.getSearchExecuted(period, date);
      case 7: return await this.matomoService.getFilterClicks(period, date);
      case 8: return await this.matomoService.getClearSearchClicks(period, date);
      case 9: return await this.matomoService.getMapClicks(period, date);
      case 10: return await this.matomoService.getHomepageTimeSpent(period, date);
      case 11: return await this.matomoService.getConversationsStarted(period, date);
      case 12: return await this.matomoService.getMessagesSent(period, date);
      case 22: return await this.matomoService.getDailyActiveUsers(date);
      case 23: return await this.matomoService.getWeeklyActiveUsers(date);
      case 24: return await this.matomoService.getMonthlyActiveUsers(date);
      default: throw new Error('KPI ID invalide');
    }
  }

  // Obtenir un rapport personnalisé
  async getCustomReport(req, res) {
    try {
      const { metrics, period = 'day', date = 'today' } = req.body;
      
      if (!metrics || !Array.isArray(metrics)) {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre metrics est requis et doit être un tableau'
        });
      }

      const report = {};
      for (const metric of metrics) {
        try {
          report[metric] = await this.matomoService.getSpecificMetric(metric, period, date);
        } catch (error) {
          report[metric] = { error: error.message };
        }
      }

      res.json({
        success: true,
        data: {
          period,
          date,
          report
        }
      });

    } catch (error) {
      console.error('Erreur dans getCustomReport:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du rapport personnalisé',
        error: error.message
      });
    }
  }
}

const analyticsController = new AnalyticsController();

// Lier les méthodes pour préserver le contexte 'this'
module.exports = {
  getAllKPIs: analyticsController.getAllKPIs.bind(analyticsController),
  getDashboard: analyticsController.getDashboard.bind(analyticsController),
  getSpecificKPI: analyticsController.getSpecificKPI.bind(analyticsController),
  getTrends: analyticsController.getTrends.bind(analyticsController),
  getCustomReport: analyticsController.getCustomReport.bind(analyticsController)
};
