const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const facultyController = require('../controllers/facultyController');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const integrationController = require('../controllers/integrationController');
const meetingRequestController = require('../controllers/meetingRequestController');
const mentorNoteController = require('../controllers/mentorNoteController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { serviceKeyAuth } = require('../middleware/serviceKeyAuth');
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

// --- 2b. Mentor Notes Endpoints (Protected: Admin & Mentor) ---
router.get('/students/:id/notes', requireAuth, requireRole('admin', 'mentor'), mentorNoteController.getNotes);
router.post('/students/:id/notes', requireAuth, requireRole('admin', 'mentor'), mentorNoteController.createNote);
router.put('/students/:id/notes', requireAuth, requireRole('admin', 'mentor'), mentorNoteController.upsertNote);
router.delete('/students/:id/notes/:noteId', requireAuth, requireRole('admin', 'mentor'), mentorNoteController.deleteNote);

// --- 3. Faculty / Mentor Endpoints (Protected) ---
router.get('/faculty/:id/students', requireAuth, facultyController.getMentorStudents);
router.get('/faculty', requireAuth, facultyController.getAllFaculty);

// --- 4. Admin Aggregate Endpoint (Admin Only) ---
router.get('/admin/summary', requireAuth, requireRole('admin'), adminController.getAdminSummary);

// --- 4b. ML Model Metrics Proxy (Admin & Mentor) ---
router.get('/ml/metrics', requireAuth, requireRole('admin', 'mentor'), async (req, res) => {
  try {
    const raw = await aiServiceClient.getMetrics();
    if (!raw) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'AI prediction service metrics are currently unavailable'
      });
    }

    const classesObj = raw.classes || {};
    const classesList = Array.isArray(raw.classes)
      ? raw.classes
      : (typeof classesObj === 'object' ? Object.keys(classesObj) : ['Low', 'Medium', 'High']);

    let precisionMacro = raw.precision_macro;
    let recallMacro = raw.recall_macro;
    if (precisionMacro == null && typeof classesObj === 'object' && !Array.isArray(classesObj)) {
      const pVals = Object.values(classesObj).map(c => c?.precision).filter(v => typeof v === 'number');
      if (pVals.length > 0) precisionMacro = pVals.reduce((a, b) => a + b, 0) / pVals.length;
    }
    if (recallMacro == null && typeof classesObj === 'object' && !Array.isArray(classesObj)) {
      const rVals = Object.values(classesObj).map(c => c?.recall).filter(v => typeof v === 'number');
      if (rVals.length > 0) recallMacro = rVals.reduce((a, b) => a + b, 0) / rVals.length;
    }

    let topFeatures = [];
    if (Array.isArray(raw.top_feature_importances)) {
      topFeatures = raw.top_feature_importances;
    } else if (Array.isArray(raw.feature_importance)) {
      topFeatures = raw.feature_importance.map(f => [f.feature || f.name, f.importance || f.value]);
    }

    const mapped = {
      model_type: raw.model_name || raw.model_type || 'XGBoostClassifier',
      accuracy: raw.accuracy != null ? Number(raw.accuracy) : null,
      precision_macro: precisionMacro != null ? Number(precisionMacro) : null,
      recall_macro: recallMacro != null ? Number(recallMacro) : null,
      f1_macro: raw.f1_macro != null ? Number(raw.f1_macro) : (raw.macro_f1 != null ? Number(raw.macro_f1) : null),
      confusion_matrix: raw.confusion_matrix || null,
      classes: classesList,
      top_feature_importances: topFeatures,
      training_samples: raw.data_summary?.total_students ? (raw.data_summary.total_students - (raw.data_summary.held_out_test_set || 1840)) : (raw.training_samples || 7360),
      test_samples: raw.data_summary?.held_out_test_set || raw.test_samples || 1840
    };

    return res.json(mapped);
  } catch (err) {
    console.error('[ML Metrics Route Error]', err);
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Failed to communicate with AI prediction service'
    });
  }
});

