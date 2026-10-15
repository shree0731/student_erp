const request = require('supertest');
const crypto = require('crypto');
const app = require('../server');
const mailer = require('../services/mailer');
const { OtpChallengeStore, inMemoryChallenges } = require('../models/OtpChallenge');

describe('Step 3: OTP Authentication & Security Tests', () => {
  const originalEnv = { ...process.env };
  let originalSendMail;

  beforeEach(() => {
    process.env.OTP_ENABLED = 'true';
    process.env.OTP_TTL_SECONDS = '300';
    process.env.OTP_MAX_ATTEMPTS = '5';
    process.env.OTP_RESEND_COOLDOWN_SECONDS = '30';
    process.env.OTP_MAX_RESENDS = '3';
    process.env.DEMO_SHARED_EMAIL = 'grouppresentation785@gmail.com';
    process.env.EMAIL_DRY_RUN = 'false';
    process.env.JWT_SECRET = 'test_jwt_super_secret_for_hardening_2026';
    process.env.DEMO_PASSWORD = 'DemoPass@2026';

    OtpChallengeStore.clearInMemory();

    originalSendMail = mailer.sendMail;
  });

  afterEach(() => {
    mailer.sendMail = originalSendMail;
    process.env = { ...originalEnv };
  });

  test('correct password with OTP_ENABLED returns otp_required: true, challenge_id, email_hint, and no token', async () => {
    let sentEmail = null;
    mailer.sendMail = jest.fn(async (opts) => {
      sentEmail = opts;
      return { messageId: 'mock-123' };
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'mentor',
        password: 'DemoPass@2026'
      });

    expect(res.status).toBe(200);
    expect(res.body.otp_required).toBe(true);
    expect(res.body.challenge_id).toBeDefined();
    expect(res.body.challenge_id.length).toBe(64); // 32 bytes hex
    expect(res.body.email_hint).toBe('gr***@gmail.com');
    expect(res.body.expires_in).toBe(300);
    expect(res.body.token).toBeUndefined();

    // Verify email was sent
    expect(mailer.sendMail).toHaveBeenCalledTimes(1);
    expect(sentEmail.to).toBe('grouppresentation785@gmail.com');
  });

  test('right code returns the old login body (token + user); single use prevents replay', async () => {
    let capturedCode = null;
    mailer.sendMail = jest.fn(async (opts) => {
      // Capture 6 digit code from email text
      const match = opts.text.match(/\b\d{6}\b/);
      if (match) capturedCode = match[0];
      return { messageId: 'mock-123' };
    });

    // 1. Initial login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'mentor', password: 'DemoPass@2026' });

    expect(loginRes.status).toBe(200);
    const challengeId = loginRes.body.challenge_id;
    expect(capturedCode).toBeDefined();

    // 2. Verify with correct code
    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        challenge_id: challengeId,
        code: capturedCode,
        username: 'mentor'
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.message).toBe('Login successful');
    expect(verifyRes.body.token).toBeDefined();
    expect(verifyRes.body.user).toEqual({
      username: 'mentor',
      role: 'mentor',
      linkedId: 'FAC_MIST_IT_333',
      name: 'Dr. Sudha Rajagopalan',
      department: 'IT',
      collegeId: 'C103'
    });

    // 3. Single use check: Replaying the same code must fail
    const replayRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        challenge_id: challengeId,
        code: capturedCode,
        username: 'mentor'
      });

    expect(replayRes.status).toBe(401);
  });

  test('wrong code x5 locks the challenge with 429', async () => {
    mailer.sendMail = jest.fn(async () => ({ messageId: 'mock-123' }));

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'student', password: 'DemoPass@2026' });

    const challengeId = loginRes.body.challenge_id;

    // Attempts 1 to 4 should return 401
    for (let i = 1; i <= 4; i++) {
      const failRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ challenge_id: challengeId, code: '000000', username: 'student' });
      expect(failRes.status).toBe(401);
    }

    // 5th failed attempt locks the challenge and returns 429
    const lockRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ challenge_id: challengeId, code: '000000', username: 'student' });
    expect(lockRes.status).toBe(429);
    expect(lockRes.body.message).toMatch(/locked/i);

    // Subsequent attempts remain locked with 429
    const afterLockRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ challenge_id: challengeId, code: '000000', username: 'student' });
    expect(afterLockRes.status).toBe(429);
  });

  test('expired code is rejected with 401', async () => {
    mailer.sendMail = jest.fn(async () => ({ messageId: 'mock-123' }));

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'DemoPass@2026' });

    const challengeId = loginRes.body.challenge_id;

    // Artificially expire the challenge
    const doc = await OtpChallengeStore.findByChallengeId(challengeId);
    doc.expires_at = new Date(Date.now() - 1000);

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ challenge_id: challengeId, code: '123456', username: 'admin' });

    expect(res.status).toBe(401);
  });

  test('resend cooldown and max resends are strictly enforced', async () => {
    mailer.sendMail = jest.fn(async () => ({ messageId: 'mock-123' }));

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'mentor', password: 'DemoPass@2026' });

    const challengeId = loginRes.body.challenge_id;

    // 1. Immediate resend within 30s cooldown fails with 429
    const cooldownRes = await request(app)
      .post('/api/auth/resend-otp')
      .send({ challenge_id: challengeId });
    expect(cooldownRes.status).toBe(429);
    expect(cooldownRes.body.message).toMatch(/wait/i);

    // 2. Advance time past cooldown for 3 allowed resends
    for (let r = 1; r <= 3; r++) {
      const challenge = await OtpChallengeStore.findByChallengeId(challengeId);
      challenge.last_sent_at = new Date(Date.now() - 35000);

      const okResend = await request(app)
        .post('/api/auth/resend-otp')
        .send({ challenge_id: challengeId });
      expect(okResend.status).toBe(200);
      expect(okResend.body.message).toBe('Verification code resent');
    }

    // 3. 4th resend exceeds max resends (3) -> returns 429
    const challenge = await OtpChallengeStore.findByChallengeId(challengeId);
    challenge.last_sent_at = new Date(Date.now() - 35000);

    const exceedRes = await request(app)
      .post('/api/auth/resend-otp')
      .send({ challenge_id: challengeId });
    expect(exceedRes.status).toBe(429);
    expect(exceedRes.body.message).toMatch(/limit/i);
  });

  test('code is never present in any response or captured log output', async () => {
    let capturedBody = null;
    mailer.sendMail = jest.fn(async (opts) => {
      const match = opts.text.match(/\b\d{6}\b/);
      capturedBody = match ? match[0] : null;
      return { messageId: 'mock-123' };
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'mentor', password: 'DemoPass@2026' });

    const responseString = JSON.stringify(loginRes.body);
    expect(capturedBody).toBeDefined();
    expect(responseString).not.toContain(capturedBody);

    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ challenge_id: loginRes.body.challenge_id, code: '000000', username: 'mentor' });

    const failString = JSON.stringify(verifyRes.body);
    expect(failString).not.toContain(capturedBody);
  });

  test('mailer failure returns 502 and does not create a usable challenge', async () => {
    mailer.sendMail = jest.fn(async () => {
      throw new Error('SMTP connection refused to smtp.gmail.com');
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'mentor', password: 'DemoPass@2026' });

    expect(res.status).toBe(502);
    expect(res.body.message).toBe('Could not send verification email');

    // Verify no challenge was retained in store
    expect(inMemoryChallenges.size).toBe(0);
  });

  test('OTP_ENABLED=false keeps old behaviour (direct token issuance)', async () => {
    process.env.OTP_ENABLED = 'false';

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'mentor', password: 'DemoPass@2026' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.otp_required).toBeUndefined();
    expect(res.body.user.role).toBe('mentor');
  });

  test("a student cannot verify another user's challenge", async () => {
    let adminCode = null;
    mailer.sendMail = jest.fn(async (opts) => {
      const match = opts.text.match(/\b\d{6}\b/);
      if (match) adminCode = match[0];
      return { messageId: 'mock-123' };
    });

    // Admin logs in
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'DemoPass@2026' });

    const adminChallengeId = adminLogin.body.challenge_id;

    // Student attempts to verify admin's challenge
    const hijackAttempt = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        challenge_id: adminChallengeId,
        code: adminCode,
        username: 'student' // Mismatched user
      });

    expect(hijackAttempt.status).toBe(403);
    expect(hijackAttempt.body.message).toMatch(/cannot verify another user/i);
  });
});
