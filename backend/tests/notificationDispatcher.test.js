const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const mailer = require('../services/mailer');
const notificationDispatcher = require('../services/notificationDispatcher');
const { NotificationLogStore, inMemoryNotificationLogs } = require('../models/NotificationLog');

describe('Step 3: Notification Dispatcher & n8n Automation Tests', () => {
  const originalEnv = { ...process.env };
  let originalFetch;
  let originalSendMail;

  const JWT_SECRET = 'test_jwt_super_secret_for_hardening_2026';

  let mentorToken;
  let otherMentorToken;
  let studentToken;
  let adminToken;
  let otherCollegeAdminToken;

  beforeAll(() => {
    mentorToken = jwt.sign({
      username: 'mentor',
      role: 'mentor',
      linkedId: 'FAC_MIST_IT_333',
      name: 'Dr. Sudha Rajagopalan',
      collegeId: 'C103'
    }, JWT_SECRET, { expiresIn: '1h' });

    otherMentorToken = jwt.sign({
      username: 'other_mentor',
      role: 'mentor',
      linkedId: 'FAC_EEC_CSE_001',
      name: 'Dr. Kavitha Ramanathan',
      collegeId: 'C101'
    }, JWT_SECRET, { expiresIn: '1h' });

    studentToken = jwt.sign({
      username: 'student',
      role: 'student',
      linkedId: 'STU_MIST_IT_Y3_5559',
      name: 'Bhoomika Gowda',
      collegeId: 'C103'
    }, JWT_SECRET, { expiresIn: '1h' });

    adminToken = jwt.sign({
      username: 'admin',
      role: 'admin',
      linkedId: 'ADMIN_CHIEF_01',
      name: 'Central Dean Office',
      collegeId: 'C103'
    }, JWT_SECRET, { expiresIn: '1h' });

    otherCollegeAdminToken = jwt.sign({
      username: 'admin_c101',
      role: 'admin',
      linkedId: 'ADMIN_C101_01',
      name: 'AEC Dean',
      collegeId: 'C101'
    }, JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    process.env.NOTIFY_TRANSPORT = 'n8n';
    process.env.N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/insighterp-notify';
    process.env.N8N_WEBHOOK_SECRET = 'super_secret_n8n_test_key_12345';
    process.env.NOTIFY_FALLBACK_SMTP = 'true';
    process.env.DEMO_SHARED_EMAIL = 'grouppresentation785@gmail.com';
    process.env.JWT_SECRET = JWT_SECRET;

    NotificationLogStore.clearInMemory();
    notificationDispatcher.clearThrottleMap();

    originalFetch = global.fetch;
    originalSendMail = mailer.sendMail;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mailer.sendMail = originalSendMail;
    process.env = { ...originalEnv };
  });

  test('n8n called with the secret header and correct payload structure', async () => {
    let capturedUrl = null;
    let capturedHeaders = null;
    let capturedBody = null;

    global.fetch = jest.fn(async (url, opts) => {
      capturedUrl = url;
      capturedHeaders = opts.headers;
      capturedBody = JSON.parse(opts.body);
      return {
        ok: true,
        json: async () => ({ status: 'sent', event_id: capturedBody.event_id })
      };
    });

    const res = await notificationDispatcher.dispatch({
      event_type: 'parent_alert',
      student_id: 'STU_MIST_IT_Y3_5559',
      mentor_id: 'FAC_MIST_IT_333',
      subject: 'Academic Standing Alert',
      body_text: 'Student has 1 arrear requiring counseling.',
      idempotency_key: 'test-key-001'
    });

    expect(res.status).toBe('sent');
    expect(res.channel).toBe('n8n');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(capturedUrl).toBe('http://localhost:5678/webhook/insighterp-notify');
    expect(capturedHeaders['X-Webhook-Secret']).toBe('super_secret_n8n_test_key_12345');
    expect(capturedBody.event_type).toBe('parent_alert');
    expect(capturedBody.student.id).toBe('STU_MIST_IT_Y3_5559');
    expect(capturedBody.recipient).toBe('grouppresentation785@gmail.com');
  });

  test('n8n failure falls back to SMTP and logs channel smtp_fallback', async () => {
    // Mock n8n network failure
    global.fetch = jest.fn(async () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:5678');
    });

    let sentViaSmtp = false;
    mailer.sendMail = jest.fn(async () => {
      sentViaSmtp = true;
      return { messageId: 'smtp-fallback-123' };
    });

    const res = await notificationDispatcher.dispatch({
      event_type: 'parent_alert',
      student_id: 'STU_MIST_IT_Y3_5559',
      mentor_id: 'FAC_MIST_IT_333',
      subject: 'Fallback Alert',
      body_text: 'Testing SMTP fallback.',
      idempotency_key: 'test-key-fallback'
    });

    expect(res.status).toBe('sent');
    expect(res.channel).toBe('smtp_fallback');
    expect(sentViaSmtp).toBe(true);

    // Verify log record
    const log = await NotificationLogStore.findByIdempotencyKey('test-key-fallback');
    expect(log).toBeDefined();
    expect(log.channel).toBe('smtp_fallback');
    expect(log.status).toBe('sent');
  });

  test('fallback disabled logs failed status when n8n is unreachable', async () => {
    process.env.NOTIFY_FALLBACK_SMTP = 'false';

    global.fetch = jest.fn(async () => {
      throw new Error('500 Internal Server Error');
    });

    mailer.sendMail = jest.fn();

    const res = await notificationDispatcher.dispatch({
      event_type: 'mentor_alert',
      student_id: 'STU_MIST_IT_Y3_5559',
      mentor_id: 'FAC_MIST_IT_333',
      subject: 'No Fallback Alert',
      body_text: 'Testing failed logging.',
      idempotency_key: 'test-key-no-fallback'
    });

    expect(res.status).toBe('failed');
    expect(mailer.sendMail).not.toHaveBeenCalled();

    const log = await NotificationLogStore.findByIdempotencyKey('test-key-no-fallback');
    expect(log.status).toBe('failed');
  });

  test('same idempotency_key sends once', async () => {
    global.fetch = jest.fn(async (url, opts) => ({
      ok: true,
      json: async () => ({ status: 'sent' })
    }));

    const dispatch1 = await notificationDispatcher.dispatch({
      event_type: 'meeting_request_created',
      student_id: 'STU_MIST_IT_Y3_5559',
      mentor_id: 'FAC_MIST_IT_333',
      subject: 'Guidance Session',
      body_text: 'Counseling requested.',
      idempotency_key: 'idempotent-once'
    });
    expect(dispatch1.status).toBe('sent');
    expect(dispatch1.idempotent_skipped).toBeUndefined();

    // Second call with same idempotency_key
    const dispatch2 = await notificationDispatcher.dispatch({
      event_type: 'meeting_request_created',
      student_id: 'STU_MIST_IT_Y3_5559',
      mentor_id: 'FAC_MIST_IT_333',
      subject: 'Duplicate attempt',
      body_text: 'Duplicate body.',
      idempotency_key: 'idempotent-once'
    });
    expect(dispatch2.idempotent_skipped).toBe(true);

    // Fetch should have been invoked exactly ONCE
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('recipient is never taken from the request body (no open relay)', async () => {
    let capturedRecipient = null;
    global.fetch = jest.fn(async (url, opts) => {
      const body = JSON.parse(opts.body);
      capturedRecipient = body.recipient;
      return { ok: true, json: async () => ({ status: 'sent' }) };
    });

    // An attacker tries sending recipient: 'attacker@malicious.com' in the body to POST /api/students/:id/parent-alert
    const res = await request(app)
      .post('/api/students/STU_MIST_IT_Y3_5559/parent-alert')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        recipient: 'attacker@malicious.com',
        email: 'attacker@malicious.com',
        message: 'Spam relay test'
      });

    expect(res.status).toBe(200);
    // Recipient must be resolved from server configuration / student records, NOT attacker's input
    expect(capturedRecipient).not.toBe('attacker@malicious.com');
    expect(capturedRecipient).toBe('grouppresentation785@gmail.com');
  });

  test('throttle restricts at most 10 dispatches per minute per mentor', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ status: 'sent' })
    }));

    const mentorId = 'FAC_THROTTLE_TEST_99';

    // 10 successful dispatches
    for (let i = 1; i <= 10; i++) {
      const res = await notificationDispatcher.dispatch({
        event_type: 'mentor_alert',
        student_id: 'STU_MIST_IT_Y3_5559',
        mentor_id: mentorId,
        subject: `Notice ${i}`,
        body_text: 'Testing limits.',
        idempotency_key: `throttle-key-${i}`
      });
      expect(res.status).toBe('sent');
    }

    // 11th dispatch must be throttled and fail
    const throttledRes = await notificationDispatcher.dispatch({
      event_type: 'mentor_alert',
      student_id: 'STU_MIST_IT_Y3_5559',
      mentor_id: mentorId,
      subject: 'Notice 11',
      body_text: 'Should be blocked.',
      idempotency_key: 'throttle-key-11'
    });

    expect(throttledRes.status).toBe('failed');
    expect(throttledRes.error).toMatch(/throttled/i);
  });

  test('a failing dispatch does not fail meeting-request creation', async () => {
    // Simulate n8n and SMTP both failing completely
    global.fetch = jest.fn(async () => {
      throw new Error('Fatal n8n network failure');
    });
    mailer.sendMail = jest.fn(async () => {
      throw new Error('Fatal SMTP connection refused');
    });

    // Student creates a meeting request
    const res = await request(app)
      .post('/api/meeting-requests')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        reason_short: 'Urgent consultation on exam preparation',
        category: 'academic'
      });

    // Meeting request MUST succeed with 201 regardless of notification dispatch failure
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.request_id).toBeDefined();
  });

  test('/notifications/log enforces strict role and ownership access control', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ status: 'sent' }) }));

    // Dispatch a test alert for STU_MIST_IT_Y3_5559
    await notificationDispatcher.dispatch({
      event_type: 'parent_alert',
      student_id: 'STU_MIST_IT_Y3_5559',
      mentor_id: 'FAC_MIST_IT_333',
      college_id: 'C103',
      subject: 'Audit Log Test',
      body_text: 'Testing log retrieval.'
    });

    // 1. Student gets 403 Forbidden
    const studentRes = await request(app)
      .get('/api/notifications/log?student_id=STU_MIST_IT_Y3_5559')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentRes.status).toBe(403);

    // 2. Another mentor (not assigned) gets 403 Forbidden
    const otherMentorRes = await request(app)
      .get('/api/notifications/log?student_id=STU_MIST_IT_Y3_5559')
      .set('Authorization', `Bearer ${otherMentorToken}`);
    expect(otherMentorRes.status).toBe(403);

    // 3. Admin of another college gets 403 Forbidden
    const otherAdminRes = await request(app)
      .get('/api/notifications/log?student_id=STU_MIST_IT_Y3_5559')
      .set('Authorization', `Bearer ${otherCollegeAdminToken}`);
    expect(otherAdminRes.status).toBe(403);

    // 4. Assigned mentor gets 200 OK with logs
    const mentorRes = await request(app)
      .get('/api/notifications/log?student_id=STU_MIST_IT_Y3_5559')
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(mentorRes.status).toBe(200);
    expect(mentorRes.body.success).toBe(true);
    expect(mentorRes.body.count).toBeGreaterThanOrEqual(1);

    // 5. Admin of same college gets 200 OK with logs
    const adminRes = await request(app)
      .get('/api/notifications/log?student_id=STU_MIST_IT_Y3_5559')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.count).toBeGreaterThanOrEqual(1);
  });
});
