const { v4: uuidv4 } = require('uuid');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

// Create a new chat session
async function createSession(userId = null, guestId = null) {
  try {
    const sessionId = uuidv4();

    let userContext = 'new_guest';
    if (userId) {
      userContext = 'logged_in';
    } else if (guestId) {
      // Check if guest has previous sessions
      const previousSession = await ChatSession.findOne({ guestId });
      if (previousSession) {
        userContext = 'returning_guest';
      }
    }

    const session = new ChatSession({
      sessionId,
      user: userId,
      guestId: guestId || uuidv4(),
      userContext,
      status: 'active',
      messageCount: 0
    });

    await session.save();
    console.log(`Created new chat session: ${sessionId}`);

    return {
      success: true,
      session: {
        sessionId: session.sessionId,
        userContext: session.userContext,
        guestId: session.guestId
      }
    };
  } catch (error) {
    console.error('Create session error:', error);
    return { success: false, error: error.message };
  }
}

// Get existing session or create new one
async function getOrCreateSession(sessionId, userId = null, guestId = null) {
  try {
    if (sessionId) {
      const session = await ChatSession.findOne({ sessionId, status: 'active' });

      if (session) {
        // Update user context if user just logged in
        if (userId && !session.user) {
          session.user = userId;
          session.userContext = 'logged_in';
          await session.save();
        }

        return {
          success: true,
          session: {
            sessionId: session.sessionId,
            userContext: session.userContext,
            guestId: session.guestId,
            messageCount: session.messageCount
          },
          isNew: false
        };
      }
    }

    // Create new session
    const newSession = await createSession(userId, guestId);
    return { ...newSession, isNew: true };
  } catch (error) {
    console.error('Get or create session error:', error);
    return { success: false, error: error.message };
  }
}

// Get session with messages
async function getSession(sessionId, limit = 50) {
  try {
    const session = await ChatSession.findOne({ sessionId }).populate('user', 'name email phone');

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const messages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    return {
      success: true,
      session: {
        sessionId: session.sessionId,
        userContext: session.userContext,
        user: session.user,
        messageCount: session.messageCount,
        createdAt: session.createdAt
      },
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt,
        functionCalls: m.functionCalls
      }))
    };
  } catch (error) {
    console.error('Get session error:', error);
    return { success: false, error: error.message };
  }
}

// Save a message to the session
async function saveMessage(sessionId, role, content, functionCalls = [], tokens = {}, latency = 0) {
  try {
    const message = new ChatMessage({
      sessionId,
      role,
      content,
      functionCalls,
      tokens,
      latency
    });

    await message.save();

    // Update session
    await ChatSession.findOneAndUpdate(
      { sessionId },
      {
        $inc: { messageCount: 1 },
        $set: { lastMessageAt: new Date() }
      }
    );

    return { success: true, messageId: message._id };
  } catch (error) {
    console.error('Save message error:', error);
    return { success: false, error: error.message };
  }
}

// Get messages for AI context (with compression for long chats)
async function getMessagesForContext(sessionId, maxMessages = 20) {
  try {
    const messages = await ChatMessage.find({
      sessionId,
      role: { $in: ['user', 'assistant'] }
    })
      .sort({ createdAt: -1 })
      .limit(maxMessages)
      .lean();

    // Reverse for chronological order
    messages.reverse();

    // If we have too many messages, summarize older ones
    if (messages.length >= maxMessages) {
      // Keep last 10 messages in full, summarize rest
      const recentMessages = messages.slice(-10);
      const olderMessages = messages.slice(0, -10);

      // Create a summary of older messages
      const summaryContent = `[Previous conversation summary: User discussed ${olderMessages.length} messages about dental services and appointments]`;

      return [
        { role: 'system', content: summaryContent },
        ...recentMessages.map(m => ({ role: m.role, content: m.content }))
      ];
    }

    return messages.map(m => ({ role: m.role, content: m.content }));
  } catch (error) {
    console.error('Get messages for context error:', error);
    return [];
  }
}

// Clear session
async function clearSession(sessionId) {
  try {
    // Delete all messages
    await ChatMessage.deleteMany({ sessionId });

    // Update session status
    await ChatSession.findOneAndUpdate(
      { sessionId },
      {
        status: 'completed',
        messageCount: 0
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Clear session error:', error);
    return { success: false, error: error.message };
  }
}

// Update user context (e.g., when user logs in)
async function updateUserContext(sessionId, userId, userContext) {
  try {
    await ChatSession.findOneAndUpdate(
      { sessionId },
      {
        user: userId,
        userContext
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Update user context error:', error);
    return { success: false, error: error.message };
  }
}

// Get session stats
async function getSessionStats(sessionId) {
  try {
    const session = await ChatSession.findOne({ sessionId });
    if (!session) return null;

    const messageStats = await ChatMessage.aggregate([
      { $match: { sessionId } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          avgLatency: { $avg: '$latency' },
          totalInputTokens: { $sum: '$tokens.input' },
          totalOutputTokens: { $sum: '$tokens.output' }
        }
      }
    ]);

    return {
      sessionId,
      createdAt: session.createdAt,
      messageCount: session.messageCount,
      userContext: session.userContext,
      stats: messageStats
    };
  } catch (error) {
    console.error('Get session stats error:', error);
    return null;
  }
}

module.exports = {
  createSession,
  getOrCreateSession,
  getSession,
  saveMessage,
  getMessagesForContext,
  clearSession,
  updateUserContext,
  getSessionStats
};
