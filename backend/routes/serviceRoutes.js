const express = require('express');
const router = express.Router();
const {
  getServices,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route
router.get('/', getServices);

// Admin only routes
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

module.exports = router;
