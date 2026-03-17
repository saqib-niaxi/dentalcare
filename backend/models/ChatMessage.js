const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  functionCalls: [{
    name: String,
    params: mongoose.Schema.Types.Mixed,
    result: mongoose.Schema.Types.Mixed
  }],
  tokens: {
    input: { type: Number, default: 0 },
    output: { type: Number, default: 0 }
  },
  latency: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient session message retrieval
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
