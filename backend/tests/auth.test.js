const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'test_jwt_super_secret_for_hardening_2026';
process.env.DEMO_PASSWORD = 'TestPassword123!';

const app = require('../server');

describe('Task 2 — Authentication & Authorization Verification Tests', () => {
  let studentTokenA;
  let studentTokenB;
  let mentorToken;
  let adminToken;

  beforeAll(async () => {
    // STU_EEC_CSE_Y1_0001 is assigned to mentor FAC_EEC_CSE_014
    studentTokenA = jwt.sign({
      username: 'student',
      role: 'student',
      linkedId: 'STU_EEC_CSE_Y1_0001',
      name: 'Divya Sengottaiyan'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    studentTokenB = jwt.sign({
      username: 'student2',
      role: 'student',
      linkedId: 'STU_EEC_CSE_Y1_0002',
      name: 'Santhosh Krishnan'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Mentor FAC_EEC_CSE_001 has assigned students ['STU_EEC_CSE_Y1_0037', ...]
    mentorToken = jwt.sign({
      username: 'mentor',
      role: 'mentor',
      linkedId: 'FAC_EEC_CSE_001',
      name: 'Dr. Kavitha Ramanathan'
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

  test('POST /api/auth/login with valid credentials returns 200 and signed JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: process.env.DEMO_PASSWORD
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('admin');
  });

  test('POST /api/auth/login with invalid password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'wrong_password_attempt'
      });
    expect(res.status).toBe(401);
  });

  test('(a) Unauthenticated request to /api/students/:id returns 401', async () => {
    const res = await request(app).get('/api/students/STU_EEC_CSE_Y1_0001');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('(b) Student A requesting Student B record returns 403', async () => {
    const res = await request(app)
      .get('/api/students/STU_EEC_CSE_Y1_0002')
      .set('Authorization', `Bearer ${studentTokenA}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  test('(b.2) Student A requesting own record returns 200', async () => {
    const res = await request(app)
      .get('/api/students/STU_EEC_CSE_Y1_0001')
      .set('Authorization', `Bearer ${studentTokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.data.student_id).toBe('STU_EEC_CSE_Y1_0001');
  });

  test('(c) Mentor requesting a non-assigned student returns 403', async () => {
    // STU_EEC_CSE_Y1_0001 is assigned to FAC_EEC_CSE_014, NOT to FAC_EEC_CSE_001
    const res = await request(app)
      .get('/api/students/STU_EEC_CSE_Y1_0001')
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  test('(c.2) Mentor requesting assigned mentee returns 200', async () => {
    // STU_EEC_CSE_Y1_0037 is assigned to FAC_EEC_CSE_001
    const res = await request(app)
      .get('/api/students/STU_EEC_CSE_Y1_0037')
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.student_id).toBe('STU_EEC_CSE_Y1_0037');
  });

  test('(d) Student calling /api/admin/summary returns 403', async () => {
    const res = await request(app)
      .get('/api/admin/summary')
      .set('Authorization', `Bearer ${studentTokenA}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  test('(d.2) Admin calling /api/admin/summary returns 200', async () => {
    const res = await request(app)
      .get('/api/admin/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('(e) Tampered token returns 401', async () => {
    const tampered = studentTokenA.slice(0, -6) + 'abcdef';
    const res = await request(app)
      .get('/api/students/STU_EEC_CSE_Y1_0001')
      .set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('(e.2) Expired token returns 401', async () => {
    const expiredToken = jwt.sign({
      username: 'student',
      role: 'student',
      linkedId: 'STU_EEC_CSE_Y1_0001'
    }, process.env.JWT_SECRET, { expiresIn: '0s' });

    const res = await request(app)
      .get('/api/students/STU_EEC_CSE_Y1_0001')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});
