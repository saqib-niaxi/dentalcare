const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendOTPEmail, generateOTP } = require('../utils/email');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate tokens and hashes
const generateTokenAndHash = (payload) => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return { token, hash, expires };
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Generate verification token
    const { token: verificationToken, hash: verificationHash, expires: verificationExpires } = generateTokenAndHash(email);

    const user = new User({
      name,
      email,
      password,
      phone,
      emailVerificationToken: verificationHash,
      emailVerificationTokenExpires: verificationExpires
    });

    await user.save();

    // Send verification OTP
    const otp = generateOTP();
    await sendOTPEmail(
      email,
      otp,
      'Verify Your Email - Dr. Ahmed Dental Care',
      `Welcome ${name}! Please use the OTP below to verify your email address:`
    );

    // Store OTP temporarily (in production, use Redis)
    user.tempOTP = otp;
    user.tempOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification OTP.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    if (user.tempOTP !== otp || Date.now() > user.tempOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.isEmailVerified = true;
    user.tempOTP = undefined;
    user.tempOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resend OTP for email verification
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    const otp = generateOTP();
    await sendOTPEmail(
      email,
      otp,
      'Verify Your Email - Dr. Ahmed Dental Care',
      `Here is your new verification OTP:`
    );

    user.tempOTP = otp;
    user.tempOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const otp = generateOTP();
    await sendOTPEmail(
      email,
      otp,
      'Password Reset OTP - Dr. Ahmed Dental Care',
      `You requested a password reset. Use the OTP below to reset your password:`
    );

    // Store OTP temporarily
    user.tempOTP = otp;
    user.tempOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.tempOTP !== otp || Date.now() > user.tempOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.password = password;
    user.tempOTP = undefined;
    user.tempOTPExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all patients (admin only)
// @route   GET /api/auth/patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient by ID (admin only)
// @route   GET /api/auth/patients/:id
exports.getPatientById = async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' })
      .select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
