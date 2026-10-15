const Student = require('../models/Student');
const { getDBStatus } = require('../config/db');
const csvProvider = require('../utils/csvDataProvider');
const { NotificationLogStore } = require('../models/NotificationLog');
const notificationDispatcher = require('../services/notificationDispatcher');

async function resolveStudent(studentId) {
  if (!studentId) return null;
  if (getDBStatus()) {
    const doc = await Student.findOne({ student_id: studentId });
    if (doc) return doc.toObject();
  }
  const list = await csvProvider.getStudentsData();
  return list.find(s => s.student_id === studentId) || null;
}

/**
 * POST /api/students/:id/parent-alert
 * Dispatches an official parent alert via n8n automation (or SMTP fallback).
 * Permissions: Mentor of that student or admin of the same college only (403 otherwise).
 */
exports.sendParentAlert = async (req, res) => {
  const user = req.user;
  const studentId = req.params.id;
  const { message, urgency } = req.body || {};

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const student = await resolveStudent(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Permission check
    if (user.role === 'mentor' && student.mentor_id !== user.linkedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Mentors may only send alerts for their assigned mentees'
      });
    }

    if (user.role === 'admin' && student.college_id && user.collegeId && student.college_id !== user.collegeId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admins may only send alerts for students within their institution'
      });
    }

    if (user.role === 'student') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Students cannot send parent alerts'
      });
    }

    // Build default subject & body template matching modal text if custom message not supplied
    const names = (student.student_name || 'Student').split(' ');
    const lastName = names.length > 1 ? names[names.length - 1] : names[0];
    const parentName = `Mr. / Mrs. ${lastName}`;

    let defaultBody = '';
    if (student.attendance_pct < 75) {
      defaultBody = `OFFICIAL ACADEMIC NOTICE: ${student.college_name || 'Institution'}
Dear ${parentName},
This is an academic intimation regarding your ward ${student.student_name} (${student.student_id}), Department of ${student.department || 'Engineering'}, Year ${student.year_of_study || 2}.
Current Semester Attendance: ${student.attendance_pct}% (Below the 75% statutory exam eligibility cutoff).
We request you to contact the department faculty mentor to discuss an attendance recovery plan.`;
    } else if (student.backlogs_count > 0) {
      defaultBody = `OFFICIAL ACADEMIC NOTICE: ${student.college_name || 'Institution'}
Dear ${parentName},
This is an academic performance update regarding your ward ${student.student_name} (${student.student_id}), Department of ${student.department || 'Engineering'}.
Current Standing: ${student.backlogs_count} standing course backlogs requiring remedial attention.
Special department tutorial hours are available. Please encourage your ward to attend the diagnostic mentoring sessions.`;
    } else {
      defaultBody = `OFFICIAL ACADEMIC NOTICE: ${student.college_name || 'Institution'}
Dear ${parentName},
Regarding the academic progress of ${student.student_name} (${student.student_id}):
Attendance: ${student.attendance_pct}% | Active Backlogs: ${student.backlogs_count || 0}.
You are invited for a mentor consultation to discuss your ward's academic standing.`;
    }

    const cleanSubject = `OFFICIAL ACADEMIC NOTICE: Academic Standing for ${student.student_name}`;
    const cleanBody = (typeof message === 'string' && message.trim().length > 0) ? message.trim() : defaultBody;

    const result = await notificationDispatcher.dispatch({
      event_type: 'parent_alert',
      student_id: student.student_id,
      mentor_id: student.mentor_id,
      college_id: student.college_id,
      subject: cleanSubject,
      body_text: cleanBody,
      idempotency_key: `parent-alert-${student.student_id}-${Date.now()}`,
      risk_level: urgency === 'high' || student.attendance_pct < 75 ? 'High' : 'Normal'
    });

    return res.status(200).json({
      event_id: result.event_id,
      status: result.status,
      channel: result.channel
    });
  } catch (err) {
    console.error('[SendParentAlert Error]', err);
    return res.status(500).json({ error: 'Failed to dispatch parent alert' });
  }
};

/**
 * GET /api/notifications/log?student_id=
 * Returns communication dispatch audit logs.
 * Permissions: Student's mentor and admins of the same college only (403 otherwise).
 */
exports.getNotificationLogs = async (req, res) => {
  const user = req.user;
  const { student_id } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role === 'student') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Students are not authorized to view notification audit logs'
    });
  }

  if (!student_id) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'student_id query parameter is required'
    });
  }

  try {
    const student = await resolveStudent(student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Access control
    if (user.role === 'mentor' && student.mentor_id !== user.linkedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Mentors may only inspect notification logs for their assigned mentees'
      });
    }

    if (user.role === 'admin' && student.college_id && user.collegeId && student.college_id !== user.collegeId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admins may only inspect logs for students within their own college'
      });
    }

    const logs = await NotificationLogStore.findByStudent(student_id);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    console.error('[GetNotificationLogs Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve notification logs' });
  }
};
