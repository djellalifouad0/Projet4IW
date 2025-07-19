const express = require('express');
const router = express.Router();
const { likeSkill, unlikeSkill } = require('../controllers/likeController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/:id/like', authenticate, likeSkill);
router.delete('/:id/unlike', authenticate, unlikeSkill);

module.exports = router;
