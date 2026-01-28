const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
    // Optional - allows consultations without a specific service
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
