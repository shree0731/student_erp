/**
 * Faculty / Mentor Controller
 * Serves:
 * - GET /api/faculty/:id/students (students assigned to a given mentor)
 * - GET /api/faculty (list mentors, filterable by college/department)
 *
 * Enforces ownership:
 * - Mentors can only query their own mentees
 * - Students cannot access mentor mentee lists
 * - Admins can query any mentor
 */

const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const { getDBStatus } = require('../config/db');
const csvProvider = require('../utils/csvDataProvider');

const ANONYMIZED_COLLEGE_NAMES = {
  C101: 'Apex Engineering College',
  C102: 'Kavery Residential Institute of Technology',
  C103: 'Modern Institute of Science & Technology',
  C104: 'Sahyadri Deemed University'
};

// GET /api/faculty/:id/students
const getMentorStudents = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user) {
      if (req.user.role === 'student') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Students are not authorized to view mentor student rosters'
        });
      }
      if (req.user.role === 'mentor' && req.user.linkedId !== id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Mentors may only view their own assigned students'
        });
      }
    }

    if (getDBStatus()) {
      const mentor = await Faculty.findOne({ faculty_id: id });
      const mentees = await Student.find({ mentor_id: id }).sort({ dropout_risk_score: -1 });

      const highRiskCount = mentees.filter(m => m.dropout_risk_label === 'High').length;
      const lowAttendanceCount = mentees.filter(m => m.low_attendance_flag === 1).length;

      return res.json({
        source: 'mongodb',
        mentor: mentor || { faculty_id: id },
        total_mentees: mentees.length,
        summary: {
          total_mentees: mentees.length,
          high_risk_count: highRiskCount,
          low_attendance_count: lowAttendanceCount
        },
        data: mentees.map(m => ({ ...m.toObject(), college_name: ANONYMIZED_COLLEGE_NAMES[m.college_id] || m.college_name }))
      });
    }

    // Fallback
    const facultyList = await csvProvider.getFacultyData();
    const mentor = facultyList.find(f => f.faculty_id === id) || { faculty_id: id, name: 'Faculty Advisor' };

    const allStudents = await csvProvider.getStudentsData();
    const mentees = allStudents.filter(s => s.mentor_id === id);
    mentees.sort((a, b) => b.dropout_risk_score - a.dropout_risk_score);

    const highRiskCount = mentees.filter(m => m.dropout_risk_label === 'High').length;
    const lowAttendanceCount = mentees.filter(m => m.low_attendance_flag === 1).length;

    return res.json({
      source: 'csv_dataset',
      mentor,
      total_mentees: mentees.length,
      summary: {
        total_mentees: mentees.length,
        high_risk_count: highRiskCount,
        low_attendance_count: lowAttendanceCount
      },
      data: mentees.map(m => ({ ...m, college_name: ANONYMIZED_COLLEGE_NAMES[m.college_id] || m.college_name }))
    });
  } catch (err) {
    console.error('Error fetching mentor students:', err);
    res.status(500).json({ error: 'Server error retrieving mentor students', details: err.message });
  }
};

// GET /api/faculty
const getAllFaculty = async (req, res) => {
  try {
    const { department, collegeId } = req.query;

    if (getDBStatus()) {
      const query = {};
      if (department) query.department = department;
      if (collegeId) query.college_id = collegeId;

      const faculty = await Faculty.find(query).sort({ department: 1, name: 1 });
      return res.json({ source: 'mongodb', total: faculty.length, data: faculty });
    }

    // Fallback
    let all = await csvProvider.getFacultyData();
    if (department) all = all.filter(f => f.department === department);
    if (collegeId) all = all.filter(f => f.college_id === collegeId);

    return res.json({ source: 'csv_dataset', total: all.length, data: all });
  } catch (err) {
    console.error('Error fetching faculty list:', err);
    res.status(500).json({ error: 'Server error retrieving faculty', details: err.message });
  }
};

module.exports = {
  getMentorStudents,
  getAllFaculty
};
