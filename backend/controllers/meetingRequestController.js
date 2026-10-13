const crypto = require('crypto');
const MeetingRequest = require('../models/MeetingRequest');
const Student = require('../models/Student');
const csvProvider = require('../utils/csvDataProvider');
const { getDBStatus } = require('../config/db');
const { inMemoryRequests, resolveMentorInfo } = require('./integrationController');

/**
 * GET /api/meeting-requests
 * Scoped by role:
 * - Mentor: only requests matching mentor_id === req.user.linkedId
 * - Admin: all requests
 * - Student: 403 Forbidden (must use /api/meeting-requests/my)
 * Sorted: crisis/urgent requests first.
 */
exports.getMeetingRequests = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role === 'student') {
    return res.status(403).json({ error: 'Forbidden', message: 'Students must use the /api/meeting-requests/my endpoint' });
  }

  const query = {};
  if (user.role === 'mentor') {
    query.mentor_id = user.linkedId;
  }

  try {
    if (getDBStatus()) {
      const requests = await MeetingRequest.find(query).sort({
        urgency: -1,
        createdAt: -1
      });
      return res.json({
        total: requests.length,
        urgent_count: requests.filter(r => r.urgency === 'urgent').length,
        data: requests
      });
    }

    // In-memory mode
    let requests = Array.from(inMemoryRequests.values());
    if (user.role === 'mentor') {
      requests = requests.filter(r => r.mentor_id === user.linkedId);
    }
    requests.sort((a, b) => {
      if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
      if (b.urgency === 'urgent' && a.urgency !== 'urgent') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.json({
      total: requests.length,
      urgent_count: requests.filter(r => r.urgency === 'urgent').length,
      data: requests
    });
  } catch (err) {
    console.error('[GetMeetingRequests Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve meeting requests' });
  }
};

/**
 * GET /api/meeting-requests/my
 * Scoped to authenticated student:
 * - Student sees only their own requests (read-only, status-only)
 */
exports.getMyMeetingRequests = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role !== 'student') {
    return res.status(403).json({ error: 'Forbidden', message: 'Only students can access /my requests' });
  }

  try {
    if (getDBStatus()) {
      const requests = await MeetingRequest.find({ student_id: user.linkedId })
        .sort({ createdAt: -1 })
        .select('request_id student_id category urgency reason_short status scheduled_at createdAt');
      return res.json({
        total: requests.length,
        data: requests
      });
    }

    // In-memory mode
    const requests = Array.from(inMemoryRequests.values())
      .filter(r => r.student_id === user.linkedId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      total: requests.length,
      data: requests
    });
  } catch (err) {
    console.error('[GetMyMeetingRequests Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve student meeting requests' });
  }
};

/**
 * PATCH /api/meeting-requests/:requestId/status
 * Mentor or Admin updates request status (acknowledge, schedule, resolve, cancel)
 * Ownership check:
 * - Mentor CANNOT update requests for another mentor's students (403 Forbidden).
 */
exports.updateMeetingRequestStatus = async (req, res) => {
  const user = req.user;
  const { requestId } = req.params;
  const { status, mentor_note, scheduled_at } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role === 'student') {
    return res.status(403).json({ error: 'Forbidden', message: 'Students cannot update meeting requests' });
  }

  const validStatuses = ['new', 'acknowledged', 'scheduled', 'resolved', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status', valid: validStatuses });
  }

  try {
    if (getDBStatus()) {
      const meeting = await MeetingRequest.findOne({ request_id: requestId });
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting request not found' });
      }

      // Strict mentor ownership check:
      if (user.role === 'mentor' && meeting.mentor_id !== user.linkedId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Mentors can only update meeting requests assigned to their mentees'
        });
      }

      if (status) meeting.status = status;
      if (mentor_note !== undefined) meeting.mentor_note = mentor_note;
      if (scheduled_at !== undefined) {
        meeting.scheduled_at = scheduled_at ? new Date(scheduled_at) : null;
      } else if (status === 'scheduled' && !meeting.scheduled_at) {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(15, 30, 0, 0);
        meeting.scheduled_at = nextDay;
      }

      await meeting.save();

      return res.json({
        success: true,
        message: 'Meeting request updated',
        data: meeting
      });
    }

    // In-memory mode
    const meeting = inMemoryRequests.get(requestId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting request not found' });
    }

    // Strict mentor ownership check:
    if (user.role === 'mentor' && meeting.mentor_id !== user.linkedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Mentors can only update meeting requests assigned to their mentees'
      });
    }

    if (status) meeting.status = status;
    if (mentor_note !== undefined) meeting.mentor_note = mentor_note;
    if (scheduled_at !== undefined) {
      meeting.scheduled_at = scheduled_at ? new Date(scheduled_at) : null;
    } else if (status === 'scheduled' && !meeting.scheduled_at) {
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(15, 30, 0, 0);
      meeting.scheduled_at = nextDay;
    }
    meeting.updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Meeting request updated',
      data: meeting
    });
  } catch (err) {
    console.error('[UpdateMeetingRequestStatus Error]', err);
    return res.status(500).json({ error: 'Failed to update meeting request' });
  }
};

