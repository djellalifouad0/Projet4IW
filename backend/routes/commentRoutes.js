const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/:id/comments', authenticate, addComment);
router.get('/:id/comments', getComments);

module.exports = router;