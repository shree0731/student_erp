const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { AssessmentStore } = require('../models/Assessment');
const { ActionLogStore } = require('../models/ActionLog');
const { executeAssessmentActions } = require('../services/assessmentActionEngine');
const aiService = require('../services/aiServiceClient');
const { getDBStatus } = require('../config/db');
const csvProvider = require('../utils/csvDataProvider');

const REQUIRED_MODEL_FEATURES = [
  'department',
  'year_of_study',
  'attendance_pct',
  'attendance_decay',
  'overall_gpa',
  'backlogs_count',
  'cutoff_mark_200',
  'family_income_annual',
  'mentor_meetings_attended',
  'first_gen_learner',
  'distance_from_home_km',
  'failed_subjects_count',
  'core_theory_average',
  'internal_exam_avg',
  'assignment_avg',
  'grade_trend'
];

/**
 * Resolves student document by ID across Mongo and CSV cache.
 */
async function findStudentById(studentId) {
  if (!studentId) return null;
  if (getDBStatus()) {
    const doc = await Student.findOne({ student_id: studentId });
    if (doc) return doc.toObject();
  }
  const students = await csvProvider.getStudentsData();
  return students.find(s => s.student_id === studentId) || null;
}

/**
 * POST /api/students/assess
 * 
 * Assess a new student profile through the real XGBoost ML service.
 * Restricted to Mentors and Admins only.
 */
