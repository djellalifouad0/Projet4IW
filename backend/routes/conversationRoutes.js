const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getUnreadMessagesCount,
  markConversationAsRead,
  deleteConversation
} = require('../controllers/conversationController');

router.get('/', authenticate, getConversations);
router.get('/unread-count', authenticate, getUnreadMessagesCount);
router.post('/', authenticate, createConversation);
router.get('/:id/messages', authenticate, getMessages);
router.post('/:id/messages', authenticate, sendMessage);
router.patch('/:id/mark-read', authenticate, markConversationAsRead);
router.delete('/:id', authenticate, deleteConversation);

module.exports = router;

