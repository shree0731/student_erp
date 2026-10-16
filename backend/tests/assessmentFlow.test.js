const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../server');
const aiServiceClient = require('../services/aiServiceClient');
const notificationDispatcher = require('../services/notificationDispatcher');
const { executeAssessmentActions } = require('../services/assessmentActionEngine');
const { AssessmentStore } = require('../models/Assessment');
const { ActionLogStore } = require('../models/ActionLog');
const Student = require('../models/Student');
const csvProvider = require('../utils/csvDataProvider');

describe('Step 4 Part B & C: Student Assessment Flow & Deployment Verification Tests', () => {
  const originalEnv = { ...process.env };
  let mentorToken;
  let adminToken;
  let otherMentorToken;
  let studentToken;

  const validFeatures = {
    student_name: 'Rohit K Verma',
    department: 'CSE',
    year_of_study: 3,
    attendance_pct: 64.2,
    attendance_decay: 8.5,
    overall_gpa: 4.8,
    backlogs_count: 5,
    cutoff_mark_200: 172.5,
    family_income_annual: 240000.0,
    mentor_meetings_attended: 1,
    first_gen_learner: 1,
    distance_from_home_km: 42.0,
    failed_subjects_count: 5,
    core_theory_average: 49.5,
    internal_exam_avg: 24.0,
    assignment_avg: 5.5,
    grade_trend: -0.6
  };

  const featureNames = [
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

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_jwt_super_secret_for_hardening_2026';
    process.env.DEMO_PASSWORD = 'DemoPass@2026';
    process.env.OTP_ENABLED = 'false';
    app.set('trust proxy', 1);

    mentorToken = jwt.sign({
      username: 'mentor',
      role: 'mentor',
      linkedId: 'FAC_EEC_CSE_001',
      name: 'Dr. Kavitha Ramanathan',
      college_id: 'C101'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    otherMentorToken = jwt.sign({
      username: 'other_mentor',
      role: 'mentor',
      linkedId: 'FAC_EEC_CSE_999',
      name: 'Dr. Other Mentor',
      college_id: 'C101'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    adminToken = jwt.sign({
      username: 'admin',
      role: 'admin',
      linkedId: 'ADMIN_CHIEF_01',
      name: 'Academic Dean Office',
      college_id: 'C101'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    studentToken = jwt.sign({
      username: 'student',
      role: 'student',
      linkedId: 'STU_EEC_CSE_Y1_0001',
      name: 'Divya Sengottaiyan',
      college_id: 'C101'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    process.env = { ...originalEnv };
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(notificationDispatcher, 'dispatch').mockResolvedValue({
      status: 'sent',
      channel: 'smtp',
      message_id: 'mock-msg'
    });
    jest.spyOn(aiServiceClient, 'predictFromFeatures').mockResolvedValue({
      prediction: 'High',
      probabilities: { High: 0.90, Medium: 0.08, Low: 0.02 },
      top_risk_drivers: [],
      explanation_method: 'shap_tree_explainer'
    });
  });

  describe('B1 & B8. Validation and Access Control (POST /api/students/assess)', () => {
    test('returns 403 when called by a student', async () => {
      const res = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validFeatures);

      expect(res.status).toBe(403);
    });

    test('returns 422 if student_name is missing or empty', async () => {
      const payload = { ...validFeatures };
      delete payload.student_name;

      const res = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(payload);

      expect(res.status).toBe(422);
      expect(res.body.missing_field).toBe('student_name');
    });

    test('returns 422 if any recipient email is provided in the body', async () => {
      const emailFields = ['email', 'parent_email', 'mentor_email', 'recipient_email', 'recipient_emails'];

      for (const ef of emailFields) {
        const payload = { ...validFeatures, [ef]: 'alert@target.com' };
        const res = await request(app)
          .post('/api/students/assess')
          .set('Authorization', `Bearer ${mentorToken}`)
          .send(payload);

        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/recipient emails/i);
      }
    });

    test('returns 422 on each missing model feature (all 16 tested)', async () => {
      for (const feat of featureNames) {
        const payload = { ...validFeatures };
        delete payload[feat];

        const res = await request(app)
          .post('/api/students/assess')
          .set('Authorization', `Bearer ${mentorToken}`)
          .send(payload);

        expect(res.status).toBe(422);
        expect(res.body.missing_field).toBe(feat);
      }
    });
  });

  describe('B2 & B8. AI Gateway Failure and 503 Handling', () => {
    test('unreachable AI gateway returns 503 and creates NO student record', async () => {
      jest.spyOn(aiServiceClient, 'predictFromFeatures').mockImplementation(async () => {
        const err = new Error('The AI prediction gateway is unreachable. No prediction was produced.');
        err.status = 503;
        throw err;
      });

      const studentsBefore = (await csvProvider.getStudentsData()).length;

      const res = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(validFeatures);

      expect(res.status).toBe(503);
      expect(res.body.error).toBe('Service Unavailable');

      const studentsAfter = (await csvProvider.getStudentsData()).length;
      expect(studentsAfter).toBe(studentsBefore);
    });
  });

  describe('B3, B4 & B8. Action Engine Logic for High, Medium, Low Outcomes', () => {
    test('HIGH risk prediction creates exactly 1 urgent meeting request and dispatches mentor_alert + parent_alert', async () => {
      jest.spyOn(aiServiceClient, 'predictFromFeatures').mockResolvedValue({
        prediction: 'High',
        probabilities: { High: 0.88, Medium: 0.10, Low: 0.02 },
        top_risk_drivers: [
          { feature: 'attendance_pct', value: 64.2, impact: '+0.34' },
          { feature: 'failed_subjects_count', value: 5, impact: '+0.28' }
        ],
        explanation_method: 'shap_tree_explainer'
      });

      const dispatchSpy = jest.spyOn(notificationDispatcher, 'dispatch').mockResolvedValue({
        status: 'sent',
        channel: 'smtp',
        message_id: 'msg-test-high'
      });

      const res = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ ...validFeatures, student_name: 'High Risk Student Demo' });

      expect(res.status).toBe(201);
      expect(res.body.student.student_id).toMatch(/^STU_NEW_/);
      expect(res.body.student.dropout_risk_label).toBe('High');
      expect(res.body.student.source).toBe('assessed');

      // 1 urgent meeting + 2 dispatches = 3 action log entries
      expect(res.body.actions).toHaveLength(3);
      const steps = res.body.actions.map(a => a.step);
      expect(steps).toContain('create_urgent_meeting');
      expect(steps).toContain('dispatch_mentor_alert');
      expect(steps).toContain('dispatch_parent_alert');

      // Exactly 2 dispatches
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'mentor_alert' }));
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'parent_alert' }));
    });

    test('MEDIUM risk prediction creates 1 advisory meeting request and dispatches mentor_alert only', async () => {
      jest.spyOn(aiServiceClient, 'predictFromFeatures').mockResolvedValue({
        prediction: 'Medium',
        probabilities: { High: 0.22, Medium: 0.65, Low: 0.13 },
        top_risk_drivers: [
          { feature: 'attendance_decay', value: 8.5, impact: '+0.15' }
        ],
        explanation_method: 'shap_tree_explainer'
      });

      const dispatchSpy = jest.spyOn(notificationDispatcher, 'dispatch').mockResolvedValue({
        status: 'sent',
        channel: 'smtp',
        message_id: 'msg-test-med'
      });

      const res = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ ...validFeatures, student_name: 'Medium Risk Student Demo' });

      expect(res.status).toBe(201);
      expect(res.body.student.dropout_risk_label).toBe('Medium');

      // 1 advisory meeting + 1 mentor_alert = 2 action log entries
      expect(res.body.actions).toHaveLength(2);
      const steps = res.body.actions.map(a => a.step);
      expect(steps).toContain('create_advisory_meeting');
      expect(steps).toContain('dispatch_mentor_alert');

      // Exactly 1 dispatch
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'mentor_alert' }));
    });

    test('LOW risk prediction creates NO meeting request and NO dispatches, logs No intervention needed', async () => {
      jest.spyOn(aiServiceClient, 'predictFromFeatures').mockResolvedValue({
        prediction: 'Low',
        probabilities: { High: 0.04, Medium: 0.11, Low: 0.85 },
        top_risk_drivers: [],
        explanation_method: 'shap_tree_explainer'
      });

      const dispatchSpy = jest.spyOn(notificationDispatcher, 'dispatch').mockResolvedValue({
        status: 'sent',
        channel: 'smtp'
      });

      const res = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ ...validFeatures, student_name: 'Low Risk Student Demo' });

      expect(res.status).toBe(201);
      expect(res.body.student.dropout_risk_label).toBe('Low');

      expect(res.body.actions).toHaveLength(1);
      expect(res.body.actions[0].step).toBe('evaluate_interventions');
      expect(res.body.actions[0].status).toBe('skipped');
      expect(res.body.actions[0].detail).toBe('No intervention needed');

      // 0 dispatches
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    test('the same assessment_id never acts twice (Idempotency)', async () => {
      const assessmentId = `TEST_IDEMP_${Date.now()}`;
      const dispatchSpy = jest.spyOn(notificationDispatcher, 'dispatch').mockResolvedValue({ status: 'sent' });

      // First run: executes actions
      const firstRun = await executeAssessmentActions({
        assessment_id: assessmentId,
        student_id: 'STU_TEST_001',
        student_name: 'Idempotency Tester',
        mentor_id: 'FAC_EEC_CSE_001',
        college_id: 'C101',
        prediction: 'High'
      });

      expect(firstRun.idempotent).toBe(false);
      expect(firstRun.logs).toHaveLength(3);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);

      // Second run: returns idempotent without re-executing
      const secondRun = await executeAssessmentActions({
        assessment_id: assessmentId,
        student_id: 'STU_TEST_001',
        student_name: 'Idempotency Tester',
        mentor_id: 'FAC_EEC_CSE_001',
        college_id: 'C101',
        prediction: 'High'
      });

      expect(secondRun.idempotent).toBe(true);
      expect(secondRun.logs).toHaveLength(3);
      // Dispatch spy count unchanged
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    test('dispatcher failure leaves the assessment and student successfully saved', async () => {
      jest.spyOn(aiServiceClient, 'predictFromFeatures').mockResolvedValue({
        prediction: 'High',
        probabilities: { High: 0.90, Medium: 0.08, Low: 0.02 },
        top_risk_drivers: []
      });

      // Dispatcher throws network/SMTP error
      jest.spyOn(notificationDispatcher, 'dispatch').mockRejectedValue(new Error('SMTP connection refused'));

      const res = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ ...validFeatures, student_name: 'Fault Tolerant Student' });

      // Assessment still succeeds with 201
      expect(res.status).toBe(201);
      expect(res.body.student.student_name).toBe('Fault Tolerant Student');
      expect(res.body.assessment).toBeDefined();

      // Action log records failure for the dispatches
      const failedLogs = res.body.actions.filter(a => a.status === 'failed');
      expect(failedLogs.length).toBeGreaterThan(0);
    });
  });

  describe('B5. Assessment History & Actions Endpoints Access Control', () => {
    let testStudentId;

    beforeAll(async () => {
      jest.spyOn(aiServiceClient, 'predictFromFeatures').mockResolvedValue({
        prediction: 'Medium',
        probabilities: { High: 0.2, Medium: 0.7, Low: 0.1 },
        top_risk_drivers: []
      });

      const res = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ ...validFeatures, student_name: 'History Test Student' });

      testStudentId = res.body.student.student_id;
    });

    test('assigned mentor can retrieve assessments and actions', async () => {
      const assessRes = await request(app)
        .get(`/api/students/${testStudentId}/assessments`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(assessRes.status).toBe(200);
      expect(assessRes.body.student_id).toBe(testStudentId);
      expect(assessRes.body.total).toBeGreaterThanOrEqual(1);

      const actionRes = await request(app)
        .get(`/api/students/${testStudentId}/actions`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(actionRes.status).toBe(200);
      expect(actionRes.body.student_id).toBe(testStudentId);
      expect(actionRes.body.total).toBeGreaterThanOrEqual(1);
    });

    test('admin from same college can retrieve assessments and actions', async () => {
      const res = await request(app)
        .get(`/api/students/${testStudentId}/assessments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test('unassigned mentor receives 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/students/${testStudentId}/assessments`)
        .set('Authorization', `Bearer ${otherMentorToken}`);

      expect(res.status).toBe(403);
    });

    test('student role receives 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/students/${testStudentId}/assessments`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('B6. Demo Examples (GET /api/assess/examples)', () => {
    test('returns 9 demo students without model_prediction, true_label, or expected_risk', async () => {
      const res = await request(app)
        .get('/api/assess/examples')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(9);
      expect(res.body.data).toHaveLength(9);

      for (const entry of res.body.data) {
        expect(entry.student_name).toBeDefined();
        expect(entry.department).toBeDefined();
        expect(entry.year_of_study).toBeDefined();
        expect(entry.model_prediction).toBeUndefined();
        expect(entry.true_label).toBeUndefined();
        expect(entry.expected_risk).toBeUndefined();
      }
    });

    test('returns 403 for student role', async () => {
      const res = await request(app)
        .get('/api/assess/examples')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('C3. Proxy Awareness & Rate Limiting Behind Host Proxy', () => {
    test('Express trust proxy is enabled and authLimiter respects proxy headers', async () => {
      expect(app.get('trust proxy')).toBeTruthy();

      process.env.TEST_RATE_LIMIT = 'true';
      const forwardedIp = '198.51.100.42';

      // Send requests through simulated reverse proxy
      const reqPromises = [];
      for (let i = 0; i < 11; i++) {
        reqPromises.push(
          request(app)
            .post('/api/auth/login')
            .set('X-Forwarded-For', forwardedIp)
            .send({ username: 'mentor', password: 'wrong_password_test' })
        );
      }

      const responses = await Promise.all(reqPromises);
      const statuses = responses.map(r => r.status);

      // At least one request beyond the limit (10) must be 429
      expect(statuses).toContain(429);
      delete process.env.TEST_RATE_LIMIT;
    });
  });

  describe('B3. New student appears in roster and admin summary without hardcoded numbers', () => {
    test('new assessed student shows up dynamically in students list and admin summary', async () => {
      jest.spyOn(aiServiceClient, 'predictFromFeatures').mockResolvedValue({
        prediction: 'High',
        probabilities: { High: 0.91, Medium: 0.07, Low: 0.02 },
        top_risk_drivers: []
      });

      const uniqueName = `Assessed Student ${Date.now()}`;
      const assessRes = await request(app)
        .post('/api/students/assess')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ ...validFeatures, student_name: uniqueName });

      expect(assessRes.status).toBe(201);
      const newId = assessRes.body.student.student_id;

      // 1. Verify student list
      const studentsRes = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(studentsRes.status).toBe(200);
      const studentItems = studentsRes.body.data || studentsRes.body;
      const foundInRoster = studentItems.find(s => s.student_id === newId);
      expect(foundInRoster).toBeDefined();
      expect(foundInRoster.student_name).toBe(uniqueName);

      // 2. Verify admin summary
      const adminRes = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.summary.totalStudents).toBeGreaterThan(0);
    });
  });
});
