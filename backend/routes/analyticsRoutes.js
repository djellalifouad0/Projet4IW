const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/authMiddleware');

// Route de test sans authentification
router.get('/test', analyticsController.getAllKPIs);

// Middleware d'authentification pour toutes les autres routes analytics
router.use(authenticate);

// Middleware pour vérifier les droits admin (vous pouvez l'adapter selon vos besoins)
const adminMiddleware = (req, res, next) => {
  // Ici vous pouvez ajouter votre logique de vérification des droits admin
  // Par exemple, vérifier si l'utilisateur a un rôle admin
  // Pour l'instant, on autorise tous les utilisateurs authentifiés
  next();
};

/**
 * @swagger
 * /api/analytics/kpis:
 *   get:
 *     summary: Obtenir tous les KPI
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Période des données
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date spécifique (format YYYY-MM-DD ou 'today', 'yesterday')
 *     responses:
 *       200:
 *         description: Liste de tous les KPI
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/kpis', adminMiddleware, analyticsController.getAllKPIs);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Obtenir les données du tableau de bord
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Période des données
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date spécifique
 *     responses:
 *       200:
 *         description: Données du tableau de bord
 */
router.get('/dashboard', adminMiddleware, analyticsController.getDashboard);

/**
 * @swagger
 * /api/analytics/kpi/{kpiId}:
 *   get:
 *     summary: Obtenir un KPI spécifique
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kpiId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du KPI (1-30)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Période des données
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date spécifique
 *     responses:
 *       200:
 *         description: Données du KPI demandé
 *       400:
 *         description: ID de KPI invalide
 *       500:
 *         description: Erreur serveur
 */
router.get('/kpi/:kpiId', adminMiddleware, analyticsController.getSpecificKPI);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Obtenir les tendances sur une période
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Unité de période
 *       - in: query
 *         name: range
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *         description: Nombre de périodes à récupérer
 *     responses:
 *       200:
 *         description: Données de tendance
 */
router.get('/trends', adminMiddleware, analyticsController.getTrends);

/**
 * @swagger
 * /api/analytics/report:
 *   post:
 *     summary: Générer un rapport personnalisé
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kpis
 *             properties:
 *               kpis:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Liste des IDs de KPI à inclure dans le rapport
 *               period:
 *                 type: string
 *                 enum: [day, week, month, year]
 *                 description: Période des données
 *               date:
 *                 type: string
 *                 description: Date spécifique
 *     responses:
 *       200:
 *         description: Rapport personnalisé généré
 *       400:
 *         description: Données d'entrée invalides
 */
router.post('/report', adminMiddleware, analyticsController.getCustomReport);

// Route pour obtenir la liste des KPI disponibles avec leurs descriptions
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
