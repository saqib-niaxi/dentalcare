const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getMyAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getAllPatients,
  rescheduleAppointment
} = require('../controllers/appointmentController');
const {
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCounts
} = require('../controllers/appointmentMessageController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected route - only logged-in users can book
router.post('/', protect, createAppointment);

// Message routes (place unread-counts BEFORE /:id routes)
router.get('/messages/unread-counts', protect, getUnreadCounts);
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessage);
router.put('/:id/messages/read', protect, markAsRead);

// Protected routes
router.get('/my-appointments', protect, getMyAppointments);
router.get('/all-patients', protect, admin, getAllPatients);
router.get('/', protect, admin, getAppointments);
router.put('/:id/reschedule', protect, rescheduleAppointment);
router.put('/:id/status', protect, admin, updateAppointmentStatus);
router.delete('/:id', protect, admin, deleteAppointment);

module.exports = router;