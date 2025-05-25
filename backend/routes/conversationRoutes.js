const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage
} = require('../controllers/conversationController');

// Routes protégées par authentification
router.get('/', authenticate, getConversations);
router.post('/', authenticate, createConversation);
router.get('/:id/messages', authenticate, getMessages);
router.post('/:id/messages', authenticate, sendMessage);

module.exports = router;
