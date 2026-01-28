const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  getPatients,
  getPatientById,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.get('/patients', protect, admin, getPatients);
router.get('/patients/:id', protect, admin, getPatientById);

module.exports = router;