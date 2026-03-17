const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Upload image (admin only)
router.post('/image', protect, admin, upload.single('image'), uploadImage);

// Delete image (admin only)
router.delete('/image/:publicId', protect, admin, deleteImage);

module.exports = router;
