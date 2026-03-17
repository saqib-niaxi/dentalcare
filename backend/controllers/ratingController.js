const Rating = require('../models/Rating');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get all approved ratings for a doctor
// @route   GET /api/ratings/doctor/:doctorId
// @access  Public
exports.getDoctorRatings = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const ratings = await Rating.find({
      doctor: doctorId,
      status: 'approved'
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ ratings });
  } catch (error) {
    console.error('Get doctor ratings error:', error);
    res.status(500).json({ message: 'Failed to fetch ratings' });
  }
};

// @desc    Create a new rating
// @route   POST /api/ratings
// @access  Private (logged-in users only)
exports.createRating = async (req, res) => {
  try {
    const { doctorId, rating, review } = req.body;
    const userId = req.user._id;

    // Validation
    if (!doctorId || !rating) {
      return res.status(400).json({ message: 'Doctor and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user has already rated this doctor
    const existingRating = await Rating.findOne({
      doctor: doctorId,
      user: userId
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this doctor. Please edit your existing rating.' });
    }

    // Optional: Check if user has had an appointment with this doctor
    const hasAppointment = await Appointment.findOne({
      patient: userId,
      doctor: doctorId,
      status: 'completed'
    });

    // Create rating
    const newRating = new Rating({
      doctor: doctorId,
      user: userId,
      rating,
      review: review || '',
      status: 'pending' // Requires admin approval
    });

    await newRating.save();

    res.status(201).json({
      message: 'Rating submitted successfully! It will be visible after admin approval.',
      rating: newRating,
      hasAppointment: !!hasAppointment
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
};

// @desc    Update user's own rating
// @route   PUT /api/ratings/:id
// @access  Private
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    const existingRating = await Rating.findById(id);

    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user owns this rating
    if (existingRating.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only edit your own ratings' });
    }

    // Update rating
    existingRating.rating = rating !== undefined ? rating : existingRating.rating;
    existingRating.review = review !== undefined ? review : existingRating.review;
    existingRating.status = 'pending'; // Reset to pending on update

    await existingRating.save();

    res.json({
      message: 'Rating updated successfully! It will be reviewed by admin.',
      rating: existingRating
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ message: 'Failed to update rating' });
  }
};

// @desc    Delete user's own rating
// @route   DELETE /api/ratings/:id
// @access  Private
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findById(id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user owns this rating
    if (rating.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own ratings' });
    }

    await rating.remove();

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Failed to delete rating' });
  }
};

// @desc    Get user's rating for a specific doctor
// @route   GET /api/ratings/my-rating/:doctorId
// @access  Private
exports.getMyRating = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({
      doctor: doctorId,
      user: userId
    });

    res.json({ rating });
  } catch (error) {
    console.error('Get my rating error:', error);
    res.status(500).json({ message: 'Failed to fetch rating' });
  }
};

// ========== ADMIN ROUTES ==========

// @desc    Get all ratings (for admin)
// @route   GET /api/ratings/admin/all
// @access  Private/Admin
exports.getAllRatings = async (req, res) => {
  try {
    const { status } = req.query;

    const query = status && status !== 'all' ? { status } : {};

    const ratings = await Rating.find(query)
      .populate('user', 'name email')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.json({ ratings });
  } catch (error) {
    console.error('Get all ratings error:', error);
    res.status(500).json({ message: 'Failed to fetch ratings' });
  }
};

// @desc    Approve a rating
// @route   PUT /api/ratings/admin/:id/approve
// @access  Private/Admin
exports.approveRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    rating.status = 'approved';
    await rating.save();

    res.json({ message: 'Rating approved successfully', rating });
  } catch (error) {
    console.error('Approve rating error:', error);
    res.status(500).json({ message: 'Failed to approve rating' });
  }
};

// @desc    Reject a rating
// @route   PUT /api/ratings/admin/:id/reject
// @access  Private/Admin
exports.rejectRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const rating = await Rating.findById(id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    rating.status = 'rejected';
    rating.rejectionReason = reason || '';
    await rating.save();

    res.json({ message: 'Rating rejected successfully', rating });
  } catch (error) {
    console.error('Reject rating error:', error);
    res.status(500).json({ message: 'Failed to reject rating' });
  }
};

// @desc    Delete a rating (admin)
// @route   DELETE /api/ratings/admin/:id
// @access  Private/Admin
exports.deleteRatingAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    await rating.remove();

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Failed to delete rating' });
  }
};
