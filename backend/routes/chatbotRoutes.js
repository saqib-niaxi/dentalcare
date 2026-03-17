const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { optionalAuth } = require('../middleware/optionalAuth');
const { protect } = require('../middleware/authMiddleware');
const {
  handleMessage,
  getSession,
  clearSession,
  createSession,
  updateSessionAuth,
  getQuickInfo
} = require('../controllers/chatbotController');

// Rate limiting for chatbot messages
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.CHATBOT_RATE_LIMIT) || 10, // 10 requests per minute
  message: {
    success: false,
    message: "You're sending messages too quickly. Please wait a moment and try again."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// IP-based rate limiting (stricter)
const ipLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour per IP
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later or contact us directly."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply IP limiter to all routes
router.use(ipLimiter);

// Send message - main endpoint
router.post('/message', chatbotLimiter, optionalAuth, handleMessage);

// Create new session
router.post('/session', optionalAuth, createSession);

// Get session history
router.get('/session/:sessionId', optionalAuth, getSession);

// Clear session
router.delete('/session/:sessionId', optionalAuth, clearSession);

// Update session with auth (when user logs in)
router.put('/session/:sessionId/auth', protect, updateSessionAuth);

// Quick info endpoint (no rate limiting needed)
router.get('/quick-info', getQuickInfo);

// Get Gemini API usage stats (admin only for monitoring)
router.get('/api-usage', protect, (req, res) => {
  const usageTracker = require('../utils/geminiUsageTracker');
  const stats = usageTracker.getStats();

  res.json({
    success: true,
    stats: {
      ...stats,
      percentUsedMinute: ((stats.requestsThisMinute / stats.minuteLimit) * 100).toFixed(1),
      percentUsedDaily: ((stats.requestsToday / stats.dailyLimit) * 100).toFixed(2)
    }
  });
});

module.exports = router;
