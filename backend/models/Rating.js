const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate ratings from same user for same doctor
ratingSchema.index({ doctor: 1, user: 1 }, { unique: true });

// Update doctor's average rating when a rating is approved/rejected
ratingSchema.post('save', async function() {
  if (this.status === 'approved' || this.status === 'rejected') {
    await updateDoctorRating(this.doctor);
  }
});

ratingSchema.post('remove', async function() {
  await updateDoctorRating(this.doctor);
});

async function updateDoctorRating(doctorId) {
  const Rating = mongoose.model('Rating');
  const Doctor = mongoose.model('Doctor');

  const stats = await Rating.aggregate([
    { $match: { doctor: doctorId, status: 'approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const avgRating = stats.length > 0 ? stats[0].avgRating : 0;

  await Doctor.findByIdAndUpdate(doctorId, {
    rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    ratingCount: stats.length > 0 ? stats[0].count : 0
  });
}

module.exports = mongoose.model('Rating', ratingSchema);
