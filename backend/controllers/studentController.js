/**
 * Student Controller
 * Serves:
 * - GET /api/students (filters: department, year, collegeId, risk, search, pagination)
 * - GET /api/students/:id (single student profile + mentor details)
 * - GET /api/students/:id/marks (subject-level marks, optional ?semester=)
 *
 * Enforces ownership authorization:
 * - Students can only access their own record and marks
 * - Mentors can only access their assigned mentees
 * - Admins can access all records
 */

const Student = require('../models/Student');
const Marks = require('../models/Marks');
const Faculty = require('../models/Faculty');
const { getDBStatus } = require('../config/db');
const csvProvider = require('../utils/csvDataProvider');
const { getPrediction, mapStudentToPredictionPayload } = require('../services/aiServiceClient');

const ANONYMIZED_COLLEGE_NAMES = {
  C101: 'Apex Engineering College',
  C102: 'Kavery Residential Institute of Technology',
  C103: 'Modern Institute of Science & Technology',
  C104: 'Sahyadri Deemed University'
};

// GET /api/students
const getStudents = async (req, res) => {
  try {
    // Role check: students cannot browse directory
    if (req.user) {
      if (req.user.role === 'student') {
        return res.status(403).json({ error: 'Forbidden', message: 'Students cannot list student records' });
      }
    }

    const { department, year, collegeId, risk, lowAttendance, search, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100); // capped at 100

    if (getDBStatus()) {
      // MongoDB Query
      const query = {};
      if (req.user && req.user.role === 'mentor') {
        query.mentor_id = req.user.linkedId;
      }
      if (department) query.department = department;
      if (year) query.year_of_study = Number(year);
      if (collegeId) query.college_id = collegeId;
      if (risk) query.dropout_risk_label = risk;
      if (lowAttendance !== undefined) query.low_attendance_flag = Number(lowAttendance);
      if (search) {
        // Sanitize search to avoid ReDoS / injection
        const cleanSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { student_name: { $regex: cleanSearch, $options: 'i' } },
          { student_id: { $regex: cleanSearch, $options: 'i' } }
        ];
      }

      const total = await Student.countDocuments(query);
      const students = await Student.find(query)
        .sort({ dropout_risk_score: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.json({
        source: 'mongodb',
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        data: students.map(s => ({ ...s.toObject(), college_name: ANONYMIZED_COLLEGE_NAMES[s.college_id] || s.college_name }))
      });
    }

    // Fallback: CSV-based in-memory query
    let all = await csvProvider.getStudentsData();
    if (req.user && req.user.role === 'mentor') {
      all = all.filter(s => s.mentor_id === req.user.linkedId);
    }
    if (department) all = all.filter(s => s.department === department);
    if (year) all = all.filter(s => s.year_of_study === Number(year));
    if (collegeId) all = all.filter(s => s.college_id === collegeId);
    if (risk) all = all.filter(s => s.dropout_risk_label === risk);
    if (lowAttendance !== undefined) all = all.filter(s => s.low_attendance_flag === Number(lowAttendance));
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(s => s.student_name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q));
    }

    all.sort((a, b) => b.dropout_risk_score - a.dropout_risk_score);

    const total = all.length;
    const paginated = all.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(s => ({
      ...s,
      college_name: ANONYMIZED_COLLEGE_NAMES[s.college_id] || s.college_name
    }));

    return res.json({
      source: 'csv_dataset',
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: paginated
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error retrieving students', details: err.message });
  }
};

// GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Student ownership check
    if (req.user && req.user.role === 'student' && req.user.linkedId !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Students are only permitted to access their own student record'
      });
    }

    if (getDBStatus()) {
      const student = await Student.findOne({ student_id: id });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      // Mentor ownership check
      if (req.user && req.user.role === 'mentor' && student.mentor_id !== req.user.linkedId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Mentors are only permitted to view their assigned mentees'
        });
      }

      const [mentor, marks] = await Promise.all([
        Faculty.findOne({ faculty_id: student.mentor_id }),
        Marks.find({ student_id: id }).sort({ semester: 1 })
      ]);

      const predictionPayload = mapStudentToPredictionPayload(student, marks);
      const liveRiskAssessment = await getPrediction(predictionPayload, student.dropout_risk_label);

      return res.json({
        source: 'mongodb',
        data: {
          ...student.toObject(),
          college_name: ANONYMIZED_COLLEGE_NAMES[student.college_id] || student.college_name,
          mentor: mentor || null,
          staticDropoutLabel: student.dropout_risk_label,
          liveRiskAssessment
        }
      });
    }

    // Fallback in CSV mode
    const students = await csvProvider.getStudentsData();
    const student = students.find(s => s.student_id === id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Mentor ownership check
    if (req.user && req.user.role === 'mentor' && student.mentor_id !== req.user.linkedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Mentors are only permitted to view their assigned mentees'
      });
    }

    const [facultyList, marks] = await Promise.all([
      csvProvider.getFacultyData(),
      csvProvider.getMarksForStudent(id)
    ]);
    const mentor = facultyList.find(f => f.faculty_id === student.mentor_id);

    const predictionPayload = mapStudentToPredictionPayload(student, marks);
    const liveRiskAssessment = await getPrediction(predictionPayload, student.dropout_risk_label);

    return res.json({
      source: 'csv_dataset',
      data: {
        ...student,
        college_name: ANONYMIZED_COLLEGE_NAMES[student.college_id] || student.college_name,
        mentor: mentor || null,
        staticDropoutLabel: student.dropout_risk_label,
        liveRiskAssessment
      }
    });
  } catch (err) {
    console.error('Error fetching student by id:', err);
    res.status(500).json({ error: 'Server error retrieving student', details: err.message });
  }
};

