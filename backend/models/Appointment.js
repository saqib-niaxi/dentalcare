const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for chatbot/guest bookings
  },
  // Guest info for chatbot bookings (when no registered user)
  guestInfo: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
    // Optional - allows consultations without a specific service
  },
  serviceType: {
    type: String // For chatbot bookings: "Routine Cleaning", "Emergency", etc.
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  source: {
    type: String,
    enum: ['website', 'chatbot', 'phone', 'walk-in'],
    default: 'website'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
