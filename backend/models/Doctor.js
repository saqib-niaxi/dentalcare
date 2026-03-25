const mongoose = require('mongoose');

const workingDaySchema = new mongoose.Schema({
  isWorking: { type: Boolean, default: true },
  start: { type: String, default: '09:00' },
  end: { type: String, default: '18:00' },
  breakStart: { type: String },
  breakEnd: { type: String }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: 'default-doctor.jpg'
  },
  bio: {
    type: String,
    default: ''
  },

  // Professional details
  specialization: {
    type: String,
    required: true,
    enum: [
      'General Dentist',
      'Orthodontist',
      'Oral Surgeon',
      'Periodontist',
      'Endodontist',
      'Pediatric Dentist',
      'Cosmetic Dentist'
    ]
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  qualifications: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Services this doctor provides
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],

  // Working schedule (can differ per doctor)
  workingDays: {
    monday: {
      type: workingDaySchema,
      default: {
        isWorking: true,
        start: '09:00',
        end: '18:00',
        breakStart: '13:00',
        breakEnd: '14:00'
      }
    },
    tuesday: {
      type: workingDaySchema,
      default: {
        isWorking: true,
        start: '09:00',
        end: '18:00',
        breakStart: '13:00',
        breakEnd: '14:00'
      }
    },
    wednesday: {
      type: workingDaySchema,
      default: {
        isWorking: true,
        start: '09:00',
        end: '18:00',
        breakStart: '13:00',
        breakEnd: '14:00'
      }
    },
    thursday: {
      type: workingDaySchema,
      default: {
        isWorking: true,
        start: '09:00',
        end: '18:00',
        breakStart: '13:00',
        breakEnd: '14:00'
      }
    },
    friday: {
      type: workingDaySchema,
      default: {
        isWorking: true,
        start: '09:00',
        end: '18:00',
        breakStart: '13:00',
        breakEnd: '14:00'
      }
    },
    saturday: {
      type: workingDaySchema,
      default: {
        isWorking: true,
        start: '09:00',
        end: '14:00'
      }
    },
    sunday: {
      type: workingDaySchema,
      default: {
        isWorking: false
      }
    }
  },

  isActive: {
    type: Boolean,
    default: true
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
doctorSchema.index({ isActive: 1 });
doctorSchema.index({ services: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
