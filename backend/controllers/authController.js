const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');

// In-memory fallback demo users with valid bcrypt hashes (cost 10) for resilient offline testing
// Password for all demo accounts defaults to process.env.DEMO_PASSWORD or 'DemoPass@2026'
const DEFAULT_DEMO_HASH = bcrypt.hashSync(process.env.DEMO_PASSWORD || 'DemoPass@2026', 10);

const FALLBACK_DEMO_USERS = {
  admin: {
    username: 'admin',
    role: 'admin',
    linkedId: 'ADMIN_CHIEF_01',
    name: 'Academic Dean Office',
    department: 'Central Administration',
    college_id: 'C101',
    passwordHash: DEFAULT_DEMO_HASH
  },
  mentor: {
    username: 'mentor',
    role: 'mentor',
    linkedId: 'FAC_EEC_CSE_001',
    name: 'Dr. Kavitha Ramanathan',
    department: 'CSE',
    college_id: 'C101',
    passwordHash: DEFAULT_DEMO_HASH
  },
  student: {
    username: 'student',
    role: 'student',
    linkedId: 'STU_EEC_CSE_Y2_0001',
    name: 'Aravind Sundaram',
    department: 'CSE',
    college_id: 'C101',
    passwordHash: DEFAULT_DEMO_HASH
  },
  student2: {
    username: 'student2',
    role: 'student',
    linkedId: 'STU_KRIT_IT_Y3_3645',
    name: 'Siddharth Gopalakrishnan',
    department: 'IT',
    college_id: 'C102',
    passwordHash: DEFAULT_DEMO_HASH
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username and password are required'
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    let user = null;

    if (getDBStatus()) {
      user = await User.findOne({ username: cleanUsername });
    }

    // Check in-memory fallback if not in DB or DB offline
    if (!user && FALLBACK_DEMO_USERS[cleanUsername]) {
      user = FALLBACK_DEMO_USERS[cleanUsername];
    }

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Security Critical] JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server authentication misconfiguration' });
    }

    // Issue 1-hour signed JWT
    const tokenPayload = {
      username: user.username,
      role: user.role,
      linkedId: user.linkedId,
      name: user.name,
      collegeId: user.college_id
    };

    const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        role: user.role,
        linkedId: user.linkedId,
        name: user.name,
        department: user.department,
        collegeId: user.college_id
      }
    });
  } catch (err) {
    console.error('[Login Controller Error]', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication processing failed'
    });
  }
};

module.exports = {
  login,
  FALLBACK_DEMO_USERS
};