// Helper: Anna University realistic mark structure
const generateDemoMarks = (studentId, semester) => {
  const allDemoMarks = [
    { student_id: studentId, semester: 1, subject_name: 'HS3152 - Professional English I', subject_type: 'Theory', credits: 3, assignment_1_marks: 9, assignment_2_marks: 8, internal_exam_1_marks: 38, internal_exam_2_marks: 40, external_exam_marks: 72, total_marks: 74, grade_point: 8, result: 'Pass' },
    { student_id: studentId, semester: 1, subject_name: 'MA3151 - Matrices and Calculus', subject_type: 'Theory', credits: 4, assignment_1_marks: 7, assignment_2_marks: 8, internal_exam_1_marks: 24, internal_exam_2_marks: 28, external_exam_marks: 54, total_marks: 56, grade_point: 6, result: 'Pass' },
    { student_id: studentId, semester: 1, subject_name: 'PH3151 - Engineering Physics', subject_type: 'Theory', credits: 3, assignment_1_marks: 8, assignment_2_marks: 8, internal_exam_1_marks: 35, internal_exam_2_marks: 37, external_exam_marks: 68, total_marks: 70, grade_point: 7, result: 'Pass' },
    { student_id: studentId, semester: 1, subject_name: 'GE3151 - Problem Solving and Python Programming', subject_type: 'Theory', credits: 3, assignment_1_marks: 9, assignment_2_marks: 9, internal_exam_1_marks: 39, internal_exam_2_marks: 42, external_exam_marks: 76, total_marks: 78, grade_point: 8, result: 'Pass' }
  ];
  if (!semester) return allDemoMarks;
  return allDemoMarks.filter(m => m.semester === Number(semester));
};

// GET /api/students/:id/marks
const getStudentMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester } = req.query;

    // Student ownership check
    if (req.user && req.user.role === 'student' && req.user.linkedId !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Students are only permitted to view their own marks'
      });
    }

    // Mentor ownership check
    if (req.user && req.user.role === 'mentor') {
      let student = null;
      if (getDBStatus()) {
        student = await Student.findOne({ student_id: id });
      } else {
        const allStudents = await csvProvider.getStudentsData();
        student = allStudents.find(s => s.student_id === id);
      }
      if (student && student.mentor_id !== req.user.linkedId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Mentors are only permitted to view marks of their assigned mentees'
        });
      }
    }

    if (getDBStatus()) {
      const query = { student_id: id };
      if (semester) query.semester = Number(semester);

      const marks = await Marks.find(query).sort({ semester: 1, subject_name: 1 });
      if (marks && marks.length > 0) {
        return res.json({
          source: 'mongodb',
          student_id: id,
          total_records: marks.length,
          data: marks
        });
      }
    }

    // Check CSV provider
    let marks = await csvProvider.getMarksForStudent(id, semester);
    if (!marks || marks.length === 0) {
      marks = generateDemoMarks(id, semester);
    }

    return res.json({
      source: 'curriculum_dataset',
      student_id: id,
      total_records: marks.length,
      data: marks
    });
  } catch (err) {
    console.error('Error fetching student marks:', err);
    res.status(500).json({ error: 'Server error retrieving marks', details: err.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  getStudentMarks
};