/**
 * POST /api/meeting-requests
 * Authenticated endpoint for students or mentors to create meeting requests.
 */
exports.createMeetingRequest = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { student_id, mentor_id, college_id, category, urgency, reason_short, scheduled_at, mentor_note } = req.body;
  const requestId = crypto.randomUUID();

  let effectiveStudentId = user.role === 'student' ? user.linkedId : (student_id || user.linkedId);
  let effectiveMentorId = mentor_id;
  let effectiveCollegeId = college_id || 'C101';
  let initialStatus = 'new';
  let initialScheduledAt = null;

  // Mentor creating a session directly with a mentee
  if (user.role === 'mentor') {
    effectiveMentorId = user.linkedId;
    if (student_id) effectiveStudentId = student_id;
    initialStatus = scheduled_at ? 'scheduled' : 'new';
    initialScheduledAt = scheduled_at ? new Date(scheduled_at) : null;
  }

  // Auto-resolve mentor if not supplied
  if (!effectiveMentorId) {
    try {
      const resolved = await resolveMentorInfo(effectiveStudentId);
      effectiveMentorId = resolved.mentorId;
    } catch (e) {
      effectiveMentorId = 'FAC_EEC_CSE_001';
    }
  }

  // Auto-resolve student name
  let studentName = '';
  try {
    if (getDBStatus()) {
      const stu = await Student.findOne({ student_id: effectiveStudentId });
      if (stu) studentName = stu.student_name;
    }
    if (!studentName) {
      const list = await csvProvider.getStudentsData();
      const stu = list.find(s => s.student_id === effectiveStudentId);
      if (stu) studentName = stu.student_name;
    }
  } catch (e) {}

  const validCategory = ['meeting', 'academic', 'crisis'].includes(category) ? category : 'meeting';
  const validUrgency = ['normal', 'urgent'].includes(urgency) ? urgency : (category === 'crisis' ? 'urgent' : 'normal');

  try {
    if (getDBStatus()) {
      const record = await MeetingRequest.create({
        request_id: requestId,
        student_id: effectiveStudentId,
        student_name: studentName,
        mentor_id: effectiveMentorId,
        college_id: effectiveCollegeId,
        category: validCategory,
        urgency: validUrgency,
        reason_short: (reason_short || 'Guidance Consultation').slice(0, 200),
        status: initialStatus,
        scheduled_at: initialScheduledAt,
        mentor_note: mentor_note || ''
      });
      return res.status(201).json({ success: true, data: record });
    }

    // In-memory mode
    const record = {
      request_id: requestId,
      student_id: effectiveStudentId,
      student_name: studentName,
      mentor_id: effectiveMentorId,
      college_id: effectiveCollegeId,
      category: validCategory,
      urgency: validUrgency,
      reason_short: (reason_short || 'Guidance Consultation').slice(0, 200),
      status: initialStatus,
      scheduled_at: initialScheduledAt,
      mentor_note: mentor_note || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryRequests.set(requestId, record);
    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[CreateMeetingRequest Error]', err);
    return res.status(500).json({ error: 'Failed to create meeting request' });
  }
};

/**
 * GET /api/notifications
 * Returns live notification items for the authenticated user:
 * - For Mentors: Student meeting requests (new & urgent) + mentees with <75% attendance.
 * - For Students: Meeting confirmations & status updates from faculty mentor.
 */
