const express = require('express');
const router = express.Router();
const {
  sendContactMessage,
  getAvailableSlots,
  submitChatbotAppointment
} = require('../controllers/contactController');

// Public routes - no authentication required
router.post('/', sendContactMessage);
router.get('/available-slots', getAvailableSlots);
router.post('/chatbot-appointment', submitChatbotAppointment);

module.exports = router;
