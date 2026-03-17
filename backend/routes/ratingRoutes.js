const express = require('express');
const router = express.Router();
const {
  getDoctorRatings,
  createRating,
  updateRating,
  deleteRating,
  getMyRating,
  getAllRatings,
  approveRating,
  rejectRating,
  deleteRatingAdmin
} = require('../controllers/ratingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/doctor/:doctorId', getDoctorRatings);

// Protected routes (logged-in users)
router.post('/', protect, createRating);
router.get('/my-rating/:doctorId', protect, getMyRating);
router.put('/:id', protect, updateRating);
router.delete('/:id', protect, deleteRating);

// Admin routes
router.get('/admin/all', protect, admin, getAllRatings);
router.put('/admin/:id/approve', protect, admin, approveRating);
router.put('/admin/:id/reject', protect, admin, rejectRating);
router.delete('/admin/:id', protect, admin, deleteRatingAdmin);

module.exports = router;
