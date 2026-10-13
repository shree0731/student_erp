const MeetingRequest = require('../models/MeetingRequest');
const { getDBStatus } = require('../config/db');
const { inMemoryRequests } = require('./integrationController');

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
      if (scheduled_at !== undefined) meeting.scheduled_at = scheduled_at ? new Date(scheduled_at) : null;

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
    if (scheduled_at !== undefined) meeting.scheduled_at = scheduled_at ? new Date(scheduled_at) : null;
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