exports.assessNewStudent = async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'mentor' && user.role !== 'admin')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only faculty mentors and college administrators may assess new students'
      });
    }

    const body = req.body || {};

    // 1. Never accept recipient emails in the body
    if (body.email || body.parent_email || body.mentor_email || body.recipient_email || body.recipient_emails) {
      return res.status(422).json({
        error: 'Unprocessable Entity',
        message: 'Recipient emails must not be provided in the request body. Emails are resolved server-side.'
      });
    }

    // 2. Validate student_name
    if (!body.student_name || typeof body.student_name !== 'string' || !body.student_name.trim()) {
      return res.status(422).json({
        error: 'Unprocessable Entity',
        message: 'Missing required field: student_name',
        missing_field: 'student_name'
      });
    }

    // 3. Validate each of the 16 model features (never fill missing values)
    for (const feat of REQUIRED_MODEL_FEATURES) {
      if (body[feat] === undefined || body[feat] === null || body[feat] === '') {
        return res.status(422).json({
          error: 'Unprocessable Entity',
          message: `Missing required field: ${feat}`,
          missing_field: feat
        });
      }
    }

    // Prepare features payload for the AI microservice
    const features = {
      department: String(body.department).trim(),
      year_of_study: parseInt(body.year_of_study, 10),
      attendance_pct: parseFloat(body.attendance_pct),
      attendance_decay: parseFloat(body.attendance_decay),
      overall_gpa: parseFloat(body.overall_gpa),
      backlogs_count: parseInt(body.backlogs_count, 10),
      cutoff_mark_200: parseFloat(body.cutoff_mark_200),
      family_income_annual: parseFloat(body.family_income_annual),
      mentor_meetings_attended: parseInt(body.mentor_meetings_attended, 10),
      first_gen_learner: parseInt(body.first_gen_learner, 10),
      distance_from_home_km: parseFloat(body.distance_from_home_km),
      failed_subjects_count: parseInt(body.failed_subjects_count, 10),
      core_theory_average: parseFloat(body.core_theory_average),
      internal_exam_avg: parseFloat(body.internal_exam_avg),
      assignment_avg: parseFloat(body.assignment_avg),
      grade_trend: parseFloat(body.grade_trend)
    };

    // 4. Server-generated Student ID
    const studentId = `STU_NEW_${Date.now()}`;
    const collegeId = user.collegeId || user.college_id || 'C101';
    
    // Assign to calling mentor if mentor, or first faculty/default if admin
    let mentorId = user.linkedId;
    if (user.role === 'admin') {
      mentorId = body.mentor_id || 'FAC_EEC_CSE_001';
    }

    // 5. Predict from Features (calls AI gateway unchanged; surfaces 422/503 unchanged)
    let predictionResult;
    try {
      predictionResult = await aiService.predictFromFeatures(features);
    } catch (err) {
      const statusCode = err.status || 503;
      return res.status(statusCode).json({
        error: statusCode === 422 ? 'Unprocessable Entity' : 'Service Unavailable',
        message: err.message,
        detail: err.data || err.message
      });
    }

    const prediction = predictionResult.prediction || 'Low';
    const probabilities = predictionResult.probabilities || {};
    const topRiskDrivers = predictionResult.top_risk_drivers || [];
    const explanationMethod = predictionResult.explanation_method || 'shap_tree_explainer';
    const highProb = probabilities.High !== undefined ? probabilities.High : (prediction === 'High' ? 0.9 : prediction === 'Medium' ? 0.5 : 0.1);

    // 6. Persistence: Create student in MongoDB / CSV in-memory fallback
    const studentData = {
      student_id: studentId,
      student_name: String(body.student_name).trim(),
      college_id: collegeId,
      college_name: 'College of Engineering',
      department: features.department,
      year_of_study: features.year_of_study,
      current_semester: (features.year_of_study * 2) - 1,
      section: 'A',
      gender: 'Male',
      home_state: 'Tamil Nadu',
      board_of_education: 'State Board',
      community: 'BC',
      first_gen_learner: features.first_gen_learner,
      family_income_annual: features.family_income_annual,
      hosteller: features.distance_from_home_km > 60 ? 1 : 0,
      distance_from_home_km: features.distance_from_home_km,
      admission_quota: 'Government',
      cutoff_mark_200: features.cutoff_mark_200,
      attendance_pct: features.attendance_pct,
      monthly_attendance_trend: [features.attendance_pct + features.attendance_decay, features.attendance_pct],
      mentor_meetings_attended: features.mentor_meetings_attended,
      overall_gpa: features.overall_gpa,
      backlogs_count: features.backlogs_count,
      low_attendance_flag: features.attendance_pct < 75 ? 1 : 0,
      dropout_risk_score: highProb,
      dropout_risk_label: prediction,
      mentor_id: mentorId,
      source: 'assessed'
    };

    if (getDBStatus()) {
      await Student.create(studentData);
    }
    // Also add to CSV provider memory cache so fallback endpoints see the new student
    await csvProvider.addStudent(studentData);

    // 7. Persistence: Create Assessment Record
    const assessmentId = `ASSESS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const assessmentData = {
      assessment_id: assessmentId,
      student_id: studentId,
      mentor_id: mentorId,
      college_id: collegeId,
      features,
      prediction,
      probabilities,
      top_risk_drivers: topRiskDrivers,
      explanation_method: explanationMethod,
      created_at: new Date()
    };
    await AssessmentStore.create(assessmentData);

    // 8. Server-side Action Engine Execution
    const actionResult = await executeAssessmentActions({
      assessment_id: assessmentId,
      student_id: studentId,
      student_name: studentData.student_name,
      mentor_id: mentorId,
      college_id: collegeId,
      prediction
    });

    return res.status(201).json({
      message: 'Student assessed successfully',
      student: studentData,
      assessment: assessmentData,
      actions: actionResult.logs,
      prediction: predictionResult
    });

  } catch (error) {
    console.error('[AssessmentController] Error assessing student:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process student assessment: ' + error.message
    });
  }
};

/**
 * GET /api/students/:id/assessments
 * Mentor of student or college admin only.
 */
exports.getStudentAssessments = async (req, res) => {
  try {
    const studentId = req.params.id;
    const user = req.user;

    const student = await findStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Not Found', message: 'Student not found' });
    }

    if (user.role === 'mentor' && student.mentor_id !== user.linkedId) {
      return res.status(403).json({ error: 'Forbidden', message: 'Mentors may only view assessments of their assigned students' });
    }

    if (user.role === 'admin' && user.collegeId && student.college_id !== user.collegeId && user.collegeId !== 'C101') {
      return res.status(403).json({ error: 'Forbidden', message: 'Admins may only view assessments within their college' });
    }

    if (user.role === 'student' && user.linkedId !== studentId) {
      return res.status(403).json({ error: 'Forbidden', message: 'Students may only view their own records' });
    }

    const assessments = await AssessmentStore.findByStudentId(studentId);
    return res.json({
      student_id: studentId,
      total: assessments.length,
      data: assessments
    });
  } catch (err) {
    console.error('[AssessmentController] Error fetching assessments:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

/**
 * GET /api/students/:id/actions
 * Mentor of student or college admin only.
 */
exports.getStudentActions = async (req, res) => {
  try {
    const studentId = req.params.id;
    const user = req.user;

    const student = await findStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Not Found', message: 'Student not found' });
    }

    if (user.role === 'mentor' && student.mentor_id !== user.linkedId) {
      return res.status(403).json({ error: 'Forbidden', message: 'Mentors may only view actions of their assigned students' });
    }

    if (user.role === 'admin' && user.collegeId && student.college_id !== user.collegeId && user.collegeId !== 'C101') {
      return res.status(403).json({ error: 'Forbidden', message: 'Admins may only view actions within their college' });
    }

    if (user.role === 'student' && user.linkedId !== studentId) {
      return res.status(403).json({ error: 'Forbidden', message: 'Students may only view their own records' });
    }

    const actions = await ActionLogStore.findByStudentId(studentId);
    return res.json({
      student_id: studentId,
      total: actions.length,
      data: actions
    });
  } catch (err) {
    console.error('[AssessmentController] Error fetching actions:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

/**
 * GET /api/assess/examples
 * Mentor or Admin only. Returns the 9 entries without model_prediction or true_label.
 */
exports.getAssessExamples = async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'mentor' && user.role !== 'admin')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Mentor or Admin role required to retrieve demo examples'
      });
    }

    const filePath = path.join(__dirname, '../data/unseen_demo_students.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not Found', message: 'Demo examples file not found' });
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Strip model_prediction, true_label, expected_risk
    const sanitized = raw.map(entry => {
      const copy = { ...entry };
      delete copy.model_prediction;
      delete copy.true_label;
      delete copy.expected_risk;
      return copy;
    });

    return res.json({
      total: sanitized.length,
      data: sanitized
    });
  } catch (err) {
    console.error('[AssessmentController] Error fetching examples:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
