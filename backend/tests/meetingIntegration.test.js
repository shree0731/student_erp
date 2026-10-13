const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'test_jwt_super_secret_for_hardening_2026';
process.env.ERP_SERVICE_API_KEY = 'test_erp_service_api_key_very_secret_32chars!';

const app = require('../server');
const MeetingRequest = require('../models/MeetingRequest');
const { getDBStatus } = require('../config/db');

describe('Task 2 — ERP Meeting Request Ingest & Role-Scoped Access Control', () => {
  let mentorToken1;
  let mentorToken2;
  let studentToken1;
  let studentToken2;
  let adminToken;

  const validServiceKey = process.env.ERP_SERVICE_API_KEY;

  beforeAll(async () => {
    mentorToken1 = jwt.sign({
      username: 'mentor1',
      role: 'mentor',
      linkedId: 'FAC_EEC_CSE_001',
      name: 'Dr. Kavitha Ramanathan'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    mentorToken2 = jwt.sign({
      username: 'mentor2',
      role: 'mentor',
      linkedId: 'FAC_EEC_CSE_014',
      name: 'Dr. Senthil Kumar'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    studentToken1 = jwt.sign({
      username: 'student1',
      role: 'student',
      linkedId: 'STU_EEC_CSE_Y1_0001',
      name: 'Divya Sengottaiyan'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    studentToken2 = jwt.sign({
      username: 'student2',
      role: 'student',
      linkedId: 'STU_EEC_CSE_Y1_0002',
      name: 'Santhosh Krishnan'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    adminToken = jwt.sign({
      username: 'admin',
      role: 'admin',
      linkedId: 'ADMIN_CHIEF_01',
      name: 'Academic Dean Office'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('1. Service Ingest Authentication & Idempotency', () => {
    const testRequestId = crypto.randomUUID();

    test('Missing X-Service-Key returns 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/integrations/meeting-requests')
        .send({
          request_id: testRequestId,
          student_id: 'STU_EEC_CSE_Y1_0001',
          category: 'crisis',
          reason_short: 'Immediate emotional distress / crisis detection'
        });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    test('Wrong X-Service-Key returns 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/integrations/meeting-requests')
        .set('X-Service-Key', 'wrong_service_key_attempt')
        .send({
          request_id: testRequestId,
          student_id: 'STU_EEC_CSE_Y1_0001',
          category: 'crisis',
          reason_short: 'Immediate emotional distress / crisis detection'
        });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    test('Valid service key creates request (201)', async () => {
      const res = await request(app)
        .post('/api/integrations/meeting-requests')
        .set('X-Service-Key', validServiceKey)
        .send({
          request_id: testRequestId,
          student_id: 'STU_EEC_CSE_Y1_0001',
          category: 'crisis',
          reason_short: 'Immediate emotional distress / crisis detection'
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.request_id).toBe(testRequestId);
      expect(res.body.status).toBe('new');
      expect(res.body).toHaveProperty('mentor_name');
    });

    test('Ingest is idempotent: submitting same request_id returns 200 duplicate', async () => {
      const res = await request(app)
        .post('/api/integrations/meeting-requests')
        .set('X-Service-Key', validServiceKey)
        .send({
          request_id: testRequestId,
          student_id: 'STU_EEC_CSE_Y1_0001',
          category: 'crisis',
          reason_short: 'Immediate emotional distress / crisis detection'
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.duplicate).toBe(true);
      expect(res.body.request_id).toBe(testRequestId);
    });
  });

  describe('2. Role-Scoped Permissions & Mentor Ownership', () => {
    let reqMentor1Id;
    let reqMentor2Id;

    beforeAll(async () => {
      if (getDBStatus()) {
        reqMentor1Id = crypto.randomUUID();
        reqMentor2Id = crypto.randomUUID();

        await MeetingRequest.create([
          {
            request_id: reqMentor1Id,
            student_id: 'STU_EEC_CSE_Y1_0037',
            mentor_id: 'FAC_EEC_CSE_001',
            college_id: 'C101',
            category: 'academic',
            urgency: 'normal',
            reason_short: 'Academic performance review & CIA marks advisory',
            status: 'new'
          },
          {
            request_id: reqMentor2Id,
            student_id: 'STU_EEC_CSE_Y1_0001',
            mentor_id: 'FAC_EEC_CSE_014',
            college_id: 'C101',
            category: 'crisis',
            urgency: 'urgent',
            reason_short: 'Immediate emotional distress / crisis detection',
            status: 'new'
          }
        ]);
      }
    });

    test('Student calling /api/meeting-requests returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/meeting-requests')
        .set('Authorization', `Bearer ${studentToken1}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    test('Mentor 1 only sees requests assigned to mentor_id FAC_EEC_CSE_001', async () => {
      if (!getDBStatus()) return;
      const res = await request(app)
        .get('/api/meeting-requests')
        .set('Authorization', `Bearer ${mentorToken1}`);
      expect(res.status).toBe(200);
      const allMine = res.body.data.every(r => r.mentor_id === 'FAC_EEC_CSE_001');
      expect(allMine).toBe(true);
    });

    test('Mentor 1 cannot update Mentor 2 request status (403 Forbidden)', async () => {
      if (!getDBStatus()) return;
      const res = await request(app)
        .patch(`/api/meeting-requests/${reqMentor2Id}/status`)
        .set('Authorization', `Bearer ${mentorToken1}`)
        .send({ status: 'acknowledged' });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    test('Mentor 1 can update own mentee request status (200)', async () => {
      if (!getDBStatus()) return;
      const res = await request(app)
        .patch(`/api/meeting-requests/${reqMentor1Id}/status`)
        .set('Authorization', `Bearer ${mentorToken1}`)
        .send({ status: 'acknowledged' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('acknowledged');
    });

    test('Admin sees all requests across all mentors', async () => {
      if (!getDBStatus()) return;
      const res = await request(app)
        .get('/api/meeting-requests')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
    });

    test('Student 1 gets only their own requests from /api/meeting-requests/my', async () => {
      if (!getDBStatus()) return;
      const res = await request(app)
        .get('/api/meeting-requests/my')
        .set('Authorization', `Bearer ${studentToken1}`);
      expect(res.status).toBe(200);
      const allMine = res.body.data.every(r => r.student_id === 'STU_EEC_CSE_Y1_0001');
      expect(allMine).toBe(true);
    });
  });
});
