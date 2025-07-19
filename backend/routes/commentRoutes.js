const express = require('express');
const router = express.Router();
const { addComment, getComments, updateComment, deleteComment } = require('../controllers/commentController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/:id/comments', authenticate, addComment);
router.get('/:id/comments', getComments);
router.patch('/comments/:id', authenticate, updateComment);
router.delete('/comments/:id', authenticate, deleteComment);

module.exports = router;
