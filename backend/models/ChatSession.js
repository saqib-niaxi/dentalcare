const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestId: {
    type: String,
    default: null
  },
  userContext: {
    type: String,
    enum: ['logged_in', 'registered_not_logged_in', 'new_guest', 'returning_guest'],
    default: 'new_guest'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-expire sessions after 2 hours of inactivity
chatSessionSchema.index({ lastMessageAt: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
