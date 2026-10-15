const crypto = require('crypto');
const mailer = require('./mailer');
const { NotificationLogStore } = require('../models/NotificationLog');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const csvProvider = require('../utils/csvDataProvider');

// In-memory sliding window for mentor dispatch throttling: mentor_id -> Array<timestamp>
const mentorThrottleMap = new Map();

function isThrottled(mentorId) {
  if (!mentorId) return false;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxDispatches = 10;

  const timestamps = (mentorThrottleMap.get(mentorId) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxDispatches) {
    return true;
  }
  timestamps.push(now);
  mentorThrottleMap.set(mentorId, timestamps);
  return false;
}

function clearThrottleMap() {
  mentorThrottleMap.clear();
}

/**
 * Basic HTML escaper to sanitize dynamic strings.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function resolveStudent(studentId) {
  if (!studentId) return null;
  if (getDBStatus()) {
    const doc = await Student.findOne({ student_id: studentId });
    if (doc) return doc.toObject();
  }
  const list = await csvProvider.getStudentsData();
  return list.find(s => s.student_id === studentId) || null;
}

async function resolveMentor(mentorId) {
  if (!mentorId) return null;
  if (getDBStatus()) {
    const fac = await Faculty.findOne({ faculty_id: mentorId });
    if (fac) return fac.toObject();
    const usr = await User.findOne({ linkedId: mentorId, role: 'mentor' });
    if (usr) return usr.toObject();
  }
  const facultyList = await csvProvider.getFacultyData();
  return facultyList.find(f => f.faculty_id === mentorId) || null;
}

/**
 * Dispatch an automated notification through n8n with SMTP fallback.
 *
 * @param {Object} params
 * @param {string} params.event_type - 'parent_alert' | 'mentor_alert' | 'meeting_request_created' | 'meeting_status_changed' | 'risk_high_detected'
 * @param {string} params.student_id - Associated student ID
 * @param {string} params.mentor_id - Associated mentor faculty ID
 * @param {string} [params.college_id] - College identifier
 * @param {string} params.subject - Notification subject
 * @param {string} params.body_text - Plaintext body message
 * @param {string} [params.idempotency_key] - Unique key preventing duplicate dispatches
 * @param {string} [params.risk_level] - Optional risk score/level ('High', 'Medium', 'Low')
 * @returns {Promise<Object>}
 */
