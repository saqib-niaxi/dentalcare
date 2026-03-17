const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Optional authentication middleware
 * Extracts user from JWT if present, but doesn't fail if missing
 * Sets req.user = null for guests
 */
const optionalAuth = async (req, res, next) => {
  req.user = null;

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];

      if (token && token !== 'null' && token !== 'undefined') {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('name email phone role');

          if (user) {
            req.user = user;
          }
        } catch (tokenError) {
          // Token invalid or expired - continue as guest
          console.log('Optional auth: Token invalid or expired');
        }
      }
    }
  } catch (error) {
    // Any error - continue as guest
    console.log('Optional auth error:', error.message);
  }

  next();
};

module.exports = { optionalAuth };
