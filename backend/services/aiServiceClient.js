/**
 * AI Service Integration Client
 * Centralized communication layer between FSD ERP Backend and Standalone AI Prediction Microservice.
 * Handles authentication headers, request timeouts, and zero-crash fallback handling.
 */

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_BASE_URL || 'http://localhost:5001';
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || '';

/**
 * Transforms an ERP Student document and live Marks records into the AI service's feature payload.
 * Computes ALL 16 features from live Marks and Student data matching training pipeline formulas:
 * 
 * 1. failed_subjects_count: count of records where result === 'Arrear'
 *    Formula: marks.filter(m => m.result === 'Arrear').length
 * 
 * 2. core_theory_average: mean of total_marks for theory subjects
 *    Formula: sum(theory.total_marks) / count(theory)
 * 
 * 3. internal_exam_avg: mean of continuous internal assessments across subjects
 *    Formula: sum((internal_exam_1 + internal_exam_2) / 2.0) / count(marks)
 * 
 * 4. assignment_avg: mean of assignments across subjects
 *    Formula: sum((assignment_1 + assignment_2) / 2.0) / count(marks)
 * 
 * 5. grade_trend: semester GPA progression
 *    Formula: latest_semester_avg_grade_point - earliest_semester_avg_grade_point (or 0.0 if 1 sem)
 * 
 * 6. attendance_decay: drop in attendance from month 1 to latest recorded month
 *    Formula: monthly_attendance_trend[0] - monthly_attendance_trend[-1] (or 0.0 if < 2 months)
 * 
 * @param {Object} studentDoc - Student document (from MongoDB or CSV provider)
 * @param {Array} marksRecords - Array of Marks records for the student
 * @returns {Object} Payload matching AI service /api/predict schema
 */
function mapStudentToPredictionPayload(studentDoc, marksRecords = []) {
  const student = studentDoc.toObject ? studentDoc.toObject() : studentDoc;
  const marks = Array.isArray(marksRecords) ? marksRecords : [];

  // 1. Failed subjects count (Result == 'Arrear')
  const failedSubjectsCount = marks.filter(m => m.result === 'Arrear').length;

  // 2. Core theory average (subject_type == 'Theory')
  const theoryMarks = marks.filter(m => m.subject_type === 'Theory' && m.total_marks !== undefined);
  const coreTheoryAvg = theoryMarks.length > 0
    ? Number((theoryMarks.reduce((sum, m) => sum + Number(m.total_marks), 0) / theoryMarks.length).toFixed(6))
    : 67.621533;

  // 3. Internal exam average ((internal_exam_1_marks + internal_exam_2_marks) / 2.0)
  const validCiaMarks = marks.filter(m => m.internal_exam_1_marks !== undefined && m.internal_exam_2_marks !== undefined);
  const internalExamAvg = validCiaMarks.length > 0
    ? Number((validCiaMarks.reduce((sum, m) => sum + (Number(m.internal_exam_1_marks) + Number(m.internal_exam_2_marks)) / 2.0, 0) / validCiaMarks.length).toFixed(6))
    : 34.129502;

  // 4. Assignment average ((assignment_1_marks + assignment_2_marks) / 2.0)
  const validAssignMarks = marks.filter(m => m.assignment_1_marks !== undefined && m.assignment_2_marks !== undefined);
  const assignmentAvg = validAssignMarks.length > 0
    ? Number((validAssignMarks.reduce((sum, m) => sum + (Number(m.assignment_1_marks) + Number(m.assignment_2_marks)) / 2.0, 0) / validAssignMarks.length).toFixed(6))
    : 6.826053;

  // 5. Grade trend (Semester progression: last_sem_avg - first_sem_avg)
  const semGroups = {};
  marks.forEach(m => {
    const sem = Number(m.semester);
    if (!isNaN(sem) && m.grade_point !== undefined) {
      if (!semGroups[sem]) semGroups[sem] = [];
      semGroups[sem].push(Number(m.grade_point));
    }
  });
  const semesters = Object.keys(semGroups).map(Number).sort((a, b) => a - b);
  let gradeTrend = 0.0;
  if (semesters.length >= 2) {
    const firstSemGrades = semGroups[semesters[0]];
    const lastSemGrades = semGroups[semesters[semesters.length - 1]];
    const firstAvg = firstSemGrades.reduce((a, b) => a + b, 0) / firstSemGrades.length;
    const lastAvg = lastSemGrades.reduce((a, b) => a + b, 0) / lastSemGrades.length;
    gradeTrend = Number((lastAvg - firstAvg).toFixed(6));
  }

  // 6. Attendance decay from monthly_attendance_trend
  let trend = student.monthly_attendance_trend || [];
  if (typeof trend === 'string') {
    try { trend = JSON.parse(trend); } catch (e) { trend = []; }
  }
  const attendanceDecay = (Array.isArray(trend) && trend.length >= 2)
    ? Number((Number(trend[0]) - Number(trend[trend.length - 1])).toFixed(6))
    : 0.0;

  return {
    student_id: String(student.student_id || 'STU_UNKNOWN'),
    department: String(student.department || 'CSE'),
    year_of_study: Number(student.year_of_study) || 1,
    attendance_pct: Number(student.attendance_pct) || 0.0,
    attendance_decay: attendanceDecay,
    monthly_attendance_trend: Array.isArray(trend) ? trend : [],
    overall_gpa: Number(student.overall_gpa) || 0.0,
    backlogs_count: Number(student.backlogs_count) || 0,
    cutoff_mark_200: Number(student.cutoff_mark_200) || 0.0,
    mentor_meetings_attended: Number(student.mentor_meetings_attended) || 0,
    family_income_annual: Number(student.family_income_annual) || 0.0,
    first_gen_learner: (student.first_gen_learner === true || student.first_gen_learner === 'true' || Number(student.first_gen_learner) === 1) ? 1 : 0,
    distance_from_home_km: Number(student.distance_from_home_km) || 0.0,
    failed_subjects_count: failedSubjectsCount,
    core_theory_average: coreTheoryAvg,
    internal_exam_avg: internalExamAvg,
    assignment_avg: assignmentAvg,
    grade_trend: gradeTrend,
    subject_marks_summary: {
      failed_subjects_count: failedSubjectsCount,
      core_theory_average: coreTheoryAvg
    }
  };
}

