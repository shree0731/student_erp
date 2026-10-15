const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { aiServiceClient, mapStudentToPredictionPayload, getPrediction } = require('../services/aiServiceClient');
const csvProvider = require('../utils/csvDataProvider');
const { inMemoryNotes } = require('../controllers/mentorNoteController');
const { inMemoryRequests } = require('../controllers/integrationController');

const JWT_SECRET = process.env.JWT_SECRET || 'student_dropout_erp_secret_key_2026';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('Step 2: Data-Correctness Backend Verification Suite', () => {
  const adminToken = generateToken({
    id: 'user_admin',
    username: 'admin',
    role: 'admin',
    linkedId: 'ADMIN_CHIEF_01',
    collegeId: 'C101'
  });

  const mentorToken = generateToken({
    id: 'user_mentor',
    username: 'mentor',
    role: 'mentor',
    linkedId: 'FAC_MIST_IT_333',
    collegeId: 'C103'
  });

  const otherMentorToken = generateToken({
    id: 'user_other_mentor',
    username: 'other_mentor',
    role: 'mentor',
    linkedId: 'FAC_EEC_CSE_001',
    collegeId: 'C101'
  });

  const studentToken = generateToken({
    id: 'user_student',
    username: 'student',
    role: 'student',
    linkedId: 'STU_MIST_IT_Y3_5559',
    collegeId: 'C103'
  });

  beforeEach(() => {
    inMemoryNotes.clear();
    inMemoryRequests.clear();
  });

  // =========================================================================
  // TASK 1: Real Model Metrics Proxy & 503 Behavior
  // =========================================================================
  describe('Task 1: GET /api/ml/metrics', () => {
    test('proxies real model metrics when AI service responds', async () => {
      const mockRaw = {
        model_name: 'XGBoostClassifier',
        accuracy: 0.9560,
        macro_f1: 0.9265,
        confusion_matrix: [[1429, 73, 0], [6, 176, 1], [0, 1, 154]],
        classes: {
          'Low': { precision: 0.9958, recall: 0.9514, f1_score: 0.9731 },
          'Medium': { precision: 0.7040, recall: 0.9617, f1_score: 0.8129 },
          'High': { precision: 0.9935, recall: 0.9935, f1_score: 0.9935 }
        },
        feature_importance: [
          { feature: 'backlogs_count', importance: 0.62 },
          { feature: 'internal_exam_avg', importance: 0.12 }
        ],
        data_summary: {
          total_students: 9200,
          held_out_test_set: 1840
        }
      };

      const originalGetMetrics = aiServiceClient.getMetrics;
      aiServiceClient.getMetrics = jest.fn().mockResolvedValue(mockRaw);

      try {
        const res = await request(app)
          .get('/api/ml/metrics')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.accuracy).toBe(0.956);
        expect(res.body.f1_macro).toBe(0.9265);
        expect(res.body.confusion_matrix).toEqual([[1429, 73, 0], [6, 176, 1], [0, 1, 154]]);
        expect(res.body.classes).toEqual(['Low', 'Medium', 'High']);
        expect(res.body.top_feature_importances).toEqual([['backlogs_count', 0.62], ['internal_exam_avg', 0.12]]);
      } finally {
        aiServiceClient.getMetrics = originalGetMetrics;
      }
    });

    test('returns 503 with error and message when AI service is unreachable', async () => {
      const originalGetMetrics = aiServiceClient.getMetrics;
      aiServiceClient.getMetrics = jest.fn().mockResolvedValue(null);

      try {
        const res = await request(app)
          .get('/api/ml/metrics')
          .set('Authorization', `Bearer ${mentorToken}`);

        expect(res.status).toBe(503);
        expect(res.body.error).toBe('Service Unavailable');
        expect(res.body.message).toMatch(/unavailable/i);
      } finally {
        aiServiceClient.getMetrics = originalGetMetrics;
      }
    });
  });

  // =========================================================================
  // TASK 2: Admin Summary Accuracy in CSV Mode
  // =========================================================================
  describe('Task 2: GET /api/admin/summary CSV row counts', () => {
    test('summary totals equal row counts in data/students.csv and includes meeting_requests', async () => {
      const students = await csvProvider.getStudentsData();
      const expectedTotal = students.length;

      const res = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(res.body.summary.totalStudents).toBe(expectedTotal);
      expect(res.body.summary.meeting_requests).toBeDefined();
      expect(res.body.summary.meeting_requests).toHaveProperty('total');
      expect(res.body.summary.meeting_requests).toHaveProperty('pending');
      expect(res.body.summary.meeting_requests).toHaveProperty('resolved');
      expect(res.body.summary.meeting_requests).toHaveProperty('cancelled');
    });
  });

  // =========================================================================
  // TASK 4: ERP Must Never Invent Model Inputs
  // =========================================================================
  describe('Task 4: Feature mapping and insufficient_data handling', () => {
    test('student with no marks returns missing features and source insufficient_data without calling fetch', async () => {
      const student = {
        student_id: 'STU_TEST_001',
        department: 'Information Technology',
        year_of_study: 3,
        attendance_pct: 70.8,
        overall_gpa: 1.39,
        backlogs_count: 27,
        cutoff_mark_200: 165,
        mentor_meetings_attended: 2,
        family_income_annual: 450000,
        first_gen_learner: 0,
        distance_from_home_km: 25,
        monthly_attendance_trend: [80, 75, 70, 65]
      };

      const { payload, missing } = mapStudentToPredictionPayload(student, []);
      expect(missing.length).toBeGreaterThan(0);
      expect(missing).toContain('core_theory_average');
      expect(missing).toContain('internal_exam_avg');
      expect(missing).toContain('assignment_avg');

      const originalFetch = global.fetch;
      const fetchMock = jest.fn();
      global.fetch = fetchMock;

      try {
        const predictionResult = await getPrediction({ payload, missing }, 'High');
        expect(predictionResult.prediction).toBeNull();
        expect(predictionResult.source).toBe('insufficient_data');
        expect(predictionResult.missing_features).toEqual(missing);
        expect(predictionResult.fallback_label).toBe('High');
        expect(fetchMock).not.toHaveBeenCalled();
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('student with marks computes all 16 features matching formulas with student department as stored', () => {
      const student = {
        student_id: 'STU_TEST_002',
        department: 'Artificial Intelligence',
        year_of_study: 2,
        attendance_pct: 82.5,
        overall_gpa: 7.4,
        backlogs_count: 1,
        cutoff_mark_200: 178,
        mentor_meetings_attended: 3,
        family_income_annual: 600000,
        first_gen_learner: 1,
        distance_from_home_km: 14,
        monthly_attendance_trend: [88, 85, 83, 82.5]
      };

      const marks = [
        {
          semester: 3,
          subject_name: 'Deep Learning',
          subject_type: 'Theory',
          internal_exam_1_marks: 40,
          internal_exam_2_marks: 44,
          assignment_1_marks: 8,
          assignment_2_marks: 9,
          total_marks: 85,
          grade_point: 9,
          result: 'Pass'
        },
        {
          semester: 4,
          subject_name: 'Computer Vision',
          subject_type: 'Theory',
          internal_exam_1_marks: 30,
          internal_exam_2_marks: 32,
          assignment_1_marks: 6,
          assignment_2_marks: 7,
          total_marks: 45,
          grade_point: 0,
          result: 'Arrear'
        }
      ];

      const { payload, missing } = mapStudentToPredictionPayload(student, marks);
      expect(missing).toEqual([]);
      expect(payload.department).toBe('Artificial Intelligence');
      expect(payload.failed_subjects_count).toBe(1);
      expect(payload.core_theory_average).toBe(65); // (85 + 45) / 2
      expect(payload.internal_exam_avg).toBe(36.5); // (((40+44)/2) + ((30+32)/2)) / 2 = (42 + 31) / 2 = 36.5
      expect(payload.assignment_avg).toBe(7.5); // (((8+9)/2) + ((6+7)/2)) / 2 = (8.5 + 6.5) / 2 = 7.5
      expect(payload.grade_trend).toBe(-9); // last sem avg 0 - first sem avg 9 = -9
      expect(payload.attendance_decay).toBe(5.5); // 88 - 82.5 = 5.5
    });
  });

  // =========================================================================
  // TASK 6: Meeting Requests Status Lifecycle and Security
  // =========================================================================
  describe('Task 6: Meeting Requests Lifecycle & Permissions', () => {
    test('createMeetingRequest ignores mentor_id/college_id in student body and resolves from student', async () => {
      const res = await request(app)
        .post('/api/meeting-requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          mentor_id: 'FAC_ATTACKER_ID_999',
          college_id: 'C999_FAKE',
          reason_short: 'Need assistance with semester arrears'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.student_id).toBe('STU_MIST_IT_Y3_5559');
      expect(res.body.data.mentor_id).not.toBe('FAC_ATTACKER_ID_999');
      expect(res.body.data.mentor_id).toBe('FAC_MIST_IT_333'); // Assigned mentor for Bhoomika Gowda
      expect(res.body.data.college_id).toBe('C103');
    });

    test('getMeetingRequests returns status_counts with correct totals', async () => {
      // Seed a meeting request
      await request(app)
        .post('/api/meeting-requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          reason_short: 'Attendance clinic'
        });

      const res = await request(app)
        .get('/api/meeting-requests')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status_counts).toBeDefined();
      expect(res.body.status_counts).toHaveProperty('total');
      expect(res.body.status_counts).toHaveProperty('new');
      expect(res.body.status_counts).toHaveProperty('acknowledged');
      expect(res.body.status_counts).toHaveProperty('scheduled');
      expect(res.body.status_counts).toHaveProperty('resolved');
      expect(res.body.status_counts).toHaveProperty('cancelled');
      expect(res.body.status_counts).toHaveProperty('urgent_open');
      expect(res.body.status_counts).toHaveProperty('pending');
      expect(res.body.status_counts.total).toBeGreaterThanOrEqual(1);
      expect(res.body.status_counts.pending).toBeGreaterThanOrEqual(1);
    });

    test('getNotifications includes resolved and cancelled meeting notifications for student', async () => {
      // Create request
      const createRes = await request(app)
        .post('/api/meeting-requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ reason_short: 'Urgent meeting' });

      const reqId = createRes.body.data.request_id;

      // Update to resolved
      await request(app)
        .patch(`/api/meeting-requests/${reqId}/status`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ status: 'resolved', mentor_note: 'Resolved during tutorial hour' });

      const notifRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(notifRes.status).toBe(200);
      const resolvedNotif = notifRes.body.data.find(n => n.requestId === reqId || n.id.includes(reqId));
      expect(resolvedNotif).toBeDefined();
      expect(resolvedNotif.status).toBe('resolved');
    });

    test('A.4: full meeting request lifecycle (new -> acknowledged -> scheduled with time -> resolved) with assertions after EACH step', async () => {
      // 1. Create request as student with spoofed mentor_id and college_id
      const createRes = await request(app)
        .post('/api/meeting-requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          mentor_id: 'FAC_SPOOFED_MENTOR_999',
          college_id: 'C999_SPOOFED',
          reason_short: 'Discussion on academic remediation',
          urgency: 'normal'
        });

      expect(createRes.status).toBe(201);
      const reqId = createRes.body.data.request_id;
      expect(createRes.body.data.mentor_id).toBe('FAC_MIST_IT_333'); // student-supplied mentor_id ignored!
      expect(createRes.body.data.student_id).toBe('STU_MIST_IT_Y3_5559');

      // Assert Step 1: Status is 'new'
      // a. Student's /my status
      const my1 = await request(app)
        .get('/api/meeting-requests/my')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(my1.status).toBe(200);
      const myReq1 = my1.body.data.find(r => r.request_id === reqId);
      expect(myReq1).toBeDefined();
      expect(myReq1.status).toBe('new');

      // b. Student's /notifications
      const notif1 = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(notif1.status).toBe(200);
      const notifItem1 = notif1.body.data.find(n => n.id === `stu-new-${reqId}` || (n.requestId === reqId && n.status === 'new'));
      expect(notifItem1).toBeDefined();
      expect(notifItem1.status).toBe('new');

      // c. Mentor list
      const mentorList1 = await request(app)
        .get('/api/meeting-requests')
        .set('Authorization', `Bearer ${mentorToken}`);
      expect(mentorList1.status).toBe(200);
      const mentorReq1 = mentorList1.body.data.find(r => r.request_id === reqId);
      expect(mentorReq1).toBeDefined();
      expect(mentorReq1.status).toBe('new');

      // d. Admin summary counts: every field
      const admin1 = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(admin1.status).toBe(200);
      const adminCounts1 = admin1.body.summary.meeting_requests;
      expect(adminCounts1).toHaveProperty('total');
      expect(adminCounts1).toHaveProperty('new');
      expect(adminCounts1).toHaveProperty('acknowledged');
      expect(adminCounts1).toHaveProperty('scheduled');
      expect(adminCounts1).toHaveProperty('resolved');
      expect(adminCounts1).toHaveProperty('cancelled');
      expect(adminCounts1).toHaveProperty('urgent_open');
      expect(adminCounts1).toHaveProperty('pending');
      expect(adminCounts1.new).toBeGreaterThanOrEqual(1);
      expect(adminCounts1.pending).toBe(adminCounts1.new + adminCounts1.acknowledged + adminCounts1.scheduled);

      // Assert: 403 when another mentor updates it
      const unauthorizedUpdate = await request(app)
        .patch(`/api/meeting-requests/${reqId}/status`)
        .set('Authorization', `Bearer ${otherMentorToken}`)
        .send({ status: 'acknowledged' });
      expect(unauthorizedUpdate.status).toBe(403);

      // Step 2: PATCH to 'acknowledged'
      const patchAck = await request(app)
        .patch(`/api/meeting-requests/${reqId}/status`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ status: 'acknowledged' });
      expect(patchAck.status).toBe(200);

      // Assert Step 2:
      // a. Student's /my status
      const my2 = await request(app)
        .get('/api/meeting-requests/my')
        .set('Authorization', `Bearer ${studentToken}`);
      const myReq2 = my2.body.data.find(r => r.request_id === reqId);
      expect(myReq2.status).toBe('acknowledged');

      // b. Student's /notifications
      const notif2 = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);
      const notifItem2 = notif2.body.data.find(n => n.id === `stu-ack-${reqId}`);
      expect(notifItem2).toBeDefined();
      expect(notifItem2.status).toBe('acknowledged');
      expect(notifItem2.message).toMatch(/Your mentor has seen your request/i);

      // c. Mentor list
      const mentorList2 = await request(app)
        .get('/api/meeting-requests')
        .set('Authorization', `Bearer ${mentorToken}`);
      const mentorReq2 = mentorList2.body.data.find(r => r.request_id === reqId);
      expect(mentorReq2.status).toBe('acknowledged');

      // d. Admin summary counts
      const admin2 = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      const adminCounts2 = admin2.body.summary.meeting_requests;
      expect(adminCounts2.acknowledged).toBeGreaterThanOrEqual(1);
      expect(adminCounts2.pending).toBe(adminCounts2.new + adminCounts2.acknowledged + adminCounts2.scheduled);

      // Step 3: PATCH to 'scheduled' with a time
      const scheduledTime = '2026-10-25T14:30:00.000Z';
      const patchSched = await request(app)
        .patch(`/api/meeting-requests/${reqId}/status`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ status: 'scheduled', scheduled_at: scheduledTime });
      expect(patchSched.status).toBe(200);

      // Assert Step 3:
      // a. Student's /my status
      const my3 = await request(app)
        .get('/api/meeting-requests/my')
        .set('Authorization', `Bearer ${studentToken}`);
      const myReq3 = my3.body.data.find(r => r.request_id === reqId);
      expect(myReq3.status).toBe('scheduled');
      expect(new Date(myReq3.scheduled_at).toISOString()).toBe(scheduledTime);

      // b. Student's /notifications
      const notif3 = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);
      const notifItem3 = notif3.body.data.find(n => n.id === `stu-sched-${reqId}`);
      expect(notifItem3).toBeDefined();
      expect(notifItem3.status).toBe('scheduled');
      expect(notifItem3.message).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}/); // contains date/time

      // c. Mentor list
      const mentorList3 = await request(app)
        .get('/api/meeting-requests')
        .set('Authorization', `Bearer ${mentorToken}`);
      const mentorReq3 = mentorList3.body.data.find(r => r.request_id === reqId);
      expect(mentorReq3.status).toBe('scheduled');

      // d. Admin summary counts
      const admin3 = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      const adminCounts3 = admin3.body.summary.meeting_requests;
      expect(adminCounts3.scheduled).toBeGreaterThanOrEqual(1);
      expect(adminCounts3.pending).toBe(adminCounts3.new + adminCounts3.acknowledged + adminCounts3.scheduled);

      // Step 4: PATCH to 'resolved'
      const patchRes = await request(app)
        .patch(`/api/meeting-requests/${reqId}/status`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ status: 'resolved', mentor_note: 'Completed 1-on-1 counseling.' });
      expect(patchRes.status).toBe(200);

      // Assert Step 4:
      // a. Student's /my status
      const my4 = await request(app)
        .get('/api/meeting-requests/my')
        .set('Authorization', `Bearer ${studentToken}`);
      const myReq4 = my4.body.data.find(r => r.request_id === reqId);
      expect(myReq4.status).toBe('resolved');

      // b. Student's /notifications
      const notif4 = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);
      const notifItem4 = notif4.body.data.find(n => n.id === `stu-res-${reqId}`);
      expect(notifItem4).toBeDefined();
      expect(notifItem4.status).toBe('resolved');

      // c. Mentor list
      const mentorList4 = await request(app)
        .get('/api/meeting-requests')
        .set('Authorization', `Bearer ${mentorToken}`);
      const mentorReq4 = mentorList4.body.data.find(r => r.request_id === reqId);
      expect(mentorReq4.status).toBe('resolved');

      // d. Admin summary counts
      const admin4 = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      const adminCounts4 = admin4.body.summary.meeting_requests;
      expect(adminCounts4.resolved).toBeGreaterThanOrEqual(1);
      expect(adminCounts4.pending).toBe(adminCounts4.new + adminCounts4.acknowledged + adminCounts4.scheduled);
    });
  });

  // =========================================================================
  // TASK 7: Mentor Notes API, Validation & Security
  // =========================================================================
  describe('Task 7: Mentor Notes API', () => {
    const menteeId = 'STU_MIST_IT_Y3_5559'; // assigned to FAC_MIST_IT_333

    test('validates note length: rejects empty note and note > 2000 chars', async () => {
      const emptyRes = await request(app)
        .post(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ note: '   ' });

      expect(emptyRes.status).toBe(400);
      expect(emptyRes.body.message).toMatch(/cannot be empty/i);

      const tooLongRes = await request(app)
        .post(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ note: 'a'.repeat(2001) });

      expect(tooLongRes.status).toBe(400);
      expect(tooLongRes.body.message).toMatch(/cannot exceed 2000/i);
    });

    test('restricts mentor access: mentor cannot view or add notes for another mentor mentee', async () => {
      // otherMentorToken is FAC_EEC_CSE_001; menteeId is assigned to FAC_MIST_IT_333
      const getRes = await request(app)
        .get(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${otherMentorToken}`);

      expect(getRes.status).toBe(403);
      expect(getRes.body.error).toBe('Forbidden');

      const postRes = await request(app)
        .post(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${otherMentorToken}`)
        .send({ note: 'Unauthorized note attempt' });

      expect(postRes.status).toBe(403);
      expect(postRes.body.error).toBe('Forbidden');
    });

    test('full CRUD lifecycle for assigned mentor and admin delete', async () => {
      // 1. Create Note
      const createRes = await request(app)
        .post(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ note: '1. Advised student to attend Saturday compensatory math labs.' });

      expect(createRes.status).toBe(201);
      expect(createRes.body.data.note).toBe('1. Advised student to attend Saturday compensatory math labs.');
      expect(createRes.body.data.mentor_id).toBe('FAC_MIST_IT_333');
      const noteId = createRes.body.data._id;

      // 2. Read Notes
      const getRes = await request(app)
        .get(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBe(1);
      expect(getRes.body.data[0].note).toBe('1. Advised student to attend Saturday compensatory math labs.');

      // 3. Admin can also read the note
      const adminGetRes = await request(app)
        .get(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminGetRes.status).toBe(200);
      expect(adminGetRes.body.data.length).toBe(1);

      // 4. Other mentor cannot delete it
      const unauthorizedDelete = await request(app)
        .delete(`/api/students/${menteeId}/notes/${noteId}`)
        .set('Authorization', `Bearer ${otherMentorToken}`);

      expect(unauthorizedDelete.status).toBe(403);

      // 5. Author mentor can delete it
      const deleteRes = await request(app)
        .delete(`/api/students/${menteeId}/notes/${noteId}`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // 6. Verify deleted
      const finalGet = await request(app)
        .get(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(finalGet.body.data.length).toBe(0);
    });

    test('C.1: localStorage notes remain when server upload fails, removed ONLY after confirmation', async () => {
      // Simulate frontend localStorage store
      const storageKey = `mentor_notes_${menteeId}`;
      const store = { [storageKey]: 'Remedial strategy: extra physics lab sessions.' };
      const mockLocalStorage = {
        getItem: (k) => store[k] || null,
        removeItem: (k) => { delete store[k]; }
      };

      // 1. Failure path: unauthorized mentor attempt (fails with 403)
      const noteToUpload = mockLocalStorage.getItem(storageKey);
      let failedUploadSucceeded = false;
      try {
        const failRes = await request(app)
          .post(`/api/students/${menteeId}/notes`)
          .set('Authorization', `Bearer ${otherMentorToken}`)
          .send({ note: noteToUpload });

        if (failRes.status === 201) {
          mockLocalStorage.removeItem(storageKey);
          failedUploadSucceeded = true;
        }
      } catch (e) {}

      expect(failedUploadSucceeded).toBe(false);
      // Local copy MUST remain
      expect(mockLocalStorage.getItem(storageKey)).toBe('Remedial strategy: extra physics lab sessions.');

      // 2. Success path: authorized mentor succeeds (201)
      const successRes = await request(app)
        .post(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ note: noteToUpload });

      expect(successRes.status).toBe(201);
      mockLocalStorage.removeItem(storageKey);
      // Local copy is removed ONLY after server confirms
      expect(mockLocalStorage.getItem(storageKey)).toBeNull();
    });

    test('backend upsert (PUT /api/students/:id/notes): mentor can upsert; same note count after two saves; unauthorized get 403; >2000 chars returns 422', async () => {
      // 1. Initial upsert by assigned mentor
      const upsert1 = await request(app)
        .put(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ note: 'Initial counseling session completed. Focus on operating systems lab.' });

      expect(upsert1.status).toBe(200);
      expect(upsert1.body.data.note).toBe('Initial counseling session completed. Focus on operating systems lab.');

      // Check note count
      const get1 = await request(app)
        .get(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`);
      const count1 = get1.body.count;

      // 2. Second upsert by assigned mentor (updating the same note)
      const upsert2 = await request(app)
        .put(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ note: 'Updated counseling session notes: student registered for peer tutoring.' });

      expect(upsert2.status).toBe(200);
      expect(upsert2.body.data.note).toBe('Updated counseling session notes: student registered for peer tutoring.');

      // Check note count after second save - MUST BE EXACT SAME COUNT (no duplicates created!)
      const get2 = await request(app)
        .get(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`);
      expect(get2.body.count).toBe(count1);
      expect(get2.body.data[0].note).toBe('Updated counseling session notes: student registered for peer tutoring.');

      // 3. Unauthorized checks: another mentor gets 403
      const unauthorizedMentor = await request(app)
        .put(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${otherMentorToken}`)
        .send({ note: 'Attempting to overwrite another mentor note' });
      expect(unauthorizedMentor.status).toBe(403);

      // 4. Student gets 403
      const studentAttempt = await request(app)
        .put(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ note: 'Student attempting to edit mentor note' });
      expect(studentAttempt.status).toBe(403);

      // 5. Over 2000 chars returns 422
      const overLimitRes = await request(app)
        .put(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ note: 'x'.repeat(2001) });
      expect(overLimitRes.status).toBe(422);
      expect(overLimitRes.body.error).toBe('Validation Error');

      // 6. Empty save clears the note
      const clearRes = await request(app)
        .put(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ note: '' });
      expect(clearRes.status).toBe(200);
      expect(clearRes.body.success).toBe(true);
      expect(clearRes.body.data).toBeNull();

      const getAfterClear = await request(app)
        .get(`/api/students/${menteeId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`);
      expect(getAfterClear.body.count).toBe(0);
    });
  });
});
