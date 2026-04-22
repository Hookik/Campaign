/**
 * Authentication Middleware
 *
 * INTEGRATION POINT: This should connect to your existing auth system.
 * Replace the token verification logic with your actual JWT/session handling.
 */

const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');

/**
 * Require authenticated user
 */
function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    // ─── INTEGRATION POINT ───
    // Replace with your existing Hookik JWT verification:
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hookik-secret');

    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role, // 'creator', 'business', 'admin'
      businessId: decoded.businessId,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    next(err);
  }
}

/**
 * Require admin role
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}

/**
 * Require business role
 */
function requireBusiness(req, res, next) {
  if (req.user?.role !== 'business' && req.user?.role !== 'admin') {
    return next(ApiError.forbidden('Business access required'));
  }
  next();
}

/**
 * Require creator role
 */
function requireCreator(req, res, next) {
  if (req.user?.role !== 'creator' && req.user?.role !== 'admin') {
    return next(ApiError.forbidden('Creator access required'));
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireBusiness, requireCreator };
