const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Requires valid JWT Bearer token
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please sign in to access this feature',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movforyou_secret_key_2026');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please sign in again.' });
  }
};

// Authorize Admin only
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required for this action',
      });
    }
    next();
  };
};

// Optional auth (for public pages to check user state)
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'movforyou_secret_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {}
  }
  next();
};