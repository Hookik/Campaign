/**
 * Authentication Middleware
 *
 * INTEGRATION POINT: This should connect to your existing auth system.
 * Replace the token verification logic with your actual JWT/session handling.
 */

const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');

// Read JWT secret at call time (not module load time) so dotenv has a chance to load first
function getJwtSecret() {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'hookik-dev-secret');
  if (!secret) {
    console.error('FATAL: JWT_SECRET environment variable is required in production');
    process.exit(1);
  }
  return secret;
}

/**
 * Require authenticated user
 */
function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    const decoded = jwt.verify(token, getJwtSecret());

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
