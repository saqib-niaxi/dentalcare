const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['live', 'appointment'],
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    default: null
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['patient', 'admin'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ appointment: 1, createdAt: 1 });
messageSchema.index({ appointment: 1, isRead: 1, senderRole: 1 });
messageSchema.index({ conversation: 1, isRead: 1, senderRole: 1 });

module.exports = mongoose.model('Message', messageSchema);
