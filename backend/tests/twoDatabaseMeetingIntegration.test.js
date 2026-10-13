const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test_jwt_super_secret_for_hardening_2026';
process.env.ERP_SERVICE_API_KEY = 'test_erp_service_api_key_very_secret_32chars!';
process.env.APP_DB_ROLE = 'erp';

const app = require('../server');
const ErpMeetingRequest = require('../models/MeetingRequest');

describe('Task 1 — Two Separate Databases Meeting Request Ingest Integration Test', () => {
  let aiMongoServer;
  let erpMongoServer;
  let aiConn;
  let AiMeetingRequest;

  beforeAll(async () => {
    // 1. Spin up two distinct in-memory MongoDB databases
    aiMongoServer = await MongoMemoryServer.create({
      instance: { dbName: 'ai_dropout_prediction' }
    });
    erpMongoServer = await MongoMemoryServer.create({
      instance: { dbName: 'student_dropout_erp' }
    });

    const aiUri = aiMongoServer.getUri();
    const erpUri = erpMongoServer.getUri();

    // 2. Connect ERP to student_dropout_erp via mongoose default connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(erpUri, { dbName: 'student_dropout_erp' });

    // 3. Connect AI site to ai_dropout_prediction via separate connection
    aiConn = await mongoose.createConnection(aiUri, { dbName: 'ai_dropout_prediction' }).asPromise();

    // 4. Define AI MeetingRequest schema and outbox model on AI connection
    const AiSchema = new mongoose.Schema({
      request_id: { type: String, required: true, unique: true },
      student_id: { type: String, required: true },
      student_name: { type: String, default: 'Student' },
      college_id: { type: String, default: 'C101' },
      category: { type: String, enum: ['meeting', 'academic', 'crisis'], default: 'meeting' },
      urgency: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
      reason_short: { type: String, required: true },
      delivery_status: { type: String, enum: ['pending', 'delivered', 'failed'], default: 'pending' },
      attempts: { type: Number, default: 0 },
      delivered_at: { type: Date, default: null },
      mentor_name: { type: String, default: null }
    }, { timestamps: true });

    AiMeetingRequest = aiConn.model('MeetingRequest', AiSchema, 'ai_meeting_outbox');
  }, 30000);

  afterAll(async () => {
    if (aiConn) await aiConn.close();
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (aiMongoServer) await aiMongoServer.stop();
    if (erpMongoServer) await erpMongoServer.stop();
  });

  test('proves database and collection separation: AI saves request, ERP ingest creates record with mentor_id, mentor list returns it', async () => {
    // Assert separate databases and collection names
    expect(aiConn.name).toBe('ai_dropout_prediction');
    expect(mongoose.connection.name).toBe('student_dropout_erp');
    expect(AiMeetingRequest.collection.name).toBe('ai_meeting_outbox');
    expect(ErpMeetingRequest.collection.name).toBe('meeting_requests');

    const testRequestId = crypto.randomUUID();
    const studentId = 'STU_MIST_IT_Y3_5559';

    // Step 1: AI site saves new request into AI outbox (no mentor_id, pending delivery)
    const aiRecord = await AiMeetingRequest.create({
      request_id: testRequestId,
      student_id: studentId,
      college_id: 'C103',
      category: 'meeting',
      urgency: 'normal',
      reason_short: 'Student requested 1-on-1 faculty mentor consultation',
      delivery_status: 'pending'
    });
    expect(aiRecord.request_id).toBe(testRequestId);
    expect(aiRecord.delivery_status).toBe('pending');

    // Step 2: Verify ERP database does NOT have this document yet
    const preCheckErp = await ErpMeetingRequest.findOne({ request_id: testRequestId });
    expect(preCheckErp).toBeNull();

    // Step 3: AI calls ERP ingest route with service key
    const ingestRes = await request(app)
      .post('/api/integrations/meeting-requests')
      .set('X-Service-Key', process.env.ERP_SERVICE_API_KEY)
      .send({
        request_id: testRequestId,
        student_id: studentId,
        college_id: 'C103',
        category: 'meeting',
        urgency: 'normal',
        reason_short: 'Student requested 1-on-1 faculty mentor consultation'
      });

    expect(ingestRes.status).toBe(201);
    expect(ingestRes.body.success).toBe(true);
    expect(ingestRes.body.request_id).toBe(testRequestId);
    expect(ingestRes.body.mentor_id).toBeTruthy();
    const assignedMentorId = ingestRes.body.mentor_id;

    // Step 4: Verify ERP has created its own record with mentor_id in meeting_requests
    const erpRecord = await ErpMeetingRequest.findOne({ request_id: testRequestId });
    expect(erpRecord).toBeTruthy();
    expect(erpRecord.mentor_id).toBe(assignedMentorId);
    expect(erpRecord.status).toBe('new');

    // Step 5: AI marks outbox record delivered
    aiRecord.delivery_status = 'delivered';
    aiRecord.mentor_name = ingestRes.body.mentor_name;
    aiRecord.delivered_at = new Date();
    await aiRecord.save();

    const verifiedAiRecord = await AiMeetingRequest.findOne({ request_id: testRequestId });
    expect(verifiedAiRecord.delivery_status).toBe('delivered');
    expect(verifiedAiRecord.mentor_name).toBe(ingestRes.body.mentor_name);

    // Step 6: Assigned mentor calls GET /api/meeting-requests and sees the new request
    const mentorToken = jwt.sign({
      username: 'mentor',
      role: 'mentor',
      linkedId: assignedMentorId,
      name: ingestRes.body.mentor_name || 'Dr. Sudha Rajagopalan'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const mentorListRes = await request(app)
      .get('/api/meeting-requests')
      .set('Authorization', `Bearer ${mentorToken}`);

    expect(mentorListRes.status).toBe(200);
    expect(mentorListRes.body.data).toBeDefined();
    const foundInList = mentorListRes.body.data.find(r => r.request_id === testRequestId);
    expect(foundInList).toBeDefined();
    expect(foundInList.student_id).toBe(studentId);
    expect(foundInList.mentor_id).toBe(assignedMentorId);
  }, 30000);
});
