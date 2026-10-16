/**
 * Main Express Application Entry Point
 * Phase 1: Student Dropout Prediction & Academic Intervention System
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');

const { checkEnv } = require('./scripts/check-env');

function assertConfig() {
  const result = checkEnv(process.env, { exitOnError: process.env.NODE_ENV !== 'test', silent: false });
  if (!result.valid) {
    throw new Error(`FATAL SECURITY ERROR: ERP configuration invalid: ${result.errors.join('; ')}`);
  }
}

// Enforce configuration check
assertConfig();

const app = express();
const PORT = process.env.PORT || 5000;

// C3. Proxy awareness: set Express trust proxy from env var (default 1 in production)
const trustProxyVal = process.env.TRUST_PROXY !== undefined
  ? (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1' ? 1 : (isNaN(Number(process.env.TRUST_PROXY)) ? process.env.TRUST_PROXY : Number(process.env.TRUST_PROXY)))
  : (process.env.NODE_ENV === 'production' ? 1 : false);
app.set('trust proxy', trustProxyVal);

// C2. CORS: read CORS_ORIGINS (comma separated). In production, only those origins are allowed and wildcard is rejected.
const rawCors = process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174';
const configuredOrigins = rawCors.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'production' && configuredOrigins.includes('*')) {
      const corsErr = new Error('CORS violation: Wildcard origin is forbidden in production.');
      corsErr.status = 403;
      return callback(corsErr);
    }
    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    const corsErr = new Error(`CORS violation: Origin '${origin}' is not authorized.`);
    corsErr.status = 403;
    return callback(corsErr);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// C6. Direct root health check (no auth)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'fsd-erp-backend',
    timestamp: new Date().toISOString()
  });
});


// Body Parsing Middleware
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request Logger (Development explainability)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Mount API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    project: 'AI-Based Student Academic Dropout Prediction & Intervention System',
    phase: 'Phase 1 - Secured ERP Service',
    auth: 'JWT Authentication Enabled',
    endpoints: [
      'POST /api/auth/login',
      'GET /api/health',
      'GET /api/students (protected)',
      'GET /api/students/:id (protected, student/mentor ownership)',
      'GET /api/students/:id/marks (protected, student/mentor ownership)',
      'GET /api/faculty/:id/students (protected, mentor ownership)',
      'GET /api/faculty (protected)',
      'GET /api/admin/summary (protected: admin only)',
      'GET /api/curriculum?branch=CSE&semester=4',
      'GET /api/colleges',
      'GET /api/branches'
    ]
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 403 ? 'Forbidden' : 'Internal Server Error',
    message: statusCode === 403 ? err.message : 'An unexpected server error occurred.'
  });
});

// Start Server
const startServer = async () => {
  try {
    assertConfig();
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`✓ Express Backend running on http://localhost:${PORT}`);
      console.log(`✓ REST API available at http://localhost:${PORT}/api`);
      console.log(`✓ Protected with JWT Auth & Role Authorization`);
      console.log(`======================================================\n`);
    });
    return server;
  } catch (err) {
    console.error('[Fatal Server Startup Error]', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.assertConfig = assertConfig;
module.exports.startServer = startServer;
