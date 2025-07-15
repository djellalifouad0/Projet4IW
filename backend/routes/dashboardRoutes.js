const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// Route pour récupérer les statistiques du dashboard
router.get('/stats', authenticate, dashboardController.getUserStats);

module.exports = router;
