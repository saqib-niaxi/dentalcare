const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getDoctorsByService,
  getDoctorAvailability,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllDoctorsAdmin
} = require('../controllers/doctorController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/service/:serviceId', getDoctorsByService);
router.get('/:id/availability', getDoctorAvailability);

// Admin routes (protected)
router.post('/', protect, admin, createDoctor);
router.put('/:id', protect, admin, updateDoctor);
router.delete('/:id', protect, admin, deleteDoctor);
router.get('/admin/all', protect, admin, getAllDoctorsAdmin);

module.exports = router;
