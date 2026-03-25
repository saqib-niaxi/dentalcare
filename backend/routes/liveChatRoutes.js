const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  createConversation,
  closeConversation,
  getTotalUnread,
  deleteConversation,
  sendMessage,
  getMessages,
  markRead
} = require('../controllers/liveChatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/unread', protect, getTotalUnread);
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:id', protect, getConversation);
router.put('/conversations/:id/close', protect, closeConversation);
router.delete('/conversations/:id', protect, deleteConversation);
router.post('/conversations/:id/messages', protect, sendMessage);
router.get('/conversations/:id/messages', protect, getMessages);
router.put('/conversations/:id/read', protect, markRead);

module.exports = router;
