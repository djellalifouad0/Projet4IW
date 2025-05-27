const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticate } = require('../middlewares/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer un avis
router.post('/', ratingController.createRating);

// Modifier un avis
router.put('/:id', ratingController.updateRating);

// Supprimer un avis
router.delete('/:id', ratingController.deleteRating);

// Récupérer les avis d'un utilisateur
router.get('/user/:userId', ratingController.getUserRatings);

// Récupérer le résumé des notes d'un utilisateur
router.get('/user/:userId/summary', ratingController.getUserRatingSummary);

module.exports = router;