async function dispatch({
  event_type,
  student_id,
  mentor_id,
  college_id,
  subject,
  body_text,
  idempotency_key,
  risk_level
}) {
  // 1. Idempotency Check
  if (idempotency_key) {
    const existing = await NotificationLogStore.findByIdempotencyKey(idempotency_key);
    if (existing) {
      return {
        event_id: existing.event_id,
        status: existing.status,
        channel: existing.channel,
        idempotent_skipped: true
      };
    }
  }

  // 2. Resolve Entities and Minimum Data
  const student = await resolveStudent(student_id);
  const mentor = await resolveMentor(mentor_id);

  const cleanCollegeId = college_id || student?.college_id || mentor?.college_id || 'C101';
  const sharedDemoEmail = process.env.DEMO_SHARED_EMAIL || 'grouppresentation785@gmail.com';

  // 3. Server-side Recipient Resolution (NEVER taken from client input)
  let recipient = '';
  if (event_type === 'parent_alert' || event_type === 'meeting_status_changed') {
    recipient = student?.parent_email || student?.guardian_email || sharedDemoEmail;
  } else if (event_type === 'mentor_alert' || event_type === 'meeting_request_created') {
    recipient = mentor?.email || sharedDemoEmail;
  } else {
    recipient = sharedDemoEmail;
  }

  // 4. Throttle Check (Max 10 dispatches per minute per mentor)
  if (mentor_id && isThrottled(mentor_id)) {
    const eventId = `evt-throttle-${crypto.randomUUID()}`;
    await NotificationLogStore.createLog({
      event_id: eventId,
      idempotency_key,
      event_type,
      student_id,
      mentor_id,
      college_id: cleanCollegeId,
      channel: 'n8n',
      recipient,
      status: 'failed',
      error: 'Dispatch throttled: max 10 per minute per mentor'
    });
    return {
      event_id: eventId,
      status: 'failed',
      channel: 'n8n',
      error: 'Throttled: max 10 dispatches per minute per mentor'
    };
  }

  const eventId = `evt-${crypto.randomUUID()}`;
  const cleanSubject = escapeHtml(subject || 'InsightERP Academic Notification');
  const cleanBody = escapeHtml(body_text || '');

  const studentPayload = student ? {
    id: student.student_id,
    name: student.student_name,
    department: student.department,
    year: student.year_of_study
  } : null;

  const mentorPayload = mentor ? {
    id: mentor.faculty_id || mentor_id,
    name: mentor.name
  } : null;

  const transport = process.env.NOTIFY_TRANSPORT || 'n8n';

  // Handle dry-run mode
  if (transport === 'dry-run') {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[NOTIFY DRY RUN] [${event_type}] To: ${recipient} | Subject: ${cleanSubject}`);
    }
    await NotificationLogStore.createLog({
      event_id: eventId,
      idempotency_key,
      event_type,
      student_id,
      mentor_id,
      college_id: cleanCollegeId,
      channel: 'dry-run',
      recipient,
      status: 'sent',
      sentAt: new Date()
    });
    return { event_id: eventId, status: 'sent', channel: 'dry-run' };
  }

  // Handle direct SMTP transport
  if (transport === 'smtp') {
    try {
      await mailer.sendMail({
        to: recipient,
        subject: cleanSubject,
        text: cleanBody
      });
      await NotificationLogStore.createLog({
        event_id: eventId,
        idempotency_key,
        event_type,
        student_id,
        mentor_id,
        college_id: cleanCollegeId,
        channel: 'smtp_fallback',
        recipient,
        status: 'sent',
        sentAt: new Date()
      });
      return { event_id: eventId, status: 'sent', channel: 'smtp_fallback' };
    } catch (smtpErr) {
      await NotificationLogStore.createLog({
        event_id: eventId,
        idempotency_key,
        event_type,
        student_id,
        mentor_id,
        college_id: cleanCollegeId,
        channel: 'smtp_fallback',
        recipient,
        status: 'failed',
        error: smtpErr.message
      });
      return { event_id: eventId, status: 'failed', channel: 'smtp_fallback', error: smtpErr.message };
    }
  }

  // Handle n8n Transport
  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/insighterp-notify';
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET || '';

  const n8nPayload = {
    event_id: eventId,
    event_type,
    risk_level: risk_level || student?.dropout_risk_label || null,
    student: studentPayload,
    mentor: mentorPayload,
    recipient,
    subject: cleanSubject,
    body_text: cleanBody,
    created_at: new Date().toISOString()
  };

  let n8nSuccess = false;
  let n8nErrorMessage = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret
      },
      body: JSON.stringify(n8nPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json().catch(() => ({ status: 'sent' }));
      if (data.status === 'sent') {
        n8nSuccess = true;
      } else {
        n8nErrorMessage = `Unexpected response: ${JSON.stringify(data)}`;
      }
    } else {
      n8nErrorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (err) {
    n8nErrorMessage = err.message || 'Connection failed to n8n webhook';
  }

  if (n8nSuccess) {
    await NotificationLogStore.createLog({
      event_id: eventId,
      idempotency_key,
      event_type,
      student_id,
      mentor_id,
      college_id: cleanCollegeId,
      channel: 'n8n',
      recipient,
      status: 'sent',
      sentAt: new Date()
    });
    return { event_id: eventId, status: 'sent', channel: 'n8n' };
  }

  // n8n Failed -> Check fallback to SMTP
  const fallbackSmtp = process.env.NOTIFY_FALLBACK_SMTP === 'true';

  if (fallbackSmtp) {
    try {
      await mailer.sendMail({
        to: recipient,
        subject: cleanSubject,
        text: cleanBody
      });

      await NotificationLogStore.createLog({
        event_id: eventId,
        idempotency_key,
        event_type,
        student_id,
        mentor_id,
        college_id: cleanCollegeId,
        channel: 'smtp_fallback',
        recipient,
        status: 'sent',
        error: `n8n unreachable (${n8nErrorMessage}); dispatched via fallback SMTP`,
        sentAt: new Date()
      });

      return { event_id: eventId, status: 'sent', channel: 'smtp_fallback' };
    } catch (smtpErr) {
      await NotificationLogStore.createLog({
        event_id: eventId,
        idempotency_key,
        event_type,
        student_id,
        mentor_id,
        college_id: cleanCollegeId,
        channel: 'smtp_fallback',
        recipient,
        status: 'failed',
        error: `n8n failed: ${n8nErrorMessage}; SMTP fallback failed: ${smtpErr.message}`
      });

      return {
        event_id: eventId,
        status: 'failed',
        channel: 'smtp_fallback',
        error: smtpErr.message
      };
    }
  }

  // Fallback disabled -> Record failed log
  await NotificationLogStore.createLog({
    event_id: eventId,
    idempotency_key,
    event_type,
    student_id,
    mentor_id,
    college_id: cleanCollegeId,
    channel: 'n8n',
    recipient,
    status: 'failed',
    error: n8nErrorMessage
  });

  return {
    event_id: eventId,
    status: 'failed',
    channel: 'n8n',
    error: n8nErrorMessage
  };
}

/**
 * Dispatch in the background and return immediately so request is never blocked.
 */
function dispatchBackground(params) {
  setImmediate(() => {
    dispatch(params).catch(err => {
      console.warn('[NotificationDispatcher Background Error]', err.message);
    });
  });
}

module.exports = {
  dispatch,
  dispatchBackground,
  isThrottled,
  clearThrottleMap,
  escapeHtml
};
