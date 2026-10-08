const jwt = require('jsonwebtoken');

/**
 * Require valid JWT in Authorization: Bearer <token>
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token missing or invalid format'
    });
  }

  const token = authHeader.substring(7).trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('[Security Critical] JWT_SECRET is not configured on server');
    return res.status(500).json({ error: 'Server authentication misconfiguration' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, username, role, linkedId }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token has expired'
      });
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token is invalid or tampered'
    });
  }
};

/**
 * Enforce role-based access control
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient privileges for role '${req.user.role}'. Required: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
