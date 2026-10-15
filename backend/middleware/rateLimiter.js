const rateLimit = require('express-rate-limit');

// Rate limiter for authentication login route (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 login requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Too Many Requests',
    message: 'Too many login attempts. Please wait 1 minute before trying again.'
  }
});

module.exports = {
  authLimiter
};
