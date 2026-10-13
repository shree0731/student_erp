/**
 * Automated Demo Readiness Verification Script
 * Validates cross-system integration between FSD (ERP) and ai-dropout-prediction.
 *
 * Checks performed:
 * (a) ERP login for demo mentor (FAC_MIST_IT_333)
 * (b) Fetch High-risk demo student detail (STU_MIST_IT_Y3_5559) and assert liveRiskAssessment.source === 'live' and prediction === 'High'
 * (c) Post meeting-request chat message as demo student through ERP chat endpoint and assert reply confirms request was sent
 * (d) Fetch mentor's meeting-request list and assert the request for STU_MIST_IT_Y3_5559 is present
 * (e) Stops reporting success if any step fails; prints PASS/FAIL line per step
 *
 * Optional flags:
 *   --fallback : Verifies Step (b) reports fallback source cleanly when AI backend is stopped
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to resolve project root and load DEMO_PASSWORD from .env
function getDemoPassword() {
  if (process.env.DEMO_PASSWORD) {
    return process.env.DEMO_PASSWORD;
  }
  const possibleEnvPaths = [
    path.resolve(__dirname, '../FSD/backend/.env'),
    path.resolve(__dirname, '../../FSD/backend/.env'),
    path.resolve(__dirname, '../backend/.env'),
    path.resolve(__dirname, '.env')
  ];
  for (const envPath of possibleEnvPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^DEMO_PASSWORD=(.+)$/m);
      if (match && match[1].trim()) {
        return match[1].trim();
      }
    }
  }
  return 'TestPassword123!';
}

const ERP_BASE_URL = process.env.ERP_BASE_URL || 'http://localhost:5000';
const DEMO_PASSWORD = getDemoPassword();
const isFallbackMode = process.argv.includes('--fallback') || process.argv.includes('--fallback-only');

async function runFallbackCheck() {
  console.log('======================================================================');
  console.log('  AUTOMATED DEMO CHECK: RESILIENT FALLBACK MODE');
  console.log('======================================================================\n');

  try {
    // Step (a) Login as mentor
    console.log('Logging in as demo mentor (username: mentor)...');
    const loginRes = await fetch(`${ERP_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'mentor', password: DEMO_PASSWORD })
    });
    if (!loginRes.ok) {
      throw new Error(`Mentor login failed with HTTP ${loginRes.status}: ${await loginRes.text()}`);
    }
    const loginData = await loginRes.json();
    const mentorToken = loginData.token;

    // Step (b) Fetch student detail with AI backend stopped
    console.log("Fetching student STU_MIST_IT_Y3_5559 with AI backend offline...");
    const studentRes = await fetch(`${ERP_BASE_URL}/api/students/STU_MIST_IT_Y3_5559`, {
      headers: { Authorization: `Bearer ${mentorToken}` }
    });
    if (!studentRes.ok) {
      throw new Error(`Student fetch failed with HTTP ${studentRes.status}: ${await studentRes.text()}`);
    }
    const studentData = await studentRes.json();
    const student = studentData.data || studentData;
    const liveAssessment = student.liveRiskAssessment;

    if (!liveAssessment) {
      throw new Error('liveRiskAssessment field is missing in student response');
    }
    if (liveAssessment.source !== 'fallback') {
      throw new Error(`Expected source === 'fallback', but received source: '${liveAssessment.source}'`);
    }

    console.log(`PASS: Step (b) [Fallback] - Student fetched cleanly without server crash; liveRiskAssessment.source === 'fallback' (fallback_label: '${liveAssessment.fallback_label}')`);
    console.log('\n======================================================================');
    console.log('  RESILIENT FALLBACK CHECK PASSED SUCCESSFULLY');
    console.log('======================================================================');
    process.exit(0);
  } catch (err) {
    console.error(`FAIL: Fallback check failed: ${err.message}`);
    process.exit(1);
  }
}

async function runDemoCheck() {
  console.log('======================================================================');
  console.log('  AUTOMATED DEMO CHECK: FULL INTEGRATION VALIDATION');
  console.log('======================================================================\n');

  let mentorToken = null;
  let studentToken = null;

  // Step (a): Call ERP login for demo mentor
  try {
    const res = await fetch(`${ERP_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'mentor', password: DEMO_PASSWORD })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    if (!data.token) {
      throw new Error('No authentication token returned in login response');
    }
    if (data.user?.role !== 'mentor' || data.user?.linkedId !== 'FAC_MIST_IT_333') {
      throw new Error(`Unexpected user returned: role=${data.user?.role}, linkedId=${data.user?.linkedId}`);
    }
    mentorToken = data.token;
    console.log('PASS: Step (a) - Demo mentor login succeeded (FAC_MIST_IT_333 / Dr. Sudha Rajagopalan)');
  } catch (err) {
    console.error(`FAIL: Step (a) - Mentor login failed: ${err.message}`);
    process.exit(1);
  }

  // Step (b): Fetch High-risk demo student's detail and assert liveRiskAssessment
  try {
    const studentId = 'STU_MIST_IT_Y3_5559';
    const res = await fetch(`${ERP_BASE_URL}/api/students/${studentId}`, {
      headers: { Authorization: `Bearer ${mentorToken}` }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const resData = await res.json();
    const student = resData.data || resData;

    if (!student.liveRiskAssessment) {
      throw new Error('Missing liveRiskAssessment in student detail payload');
    }

    const { source, prediction } = student.liveRiskAssessment;
    if (source !== 'live') {
      throw new Error(`Expected liveRiskAssessment.source === 'live', but got '${source}'`);
    }
    if (prediction !== 'High') {
      throw new Error(`Expected liveRiskAssessment.prediction === 'High', but got '${prediction}'`);
    }

    console.log(`PASS: Step (b) - Live risk assessment verified for ${studentId} (source: '${source}', prediction: '${prediction}')`);
  } catch (err) {
    console.error(`FAIL: Step (b) - Live student risk assessment failed: ${err.message}`);
    process.exit(1);
  }

  // Step (c): Post meeting-request chat message as demo student through ERP chat endpoint
  try {
    // Login as student
    const loginRes = await fetch(`${ERP_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'student', password: DEMO_PASSWORD })
    });
    if (!loginRes.ok) {
      throw new Error(`Student login failed with HTTP ${loginRes.status}: ${await loginRes.text()}`);
    }
    const loginData = await loginRes.json();
    studentToken = loginData.token;

    // Send chat message requesting meeting
    const chatRes = await fetch(`${ERP_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        message: 'Can you please schedule a meeting with my faculty mentor to discuss my attendance and academic progress?'
      })
    });
    if (!chatRes.ok) {
      throw new Error(`Chat request failed with HTTP ${chatRes.status}: ${await chatRes.text()}`);
    }
    const chatData = await chatRes.json();
    const replyText = chatData.reply || chatData.response || '';

    // Assert reply confirms request was sent to mentor
    const confirmsSent = /(sent your request to your mentor|request.*sent to your mentor|I've sent your request)/i.test(replyText);
    if (!confirmsSent) {
      throw new Error(`Chat reply did not confirm delivery to mentor. Reply received: "${replyText}"`);
    }

    console.log(`PASS: Step (c) - Meeting request chat message posted; assistant confirmed request sent to mentor`);
  } catch (err) {
    console.error(`FAIL: Step (c) - Student chat meeting request failed: ${err.message}`);
    process.exit(1);
  }

  // Step (d): Fetch mentor's meeting-request list and assert the new request is there
  try {
    const reqRes = await fetch(`${ERP_BASE_URL}/api/meeting-requests`, {
      headers: { Authorization: `Bearer ${mentorToken}` }
    });
    if (!reqRes.ok) {
      throw new Error(`HTTP ${reqRes.status}: ${await reqRes.text()}`);
    }
    const reqData = await reqRes.json();
    const requests = Array.isArray(reqData.data) ? reqData.data : (Array.isArray(reqData) ? reqData : []);

    const targetStudentId = 'STU_MIST_IT_Y3_5559';
    const found = requests.find(r => r.student_id === targetStudentId);
    if (!found) {
      throw new Error(`No meeting request found for student ${targetStudentId} in mentor's inbox (total items: ${requests.length})`);
    }

    console.log(`PASS: Step (d) - Meeting request for ${targetStudentId} successfully found in mentor inbox (ID: ${found.request_id || found._id}, status: ${found.status})`);
  } catch (err) {
    console.error(`FAIL: Step (d) - Fetching mentor meeting requests failed: ${err.message}`);
    process.exit(1);
  }

  // Step (e): All checks passed!
  console.log('\n======================================================================');
  console.log('  ALL DEMO CHECK STEPS PASSED SUCCESSFULLY (4/4)');
  console.log('======================================================================\n');
  process.exit(0);
}

if (isFallbackMode) {
  runFallbackCheck();
} else {
  runDemoCheck();
}