// --- 5. Standalone AI Academic Intervention Chatbot Endpoint (Protected) ---
const handleChatbotRequest = async (req, res) => {
  try {
    const { message, student_context } = req.body;
    let targetStudentId = req.body.studentId;

    // Student role can only chat as themselves
    if (req.user && req.user.role === 'student') {
      targetStudentId = req.user.linkedId;
    }

    // Special handling for Mentor role:
    if (req.user && req.user.role === 'mentor' && !targetStudentId) {
      const mentorId = req.user.linkedId;
      const lowerMsg = (message || '').toLowerCase();

      // 1. Fetch mentor's mentees
      let mentees = [];
      if (getDBStatus()) {
        mentees = await Student.find({ mentor_id: mentorId }).sort({ dropout_risk_score: -1 });
      }
      if (!mentees || mentees.length === 0) {
        const allStudents = await csvProvider.getStudentsData();
        mentees = allStudents.filter(s => s.mentor_id === mentorId || s.mentor?.id === mentorId);
      }

      // 2. Fetch mentor's meeting requests
      let meetings = [];
      if (getDBStatus()) {
        const MeetingRequest = require('../models/MeetingRequest');
        meetings = await MeetingRequest.find({ mentor_id: mentorId }).sort({ urgency: -1, createdAt: -1 });
      } else {
        const { inMemoryRequests } = require('../controllers/integrationController');
        meetings = Array.from(inMemoryRequests.values()).filter(r => r.mentor_id === mentorId);
      }

      // Build student name map for meetings
      const nameMap = new Map();
      mentees.forEach(m => nameMap.set(m.student_id, m.student_name));

      // CASE A: Schedule & Upcoming Meetings
      if (/(meeting|schedule|upcoming|appointment|calendar|slot)/i.test(lowerMsg)) {
        const scheduled = meetings.filter(m => m.status === 'scheduled' || m.scheduled_at);
        const pending = meetings.filter(m => m.status === 'new' || m.status === 'acknowledged');

        let reply = `### 📅 Faculty Mentorship Schedule & Meetings\n\n`;
        if (scheduled.length > 0) {
          reply += `**Confirmed Upcoming Meetings (${scheduled.length}):**\n`;
          scheduled.forEach((m, idx) => {
            const stu = m.student_name || nameMap.get(m.student_id) || m.student_id;
            const dateStr = m.scheduled_at ? new Date(m.scheduled_at).toLocaleDateString() : 'Upcoming Tutorial Hour';
            reply += `${idx + 1}. **${stu}** (${m.student_id}) — ${dateStr}\n   *Topic*: ${m.reason_short}\n`;
          });
          reply += `\n`;
        } else {
          reply += `You currently have **no confirmed meetings scheduled** for today.\n\n`;
        }

        if (pending.length > 0) {
          reply += `**⏳ Pending Mentee Requests Awaiting Your Confirmation (${pending.length}):**\n`;
          pending.forEach((m, idx) => {
            const stu = m.student_name || nameMap.get(m.student_id) || m.student_id;
            const urgencyIcon = m.urgency === 'urgent' ? '🚨 **URGENT**' : '📌 Normal';
            reply += `${idx + 1}. **${stu}** (${m.student_id}) — ${urgencyIcon}: ${m.reason_short}\n`;
          });
          reply += `\n*Action*: You can confirm time slots directly in the **Meetings** tab or through your notification bell 🔔.`;
        } else {
          reply += `There are **no pending meeting requests** awaiting review.`;
        }

        return res.json({
          reply,
          source: 'faculty_copilot',
          disclaimer: 'AI academic assistant. Grounded in faculty mentorship roster and meeting schedule records.'
        });
      }

      // CASE B: Students needing help & support / Attendance < 75% / High Risk / Arrears
      if (/(help|support|attendance|75%|<75|low attendance|risk|high risk|backlog|arrear|struggling|deficit|failing)/i.test(lowerMsg)) {
        const lowAtt = mentees.filter(m => Number(m.attendance_pct) < 75 || m.low_attendance_flag === 1);
        const highRisk = mentees.filter(m => m.dropout_risk_label === 'High');

        let reply = `### 🚨 Mentees Requiring Immediate Support & Intervention\n\n`;

        if (lowAtt.length > 0) {
          reply += `**⚠️ Attendance Deficit (<75% Anna University Cutoff - ${lowAtt.length} Students):**\n`;
          lowAtt.forEach((m, idx) => {
            reply += `${idx + 1}. **${m.student_name}** (${m.student_id}) — Attendance: **${m.attendance_pct}%** ⚠️ | Arrears: **${m.backlogs_count || 0}** | Risk: **${m.dropout_risk_label || 'Moderate'}**\n`;
          });
          reply += `\n`;
        } else {
          reply += `✅ All mentees in your cohort currently meet or exceed the 75% attendance threshold.\n\n`;
        }

        if (highRisk.length > 0) {
          reply += `**🚩 High Dropout Risk Students (${highRisk.length} Students):**\n`;
          highRisk.forEach((m, idx) => {
            reply += `- **${m.student_name}** (${m.student_id}) — GPA: ${m.overall_gpa || 'N/A'}, Backlogs: ${m.backlogs_count || 0}, Attendance: ${m.attendance_pct}%\n`;
          });
          reply += `\n`;
        }

        reply += `**Recommended Advisory Steps:**\n`;
        reply += `1. **Schedule Remedial Sessions**: Coordinate compensatory tutorial or lab hours.\n`;
        reply += `2. **Log Counseling**: Click **Log Counseling** in the top navigation bar to record an intervention.\n`;
        reply += `3. **Parent Alert**: For students <70% attendance, consider issuing an official notification via the Student Details page.`;

        return res.json({
          reply,
          source: 'faculty_copilot',
          disclaimer: 'AI academic assistant. Grounded in faculty mentorship roster and meeting schedule records.'
        });
      }

      // CASE C: Cohort Summary / Reporting / Overview
      if (/(summary|cohort|report|overview|roster|all students|statistic|count)/i.test(lowerMsg)) {
        const total = mentees.length;
        const high = mentees.filter(m => m.dropout_risk_label === 'High').length;
        const med = mentees.filter(m => m.dropout_risk_label === 'Medium').length;
        const low = mentees.filter(m => m.dropout_risk_label === 'Low' || !m.dropout_risk_label).length;
        const lowAtt = mentees.filter(m => Number(m.attendance_pct) < 75 || m.low_attendance_flag === 1).length;
        const pendingMtr = meetings.filter(m => m.status === 'new').length;

        const reply = `### 📊 Cohort Health & Mentorship Report\n\n` +
          `**Faculty Mentor:** ${req.user.name || 'Professor'}\n` +
          `**Total Assigned Mentees:** **${total}**\n\n` +
          `**Dropout Risk Breakdown:**\n` +
          `- 🔴 High Risk: **${high}** students\n` +
          `- 🟡 Medium Risk: **${med}** students\n` +
          `- 🟢 Low Risk: **${low}** students\n\n` +
          `**Key Alerts:**\n` +
          `- ⚠️ **${lowAtt}** students below the 75% attendance cutoff\n` +
          `- 📬 **${pendingMtr}** pending meeting requests in your inbox\n\n` +
          `You can filter the full roster by risk or branch under the **Roster** tab.`;

        return res.json({
          reply,
          source: 'faculty_copilot',
          disclaimer: 'AI academic assistant. Grounded in faculty mentorship roster and meeting schedule records.'
        });
      }

      // CASE D: How to schedule / General faculty guidance
      if (/(schedule|counseling|how to|log session|action)/i.test(lowerMsg)) {
        const reply = `### 💡 How to Manage Mentees & Counseling Sessions\n\n` +
          `1. **Log a Counseling Session:** Click the **Log Counseling** button in the top navigation bar or go to the **Interventions** tab. Choose the student, intervention type, and notes.\n` +
          `2. **Review Student Meeting Requests:** Click the **Meetings** tab or the **Notification Bell 🔔** in the top bar to review new requests, acknowledge them, or schedule an upcoming tutorial slot.\n` +
          `3. **Student Alerts:** When you confirm or schedule a meeting, an instant notification is sent to the student's dashboard bell icon.`;

        return res.json({
          reply,
          source: 'faculty_copilot',
          disclaimer: 'AI academic assistant. Grounded in faculty mentorship roster and meeting schedule records.'
        });
      }

      // Default mentor greeting
      const total = mentees.length;
      const lowAtt = mentees.filter(m => Number(m.attendance_pct) < 75 || m.low_attendance_flag === 1).length;
      const reply = `Hello Professor ${req.user.name ? req.user.name.split(' ').slice(-1)[0] : 'Faculty'}! 👋\n\n` +
        `I am monitoring your cohort of **${total} assigned mentees**. Currently, **${lowAtt} student(s)** have an attendance deficit below 75%.\n\n` +
        `You can ask me:\n` +
        `- *"Which students need urgent help or have <75% attendance?"*\n` +
        `- *"What are my upcoming meetings and schedule?"*\n` +
        `- *"Give me a cohort summary report"*\n` +
        `- *"How do I log a counseling session?"*`;

      return res.json({
        reply,
        source: 'faculty_copilot',
        disclaimer: 'AI academic assistant. Grounded in faculty mentorship roster and meeting schedule records.'
      });
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

// --- 7. Service-Authenticated Integrations ---
router.post('/integrations/meeting-requests', serviceKeyAuth, integrationController.ingestMeetingRequest);

// --- 8. Role-Scoped Meeting Requests & Notifications ---
router.post('/meeting-requests', requireAuth, meetingRequestController.createMeetingRequest);
router.get('/meeting-requests', requireAuth, meetingRequestController.getMeetingRequests);
router.get('/meeting-requests/my', requireAuth, meetingRequestController.getMyMeetingRequests);
router.patch('/meeting-requests/:requestId/status', requireAuth, meetingRequestController.updateMeetingRequestStatus);
router.get('/notifications', requireAuth, meetingRequestController.getNotifications);

module.exports = router;
