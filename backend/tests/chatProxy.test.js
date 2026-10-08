const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_jwt_super_secret_for_hardening_2026';
process.env.DEMO_PASSWORD = 'TestPassword123!';

const app = require('../server');
const aiServiceClient = require('../services/aiServiceClient');

describe('Task 5 — ERP Chat Proxy and Student Context Forwarding', () => {
  let studentToken;

  beforeAll(() => {
    studentToken = jwt.sign({
      username: 'student',
      role: 'student',
      linkedId: 'STU_EEC_CSE_Y1_0001',
      name: 'Divya Sengottaiyan'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  test('POST /api/chat without authentication returns 401', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' });

    expect(res.status).toBe(401);
  });

  test('POST /api/chat proxies message and forwards authenticated student context', async () => {
    // Spy on aiServiceClient.sendChatMessage to inspect forwarded context
    const clientModule = require('../services/aiServiceClient');
    const sendChatSpy = jest.spyOn(clientModule.aiServiceClient, 'sendChatMessage').mockResolvedValue({
      reply: 'Hello Divya! Your records show 85.5% attendance.',
      meeting_requested: false,
      meeting_id: null,
      counselor_notified: false,
      disclaimer: 'AI academic assistant. Not a substitute for professional counseling or official academic advice.'
    });

    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'How is my attendance doing?'
      });

    expect(res.status).toBe(200);
    expect(sendChatSpy).toHaveBeenCalled();

    const [passedMessage, passedContext] = sendChatSpy.mock.calls[0];
    expect(passedMessage).toBe('How is my attendance doing?');

    // Context must be grounded in student STU_EEC_CSE_Y1_0001
    expect(passedContext.student_id).toBe('STU_EEC_CSE_Y1_0001');
    expect(passedContext.student_name).toBe('Divya Sengottaiyan');
    expect(passedContext.department).toBe('CSE');
    expect(Number(passedContext.attendance_pct)).toBeCloseTo(85.5, 1);
    expect(passedContext).toHaveProperty('overall_gpa');
    expect(passedContext).toHaveProperty('mentor_name');

    // Response includes disclaimer
    expect(res.body.disclaimer).toBe(
      'AI academic assistant. Not a substitute for professional counseling or official academic advice.'
    );

    sendChatSpy.mockRestore();
  });
});
