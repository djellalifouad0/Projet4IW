const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', ratingController.createRating);

router.put('/:id', ratingController.updateRating);

router.delete('/:id', ratingController.deleteRating);

router.get('/user/:userId', ratingController.getUserRatings);

router.get('/user/:userId/summary', ratingController.getUserRatingSummary);

module.exports = router;

