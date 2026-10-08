const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const facultyController = require('../controllers/facultyController');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { aiServiceClient } = require('../services/aiServiceClient');
const csvProvider = require('../utils/csvDataProvider');
const Curriculum = require('../models/Curriculum');
const Student = require('../models/Student');
const { getDBStatus } = require('../config/db');

// --- 1. Authentication Route (Rate-limited) ---
router.post('/auth/login', authLimiter, authController.login);

// --- 2. Student Endpoints (Protected by JWT & Ownership) ---
router.get('/students', requireAuth, studentController.getStudents);
router.get('/students/:id', requireAuth, studentController.getStudentById);
router.get('/students/:id/marks', requireAuth, studentController.getStudentMarks);

// --- 3. Faculty / Mentor Endpoints (Protected) ---
router.get('/faculty/:id/students', requireAuth, facultyController.getMentorStudents);
router.get('/faculty', requireAuth, facultyController.getAllFaculty);

// --- 4. Admin Aggregate Endpoint (Admin Only) ---
router.get('/admin/summary', requireAuth, requireRole('admin'), adminController.getAdminSummary);

// --- 5. Standalone AI Academic Intervention Chatbot Endpoint (Protected) ---
const handleChatbotRequest = async (req, res) => {
  try {
    const { message, student_context } = req.body;
    let targetStudentId = req.body.studentId;

    // Student role can only chat as themselves
    if (req.user && req.user.role === 'student') {
      targetStudentId = req.user.linkedId;
    }

    let context = student_context || {};

    if (targetStudentId && (!context.student_name || !context.attendance_pct)) {
      let student = null;
      if (getDBStatus()) {
        student = await Student.findOne({ student_id: targetStudentId });
      }
      if (!student) {
        const allStudents = await csvProvider.getStudentsData();
        student = allStudents.find(s => s.student_id === targetStudentId);
      }
      if (student) {
        // Enforce ownership if student role
        if (req.user && req.user.role === 'student' && student.student_id !== req.user.linkedId) {
          return res.status(403).json({ error: 'Forbidden', message: 'Students cannot query other students context' });
        }

        context = {
          student_id: student.student_id,
          student_name: student.student_name,
          department: student.department,
          year_of_study: student.year_of_study,
          attendance_pct: student.attendance_pct,
          backlogs_count: student.backlogs_count,
          overall_gpa: student.overall_gpa,
          dropout_risk_label: student.dropout_risk_label || 'Low',
          mentor_name: student.mentor ? (student.mentor.name || student.mentor) : 'Faculty Mentor',
          ...context
        };
      }
    }

    const chatResult = await aiServiceClient.sendChatMessage(message, context);
    return res.json(chatResult);
  } catch (err) {
    console.error('[Chat Endpoint Error]', err);
    return res.status(500).json({ error: 'Chat service error', message: err.message });
  }
};

router.post('/chat', requireAuth, handleChatbotRequest);
router.post('/chat/student-advisor', requireAuth, handleChatbotRequest);

// --- 6. Public Lookup Endpoints ---

// Curriculum
router.get('/curriculum', async (req, res) => {
  try {
    const { branch, semester } = req.query;

    if (getDBStatus()) {
      const query = {};
      if (branch) query.Branch = branch;
      if (semester) query.Semester = Number(semester);
      const list = await Curriculum.find(query);
      return res.json({ source: 'mongodb', total: list.length, data: list });
    }

    let list = await csvProvider.getCurriculumData();
    if (branch) list = list.filter(c => c.Branch === branch);
    if (semester) list = list.filter(c => c.Semester === Number(semester));
    return res.json({ source: 'curriculum_json', total: list.length, data: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve curriculum', details: err.message });
  }
});

// Dynamic Branch List
router.get('/branches', async (req, res) => {
  try {
    if (getDBStatus()) {
      const branches = await Student.distinct('department');
      return res.json({ source: 'mongodb', data: branches.sort() });
    }
    const curriculum = await csvProvider.getCurriculumData();
    const branches = [...new Set(curriculum.map(c => c.Branch))].sort();
    return res.json({ source: 'curriculum_json', data: branches });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve branches', details: err.message });
  }
});

// Dynamic College List
router.get('/colleges', async (req, res) => {
  try {
    const data = [
      { college_id: 'C101', college_name: 'Apex Engineering College (Autonomous)' },
      { college_id: 'C102', college_name: 'Kavery Residential Institute of Technology' },
      { college_id: 'C103', college_name: 'Modern Institute of Science & Technology' },
      { college_id: 'C104', college_name: 'Sahyadri Deemed University' }
    ];
    return res.json({ source: 'institution_directory', data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve colleges', details: err.message });
  }
});

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'FSD College ERP - Standalone AI Integration',
    database: getDBStatus() ? 'mongodb_connected' : 'csv_dataset_mode',
    ai_service_url: process.env.AI_SERVICE_BASE_URL || 'http://localhost:5001',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