exports.getNotifications = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const notifications = [];

    if (user.role === 'mentor') {
      // 1. Fetch meeting requests assigned to this mentor
      let meetings = [];
      if (getDBStatus()) {
        meetings = await MeetingRequest.find({ mentor_id: user.linkedId }).sort({ urgency: -1, createdAt: -1 });
      } else {
        meetings = Array.from(inMemoryRequests.values()).filter(r => r.mentor_id === user.linkedId);
        meetings.sort((a, b) => {
          if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
          if (b.urgency === 'urgent' && a.urgency !== 'urgent') return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }

      // 2. Fetch mentor's mentees
      let mentees = [];
      if (getDBStatus()) {
        mentees = await Student.find({ mentor_id: user.linkedId });
      } else {
        const allStudents = await csvProvider.getStudentsData();
        mentees = allStudents.filter(s => s.mentor_id === user.linkedId || s.mentor?.id === user.linkedId);
      }
      const studentNameMap = new Map();
      mentees.forEach(s => studentNameMap.set(s.student_id, s.student_name));

      // Meeting request notifications
      for (const req of meetings) {
        const stuName = req.student_name || studentNameMap.get(req.student_id) || req.student_id;
        if (req.status === 'new') {
          notifications.push({
            id: `meet-new-${req.request_id}`,
            type: 'meeting_request',
            category: req.category,
            title: req.urgency === 'urgent' ? '🚨 Urgent Meeting Request' : '📅 New Meeting Request',
            message: `${stuName} requested guidance: "${req.reason_short}"`,
            timestamp: req.createdAt,
            urgency: req.urgency,
            status: req.status,
            link: '/mentor/dashboard?tab=meetings',
            requestId: req.request_id
          });
        } else if (req.status === 'scheduled') {
          notifications.push({
            id: `meet-sched-${req.request_id}`,
            type: 'meeting_scheduled',
            category: req.category,
            title: '📅 Confirmed Meeting Session',
            message: `Session with ${stuName} scheduled for ${req.scheduled_at ? new Date(req.scheduled_at).toLocaleDateString() : 'tutorial hour'}.`,
            timestamp: req.updatedAt || req.createdAt,
            urgency: req.urgency,
            status: req.status,
            link: '/mentor/dashboard?tab=meetings',
            requestId: req.request_id
          });
        }
      }

      // Attendance deficit alerts (<75%)
      for (const s of mentees) {
        if (Number(s.attendance_pct) < 75 || s.low_attendance_flag === 1) {
          notifications.push({
            id: `att-alert-${s.student_id}`,
            type: 'attendance_alert',
            title: '⚠️ Attendance Deficit (<75%)',
            message: `${s.student_name} (${s.student_id}) attendance dropped to ${s.attendance_pct}%. Immediate remedial action recommended.`,
            timestamp: s.updatedAt || new Date(),
            urgency: 'urgent',
            link: '/mentor/dashboard?tab=roster&filter=risk'
          });
        }
      }
    } else if (user.role === 'student') {
      // Student notifications
      let meetings = [];
      if (getDBStatus()) {
        meetings = await MeetingRequest.find({ student_id: user.linkedId }).sort({ updatedAt: -1, createdAt: -1 });
      } else {
        meetings = Array.from(inMemoryRequests.values()).filter(r => r.student_id === user.linkedId);
        meetings.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      }

      for (const req of meetings) {
        if (req.status === 'scheduled') {
          const timeStr = req.scheduled_at
            ? new Date(req.scheduled_at).toLocaleDateString() + ' ' + new Date(req.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Upcoming Department Tutorial Hour';
          notifications.push({
            id: `stu-sched-${req.request_id}`,
            type: 'meeting_scheduled',
            title: '✅ Meeting Confirmed by Mentor',
            message: `Your faculty mentor scheduled your meeting for ${timeStr}.${req.mentor_note ? ' Note: ' + req.mentor_note : ''}`,
            timestamp: req.updatedAt || req.createdAt,
            urgency: 'normal',
            status: 'scheduled',
            link: '/student/dashboard'
          });
        } else if (req.status === 'acknowledged') {
          notifications.push({
            id: `stu-ack-${req.request_id}`,
            type: 'meeting_acknowledged',
            title: '📋 Meeting Request Acknowledged',
            message: `Your faculty mentor acknowledged your request: "${req.reason_short}". Time slot confirmation in progress.`,
            timestamp: req.updatedAt || req.createdAt,
            urgency: 'normal',
            status: 'acknowledged',
            link: '/student/dashboard'
          });
        } else if (req.status === 'new') {
          notifications.push({
            id: `stu-new-${req.request_id}`,
            type: 'meeting_pending',
            title: '⏳ Meeting Request Sent',
            message: `Your guidance request "${req.reason_short}" was forwarded to your faculty mentor.`,
            timestamp: req.createdAt,
            urgency: req.urgency,
            status: 'new',
            link: '/student/dashboard'
          });
        }
      }
    }

    return res.json({
      total: notifications.length,
      data: notifications
    });
  } catch (err) {
    console.error('[GetNotifications Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};
