const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
}, { timestamps: true });

// One active conversation per patient
conversationSchema.index(
  { patient: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('Conversation', conversationSchema);
