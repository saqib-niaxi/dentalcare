const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getMyAppointments,
  updateAppointmentStatus,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected route - only logged-in users can book
router.post('/', protect, createAppointment);

// Protected routes
router.get('/my-appointments', protect, getMyAppointments);
router.get('/', protect, admin, getAppointments);
router.put('/:id/status', protect, admin, updateAppointmentStatus);
router.delete('/:id', protect, admin, deleteAppointment);

module.exports = router;