/**
 * Calls the standalone AI Prediction service to obtain real-time model inference and SHAP drivers.
 * Gracefully degrades if service is offline or times out.
 * 
 * @param {Object} studentFeatures - Formatted student feature payload
 * @param {String} fallbackLabel - Student's static dropout_risk_label from MongoDB/CSV
 * @returns {Promise<Object>} Live prediction or structured fallback object
 */
async function getPrediction(studentFeatures, fallbackLabel = 'Low') {
  const url = `${AI_SERVICE_BASE_URL}/api/predict`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second strict timeout

    const headers = {
      'Content-Type': 'application/json'
    };
    if (AI_SERVICE_API_KEY) {
      headers['X-API-Key'] = AI_SERVICE_API_KEY;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(studentFeatures),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`AI Service returned HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();

    return {
      prediction: data.prediction,
      probabilities: data.probabilities,
      top_risk_drivers: data.top_risk_drivers || [],
      recommended_interventions: data.recommended_interventions || [],
      source: 'live',
      service_url: AI_SERVICE_BASE_URL
    };
  } catch (err) {
    console.warn(`[AI Service Client] Live prediction unavailable for ${studentFeatures.student_id} (${err.message}). Using resilient fallback.`);
    return {
      prediction: null,
      source: 'fallback',
      fallback_label: fallbackLabel,
      error_message: 'Live AI prediction service is unreachable or timed out'
    };
  }
}

/**
 * Calls the standalone AI Chatbot service to obtain contextual academic guidance.
 * Relays the student message and academic context with auth header and timeout.
 * 
 * @param {String} message - User query
 * @param {Object} studentContext - Student academic context
 * @returns {Promise<Object>} Chat response with reply text
 */
async function sendChatMessage(message, studentContext = {}) {
  const url = `${AI_SERVICE_BASE_URL}/api/chat`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout for LLM

    const headers = {
      'Content-Type': 'application/json'
    };
    if (AI_SERVICE_API_KEY) {
      headers['X-API-Key'] = AI_SERVICE_API_KEY;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        student_context: studentContext
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`AI Service returned HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || data.response || 'No response generated.',
      meeting_requested: data.meeting_requested || false,
      meeting_id: data.meeting_id || null,
      counselor_notified: data.counselor_notified || false,
      disclaimer: data.disclaimer || 'AI academic assistant. Not a substitute for professional counseling or official academic advice. Immediate crisis support: Tele-MANAS (14416) | KIRAN (1800-599-0019).',
      source: 'live_ai_service'
    };
  } catch (err) {
    console.warn(`[AI Service Client] Standalone chat service unavailable (${err.message}). Using resilient offline guidance.`);
    const name = studentContext.student_name || 'Student';
    const att = studentContext.attendance_pct || 75;
    const backlogs = studentContext.backlogs_count || 0;
    const mentor = studentContext.mentor_name || 'your assigned Faculty Advisor';

    let fallbackReply = `Hello ${name}! 👋 The live AI advisor service is currently in resilient offline mode.\n\n`;
    if (att < 75) {
      fallbackReply += `⚠️ **Attendance Notice**: Your cumulative attendance is **${att}%**, which is below Anna University's 75% cutoff.\n\n`;
    }
    if (backlogs > 0) {
      fallbackReply += `📚 **Academic Arrears**: You have **${backlogs} active backlog(s)**.\n\n`;
    }
    fallbackReply += `Please contact your assigned mentor **${mentor}** for remedial coaching and support.`;

    return {
      reply: fallbackReply,
      source: 'fallback',
      meeting_requested: false,
      meeting_id: null,
      counselor_notified: false,
      disclaimer: 'AI academic assistant. Not a substitute for professional counseling or official academic advice. Immediate crisis support: Tele-MANAS (14416) | KIRAN (1800-599-0019).'
    };
  }
}

/**
 * Calls the standalone AI service to obtain global model metrics and evaluation benchmarks.
 * 
 * @returns {Promise<Object>} Metrics object or null if unavailable
 */
async function getMetrics() {
  const url = `${AI_SERVICE_BASE_URL}/api/metrics`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const headers = {
      'Content-Type': 'application/json'
    };
    if (AI_SERVICE_API_KEY) {
      headers['X-API-Key'] = AI_SERVICE_API_KEY;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn(`[AI Service Client] Standalone metrics unavailable (${err.message}).`);
  }

  return null;
}

module.exports = {
  aiServiceClient: {
    getPrediction,
    mapStudentToPredictionPayload,
    sendChatMessage,
    getMetrics
  },
  getPrediction,
  mapStudentToPredictionPayload,
  sendChatMessage,
  getMetrics
};
