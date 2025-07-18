const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/test', analyticsController.getAllKPIs);

router.use(authenticate);

const adminMiddleware = (req, res, next) => {


  next();
};


router.get('/kpis', adminMiddleware, analyticsController.getAllKPIs);


router.get('/dashboard', adminMiddleware, analyticsController.getDashboard);


router.get('/kpi/:kpiId', adminMiddleware, analyticsController.getSpecificKPI);


router.get('/trends', adminMiddleware, analyticsController.getTrends);


router.post('/report', adminMiddleware, analyticsController.getCustomReport);

router.get('/kpi-definitions', adminMiddleware, (req, res) => {
  const kpiDefinitions = {
    1: { name: 'Post Publish Clicks', description: 'Nombre de clics sur le bouton "Publier"' },
    2: { name: 'Post Likes', description: 'Nombre de likes sur les posts' },
    3: { name: 'Post Comments', description: 'Nombre de commentaires postés' },
    4: { name: 'Post Views', description: 'Nombre de vues de posts' },
    5: { name: 'Profile Views', description: 'Nombre de vues de profils' },
    6: { name: 'Search Executed', description: 'Nombre de recherches effectuées' },
    7: { name: 'Filter Clicks', description: 'Nombre de clics sur les filtres' },
    8: { name: 'Clear Search Clicks', description: 'Nombre de clics sur "Effacer la recherche"' },
    9: { name: 'Map Clicks', description: 'Nombre de clics sur la carte' },
    10: { name: 'Homepage Time Spent', description: 'Temps passé sur la page d\'accueil' },
    11: { name: 'Conversations Started', description: 'Nombre de conversations initiées' },
    12: { name: 'Messages Sent', description: 'Nombre de messages envoyés' },
    13: { name: 'Appointments Created', description: 'Nombre de rendez-vous créés' },
    14: { name: 'Appointments Accepted', description: 'Nombre de rendez-vous acceptés' },
    15: { name: 'Notifications Viewed', description: 'Nombre de notifications consultées' },
    16: { name: 'Ratings Given', description: 'Nombre d\'avis donnés' },
    17: { name: 'Reports Submitted', description: 'Nombre de signalements' },
    18: { name: 'Profile Completion Rate', description: 'Taux de complétion des profils' },
    19: { name: 'Post Load Time', description: 'Temps de chargement des posts' },
    20: { name: 'Notification Panel Opened', description: 'Nombre d\'ouvertures du panneau notifications' },
    21: { name: 'Average User Rating', description: 'Note moyenne des utilisateurs' },
    22: { name: 'Daily Active Users (DAU)', description: 'Nombre d\'utilisateurs actifs par jour' },
    23: { name: 'Weekly Active Users (WAU)', description: 'Nombre d\'utilisateurs actifs par semaine' },
    24: { name: 'Monthly Active Users (MAU)', description: 'Nombre d\'utilisateurs actifs par mois' },
    25: { name: 'Churn Rate', description: 'Taux d\'utilisateurs qui quittent la plateforme' },
    26: { name: 'Conversion Rate', description: 'Taux d\'inscrits qui publient au moins un post' },
    27: { name: 'Average Response Time', description: 'Temps moyen de réponse à un message' },
    28: { name: 'Appointment No-Show Rate', description: 'Taux de rendez-vous non honorés' },
    29: { name: 'Notification Click Rate', description: 'Pourcentage de notifications cliquées' },
    30: { name: 'Feature Adoption Rate', description: 'Pourcentage d\'utilisateurs ayant utilisé une fonctionnalité donnée' }
  };

  res.json({
    success: true,
    data: kpiDefinitions
  });
});

module.exports = router;

