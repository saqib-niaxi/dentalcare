const geminiService = require('../services/geminiService');
const sessionManager = require('../services/chatSessionManager');
const User = require('../models/User');

// Input validation and sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  // Remove potential XSS
  let sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();

  // Limit length
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }

  return sanitized;
};

// Detect user context based on request
const detectUserContext = async (req, sessionId) => {
  // If user is logged in
  if (req.user) {
    return {
      context: 'logged_in',
      userData: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      }
    };
  }

  // Check session for context
  const sessionResult = await sessionManager.getSession(sessionId);
  if (sessionResult.success) {
    return {
      context: sessionResult.session.userContext,
      userData: null
    };
  }

  return { context: 'new_guest', userData: null };
};

/**
 * @desc    Handle chatbot message
 * @route   POST /api/chatbot/message
 * @access  Public (with optional auth)
 */
exports.handleMessage = async (req, res) => {
  try {
    const { sessionId, message, guestId } = req.body;

    // Validate message
    const sanitizedMessage = sanitizeInput(message);
    if (!sanitizedMessage) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get or create session
    const sessionResult = await sessionManager.getOrCreateSession(
      sessionId,
      req.user?._id,
      guestId
    );

    if (!sessionResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize chat session'
      });
    }

    const currentSessionId = sessionResult.session.sessionId;

    // Save user message
    await sessionManager.saveMessage(currentSessionId, 'user', sanitizedMessage);

    // Get user context
    const { context, userData } = await detectUserContext(req, currentSessionId);

    // Get conversation history for context
    const conversationHistory = await sessionManager.getMessagesForContext(currentSessionId);

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: sanitizedMessage
    });

    // Send to Gemini
    const aiResponse = await geminiService.sendMessage(conversationHistory, context, userData);

    // Save assistant response
    await sessionManager.saveMessage(
      currentSessionId,
      'assistant',
      aiResponse.content,
      aiResponse.functionCalls,
      aiResponse.tokens,
      aiResponse.latency
    );

    res.json({
      success: true,
      sessionId: currentSessionId,
      message: aiResponse.content,
      functionCalls: aiResponse.functionCalls,
      isNewSession: sessionResult.isNew,
      userContext: context
    });
  } catch (error) {
    console.error('Chatbot handle message error:', error);

    res.status(500).json({
      success: false,
      message: "I apologize, but I'm having trouble right now. Please try again or call us at +92 320 2067666.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get chat session history
 * @route   GET /api/chatbot/session/:sessionId
 * @access  Public (with optional auth)
 */
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const result = await sessionManager.getSession(sessionId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      session: result.session,
      messages: result.messages
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session'
    });
  }
};

/**
 * @desc    Clear chat session
 * @route   DELETE /api/chatbot/session/:sessionId
 * @access  Public (with optional auth)
 */
exports.clearSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const result = await sessionManager.clearSession(sessionId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to clear session'
      });
    }

    res.json({
      success: true,
      message: 'Session cleared successfully'
    });
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear session'
    });
  }
};

/**
 * @desc    Create new session
 * @route   POST /api/chatbot/session
 * @access  Public (with optional auth)
 */
exports.createSession = async (req, res) => {
  try {
    const { guestId } = req.body;

    const result = await sessionManager.createSession(
      req.user?._id,
      guestId
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create session'
      });
    }

    res.json({
      success: true,
      sessionId: result.session.sessionId,
      userContext: result.session.userContext,
      guestId: result.session.guestId
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
};

/**
 * @desc    Update session with user login
 * @route   PUT /api/chatbot/session/:sessionId/auth
 * @access  Private (requires auth)
 */
exports.updateSessionAuth = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await sessionManager.updateUserContext(
      sessionId,
      req.user._id,
      'logged_in'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update session'
      });
    }

    res.json({
      success: true,
      message: 'Session updated with authentication',
      userContext: 'logged_in'
    });
  } catch (error) {
    console.error('Update session auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session'
    });
  }
};

/**
 * @desc    Get quick info (services, hours, etc.)
 * @route   GET /api/chatbot/quick-info
 * @access  Public
 */
exports.getQuickInfo = async (req, res) => {
  try {
    const { type } = req.query;

    switch (type) {
      case 'services':
        const services = geminiService.getServices('all');
        res.json({ success: true, data: services });
        break;

      case 'hours':
        res.json({
          success: true,
          data: {
            weekdays: 'Monday-Friday: 9:00 AM - 6:00 PM',
            saturday: 'Saturday: 9:00 AM - 2:00 PM',
            sunday: 'Sunday: Closed'
          }
        });
        break;

      case 'contact':
        res.json({
          success: true,
          data: {
            phone: geminiService.CLINIC_INFO.phone,
            emergency: geminiService.CLINIC_INFO.emergencyPhone,
            email: geminiService.CLINIC_INFO.email,
            address: geminiService.CLINIC_INFO.location
          }
        });
        break;

      default:
        res.json({
          success: true,
          data: geminiService.CLINIC_INFO
        });
    }
  } catch (error) {
    console.error('Get quick info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get info'
    });
  }
};
