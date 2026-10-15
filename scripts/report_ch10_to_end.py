import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from report_styles import (
    add_chapter_heading, add_section_heading, add_subsection_heading,
    add_body_paragraph, add_bullet_item, style_table, add_table_title,
    add_code_block, add_screenshot_box
)

SCREENSHOTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "report_screenshots")

def build_chapters_10_to_end(doc):
    """Builds Chapter 10, Chapter 11, References, and Appendices A through H."""

    # =========================================================================
    # CHAPTER 10: PROJECT DEMONSTRATION AND SCREENSHOTS
    # =========================================================================
    add_chapter_heading(doc, 10, "Project Demonstration and Screenshots")

    add_section_heading(doc, "10.1", "Introduction")
    add_body_paragraph(
        doc,
        "This chapter provides a detailed, step-by-step walkthrough of the operational Student Retention Ecosystem. "
        "It outlines the launch sequence, user journeys across institutional roles, input-output data transformations, "
        "and structured placeholders for capturing and inserting actual application screenshots."
    )

    add_section_heading(doc, "10.2", "Application Launch")
    add_body_paragraph(
        doc,
        "The system services are initialized in sequential dependency order using either the automated launcher scripts "
        "(start_demo.ps1 on Windows or start_demo.sh on Linux/macOS) or independent terminal sessions. The ecosystem URLs are:"
    )
    add_bullet_item(doc, "http://localhost:5173 – Main institutional portal for Administrators, Faculty Mentors, and Students.", "ERP Frontend (Vite/React)")
    add_bullet_item(doc, "http://localhost:5000 – REST API gateway handling session auth, student records, notes, and notifications.", "ERP Backend (Express.js)")
    add_bullet_item(doc, "http://127.0.0.1:8001 – High-performance ASGI microservice serving XGBoost predictions and SHAP explainability.", "AI ML Microservice (FastAPI)")
    add_bullet_item(doc, "http://localhost:5001 – Inter-service gateway routing predictions and managing meeting outbox queues.", "AI REST Gateway (Express.js)")
    add_bullet_item(doc, "http://localhost:5174 – Standalone evaluation UI displaying ROC curves, confusion matrices, and model metrics.", "Baymate AI UI (Vite/React)")

    add_section_heading(doc, "10.3", "User Workflow Demonstration")
    add_body_paragraph(
        doc,
        "The application journey encompasses three primary user workflows:"
    )
    add_bullet_item(
        doc,
        "The Administrator logs in with 2FA OTP verification, accessing aggregate institutional retention metrics across 4 campus units "
        "(Apex Engineering, Kavery Institute, MIST, Sahyadri University). The admin filters by department, reviews global dropout rates, "
        "and inspects campus-wide meeting request resolution rates.",
        "1. Institutional Administrator Workflow"
    )
    add_bullet_item(
        doc,
        "Dr. Sudha Rajagopalan (Faculty Mentor) logs in and inspects her cohort of 19 assigned mentees. The dashboard flags 8 High-Risk "
        "students at the top of the roster. Clicking on Bhoomika Gowda (STU_MIST_IT_Y3_5559) reveals a 62.8% attendance, 27 active backlogs, "
        "and a live AI prediction of 'High Risk' with attendance_decay and failed_subjects as top drivers. The mentor reviews historical "
        "clinical notes, adds an updated counseling remark, and triggers an automated Parent Alert via n8n.",
        "2. Faculty Mentor Intervention Workflow"
    )
    add_bullet_item(
        doc,
        "Bhoomika Gowda logs in and views her academic dashboard. A warning card indicates her attendance has slipped below Anna University's "
        "75% requirement. She clicks the floating AI Academic Copilot, inquires about her arrears, and requests a meeting with Dr. Sudha. "
        "The copilot books the request into the mentor's inbox and provides empathetic encouragement.",
        "3. Student Self-Monitoring & Copilot Workflow"
    )

    add_section_heading(doc, "10.4", "Module-wise Demonstration")
    add_body_paragraph(
        doc,
        "Individual modules were verified in isolation. The two-factor OTP module demonstrates strict 30-second resend cooldowns and locked "
        "states after 5 failed attempts. The mentor notes module demonstrates single-upsert storage preventing duplicate notes. The meeting "
        "lifecycle demonstrates synchronized status badges across both student and faculty views."
    )

    add_section_heading(doc, "10.5", "Input and Output Demonstration")
    add_body_paragraph(
        doc,
        "A concrete demonstration of the machine learning inference pipeline is detailed below for demo student Bhoomika Gowda:"
    )

    demo_input_json = """// Sample Live Inference Input Payload (POST /api/predict)
{
  "student_id": "STU_MIST_IT_Y3_5559",
  "attendance_pct": 62.8,
  "attendance_decay": 17.8,
  "overall_gpa": 6.1,
  "backlogs_count": 27,
  "cutoff_mark_200": 142.5,
  "family_income_annual": 180000.0,
  "mentor_meetings_attended": 1,
  "first_gen_learner": 1,
  "distance_from_home_km": 34.0,
  "failed_subjects_count": 4,
  "core_theory_average": 48.2,
  "internal_exam_avg": 51.0,
  "assignment_avg": 55.4,
  "grade_trend": -1.4,
  "year_of_study": 3,
  "department": "Information Technology"
}"""
    add_code_block(doc, demo_input_json, "Input Feature Vector - Demo Student (Bhoomika Gowda)")

    demo_output_json = """// Live Inference Response from FastAPI (200 OK)
{
  "prediction": "High",
  "probabilities": {
    "Low": 0.0042,
    "Medium": 0.0418,
    "High": 0.9540
  },
  "top_drivers": [
    ["attendance_decay", 1.9887],
    ["failed_subjects_count", 0.4077],
    ["overall_gpa", 0.3812],
    ["backlogs_count", 0.2941]
  ],
  "source": "live",
  "latency_ms": 138.4
}"""
    add_code_block(doc, demo_output_json, "Live Inference Output with Probabilities & SHAP Drivers")

    add_section_heading(doc, "10.6", "Complete End-to-End Demonstration")
    add_body_paragraph(
        doc,
        "The end-to-end event loop was executed successfully: (1) Student inputs meeting request via chatbot, (2) Meeting ingested into "
        "Express backend, (3) Mentor receives instant notification bell alert, (4) Mentor schedules tutorial slot, (5) Student dashboard updates, "
        "and (6) Mentor clicks 'Send email to parent', triggering n8n webhook which sends automated email and returns status 'Sent via n8n'."
    )

    add_section_heading(doc, "10.7", "Screenshots of the Project")
    add_body_paragraph(
        doc,
        "The following figures provide authenticated visual evidence documenting the core user interfaces, operational workflows, "
        "and administrative consoles across the Student Retention Ecosystem."
    )

    # 1. AI Website Homepage
    add_screenshot_box(
        doc, "10.1", "Baymate AI Platform Homepage & Student Predictive Intervention Portal",
        "Standalone predictive AI web portal homepage displaying interactive student vulnerability assessment tools, retention insights, and early-warning overview.",
        "Students and institutional stakeholders navigate to explore AI retention capabilities and launch interactive prediction assessments.",
        os.path.join(SCREENSHOTS_DIR, "fig_10_1_ai_website_homepage.png")
    )

    # 2. ERP Login Page
    add_screenshot_box(
        doc, "10.2", "InsightERP Multi-Role Institutional Authentication & Login Interface",
        "Institutional authentication portal featuring secure role selection (Student, Mentor, Administrator), college directory selection, and single-click demo credentials.",
        "User selects role and affiliated institution, enters login credentials, and initiates cryptographic session authentication.",
        os.path.join(SCREENSHOTS_DIR, "fig_10_2_erp_login_page.png")
    )

    # 3. Student Dashboard
    add_screenshot_box(
        doc, "10.3", "Student Academic Risk Self-Monitoring & Attendance Compliance Dashboard",
        "Student-facing academic portal displaying live attendance progress against the statutory 75% cutoff, semester CGPA gauge, credit completion meters, and meeting request statuses.",
        "Student inspects attendance status, views scheduled mentor meetings, and launches the academic copilot for counseling.",
        os.path.join(SCREENSHOTS_DIR, "fig_10_3_student_dashboard.png")
    )

    # 4. Mentor Dashboard
    add_screenshot_box(
        doc, "10.4", "Faculty Mentor Cohort Analytics & Predictive Risk Prioritization Dashboard",
        "Faculty mentor interface presenting prioritized mentee roster with machine learning risk badges ('High', 'Medium', 'Low'), attendance warning indicators, and quick consultation actions.",
        "Faculty mentor filters cohort by risk level, reviews attendance alerts, and selects individual student cards to access comprehensive dossiers.",
        os.path.join(SCREENSHOTS_DIR, "fig_10_4_mentor_dashboard.png")
    )

    # 5. Admin Dashboard
    add_screenshot_box(
        doc, "10.5", "Institutional Administrative Overview & Multi-Campus Academic Retention Dashboard",
        "Multi-campus administrative command center displaying college-wide student counts, retention percentages, department-level risk breakdowns, and pending meeting request statistics.",
        "Institutional leadership reviews campus performance metrics, tracks high-risk attrition trends, and monitors department counseling loads.",
        os.path.join(SCREENSHOTS_DIR, "fig_10_5_admin_dashboard.png")
    )

    # 6. Baymate Chatting with Student
    add_screenshot_box(
        doc, "10.6", "Baymate AI Conversational Mentoring Assistant & Student Intervention Dialogue",
        "Interactive academic mentoring chatbot engaging with a student, providing contextualized guidance on exam stress, attendance recovery, and scheduling direct mentor meetings.",
        "Student converses with the AI assistant in natural language, queries academic policies, and initiates counseling appointment requests directly from chat.",
        os.path.join(SCREENSHOTS_DIR, "fig_10_6_baymate_chat_student.png")
    )

    # 7. Mentor Request
    add_screenshot_box(
        doc, "10.7", "Mentee Meeting & Crisis Consultation Request Management Interface",
        "Mentor consultation management center with structured filtering tabs ('All', 'Requested', 'Acknowledged', 'Scheduled', 'Resolved'), showing student names, IDs, exact system timestamps, and status updates.",
        "Faculty mentor reviews pending student requests, acknowledges urgency, and updates consultation status to 'Acknowledged' or 'Scheduled'.",
        os.path.join(SCREENSHOTS_DIR, "fig_10_7_mentor_request.png")
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 11: CONCLUSION AND FUTURE ENHANCEMENTS
    # =========================================================================
    add_chapter_heading(doc, 11, "Conclusion and Future Enhancements")

    add_section_heading(doc, "11.1", "Conclusion")
    add_body_paragraph(
        doc,
        "The Student Retention Ecosystem successfully demonstrates the transformative power of synthesizing modern full-stack web "
        "engineering with explainable machine learning and event-driven automation. By transitioning higher education administration "
        "from retrospective failure cataloging to proactive, continuous mentorship, the system empowers academic institutions to identify "
        "vulnerable engineering undergraduates months before semester examinations."
    )
    add_body_paragraph(
        doc,
        "The integration of a tuned XGBoost classifier trained on 9,200 student records achieved exceptional predictive accuracy (95.60%) "
        "and a 99.35% recall on High-Risk students. Crucially, the embedding of Tree SHAP explainability bridges the gap between algorithmic "
        "outputs and human trust, equipping faculty mentors with transparent, patient-chart-style diagnostic profiles. Coupled with two-factor "
        "OTP security, resilient zero-crash fallback logic, and automated n8n parent alerts, the ecosystem delivers an enterprise-grade "
        "solution to the urgent national challenge of engineering student attrition."
    )

    add_section_heading(doc, "11.2", "Objectives Achieved")
    add_bullet_item(doc, "Engineered a responsive, multi-role ERP application using React 18, Vite, Express, and MongoDB with an institutional light-purple design.", "1. Full-Stack ERP Portal")
    add_bullet_item(doc, "Trained, tuned, and deployed an XGBoost model achieving 95.60% accuracy and 0.9265 Macro F1 on held-out test data.", "2. High-Accuracy Prediction")
    add_bullet_item(doc, "Integrated real-time Tree SHAP local feature attributions rendered directly within the faculty mentor UI.", "3. Transparent Explainable AI")
    add_bullet_item(doc, "Constructed an event-driven n8n webhook pipeline with SMTP fallback, idempotency tracking, and rate throttling.", "4. Automated Parent Alerts")
    add_bullet_item(doc, "Implemented two-factor email OTP login with constant-time verification and automated 5-attempt brute-force locking.", "5. Cryptographic 2FA Security")
    add_bullet_item(doc, "Verified zero-crash operational resilience and achieved 100% pass rates across 10 Jest test suites (65 tests).", "6. Architectural Resilience")

    add_section_heading(doc, "11.3", "Project Contributions")
    add_body_paragraph(
        doc,
        "This project contributes a novel, open-source architectural blueprint for higher educational institutions. It demonstrates how "
        "heterogeneous frameworks (Node.js and Python FastAPI) can be harmonized to deliver sub-250ms predictive inference. It introduces "
        "ethical safety filtering for campus conversational agents and establishes rigorous UI logic freeze verification standards."
    )

    add_section_heading(doc, "11.4", "Current Limitations")
    add_body_paragraph(
        doc,
        "While highly effective, current limitations include: (1) Predictive features are aggregated on a monthly/semester basis rather than "
        "ingesting real-time daily LMS clickstreams, (2) Parent communication is restricted to email channels without native SMS gateways, "
        "and (3) Conversational distress filtering uses rule-based pattern matching which cannot capture complex sarcasm or regional dialects."
    )

    add_section_heading(doc, "11.5", "Future Enhancements")
    add_bullet_item(doc, "Develop cross-platform native iOS and Android mobile applications using React Native for instantaneous push notifications.", "1. Native Mobile Apps")
    add_bullet_item(doc, "Incorporate carrier-grade SMS gateways (e.g., Twilio, Gupshup, or Kaleyra) to deliver instant SMS parent alerts to rural guardians lacking internet access.", "2. Telephonic SMS Integration")
    add_bullet_item(doc, "Establish bi-directional LTI (Learning Tools Interoperability) plugins to ingest continuous assignment submissions directly from Canvas and Moodle LMS.", "3. Direct LMS Integration")
    add_bullet_item(doc, "Train longitudinal Recurrent Neural Networks (LSTM) or Temporal Fusion Transformers to model continuous daily attendance time-series.", "4. Deep Learning Sequence Models")
    add_bullet_item(doc, "Integrate institutional WhatsApp Business API webhooks allowing parents to acknowledge academic alerts with one click.", "5. WhatsApp Interactive Alerts")

    add_section_heading(doc, "11.6", "Scope for Further Development")
    add_body_paragraph(
        doc,
        "Future development will focus on multi-institutional federated learning, enabling colleges to train collaborative dropout prediction "
        "models without exposing private student records outside institutional firewalls. Additionally, integrating career placement "
        "forecasting will expand the ecosystem's scope from attrition prevention to holistic career guidance."
    )

    doc.add_page_break()

    # =========================================================================
    # REFERENCES
    # =========================================================================
    p_ref_h = doc.add_paragraph()
    p_ref_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ref_h.paragraph_format.space_before = Pt(24)
    p_ref_h.paragraph_format.space_after = Pt(18)
    r = p_ref_h.add_run("REFERENCES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    references = [
        "[1] V. Tinto, \"Dropout from higher education: A theoretical synthesis of recent research,\" Review of Educational Research, vol. 45, no. 1, pp. 89-125, 1975.",
        "[2] V. Tinto, Leaving College: Rethinking the Causes and Cures of Student Attrition, 2nd ed. Chicago: University of Chicago Press, 1993.",
        "[3] E. Seymour and N. M. Hewitt, Talking About Leaving: Why Undergraduates Leave the Sciences. Boulder, CO: Westview Press, 1997.",
        "[4] C. Romero and S. Ventura, \"Educational data mining: A survey from 1995 to 2005,\" Expert Systems with Applications, vol. 33, no. 1, pp. 135-146, 2007.",
        "[5] C. Romero and S. Ventura, \"Educational data mining and learning analytics: An updated survey,\" WIREs Data Mining and Knowledge Discovery, vol. 10, no. 3, p. e1355, 2020.",
        "[6] S. B. Kotsiantis, C. J. Pierrakeas, and P. E. Pintelas, \"Preventing student dropout in distance education using machine learning techniques,\" in Knowledge-Based Intelligent Information and Engineering Systems, Berlin: Springer, 2003, pp. 267-274.",
        "[7] T. Chen and C. Guestrin, \"XGBoost: A scalable tree boosting system,\" in Proc. 22nd ACM SIGKDD Int. Conf. Knowledge Discovery and Data Mining (KDD '16), San Francisco, CA, 2016, pp. 785-794.",
        "[8] S. M. Lundberg and S.-I. Lee, \"A unified approach to interpreting model predictions,\" in Advances in Neural Information Processing Systems (NeurIPS 30), Long Beach, CA, 2017, pp. 4765-4774.",
        "[9] F. Agrusti, M. Mezzini, and G. Bonavolontà, \"Deep learning classification for student dropout prediction in higher education,\" Interactive Learning Environments, vol. 28, no. 6, pp. 700-717, 2020.",
        "[10] J. L. Rastrollo-Guerrero, J. A. Gómez-Pulido, and A. Durán-Domínguez, \"Analyzing and predicting students' performance by means of machine learning: A review,\" Applied Sciences, vol. 10, no. 3, p. 1042, 2020.",
        "[11] M. A. Hearst, S. T. Dumais, E. Osman, J. Platt, and B. Scholkopf, \"Support vector machines,\" IEEE Intelligent Systems and their Applications, vol. 13, no. 4, pp. 18-28, 1998.",
        "[12] L. Breiman, \"Random forests,\" Machine Learning, vol. 45, no. 1, pp. 5-32, 2001.",
        "[13] N. V. Chawla, K. W. Bowyer, L. O. Hall, and W. P. Kegelmeyer, \"SMOTE: Synthetic minority over-sampling technique,\" Journal of Artificial Intelligence Research, vol. 16, pp. 321-357, 2002.",
        "[14] G. Brier, \"Verification of forecasts expressed in terms of probability,\" Monthly Weather Review, vol. 78, no. 1, pp. 1-3, 1950.",
        "[15] M. Kuhn and K. Johnson, Applied Predictive Modeling. New York: Springer, 2013.",
        "[16] Node.js Foundation, \"Node.js v20 LTS Architecture and Event Loop Documentation,\" [Online]. Available: https://nodejs.org/docs/latest-v20.x/api/.",
        "[17] S. Ramirez, \"FastAPI: Modern, High-Performance Web Framework for Python,\" [Online]. Available: https://fastapi.tiangolo.com/.",
        "[18] MongoDB Inc., \"MongoDB 6.0 Manual: Document Indexing and Storage Architecture,\" [Online]. Available: https://www.mongodb.com/docs/v6.0/.",
        "[19] n8n GmbH, \"Fair-Code Workflow Automation Documentation and Webhook Specifications,\" [Online]. Available: https://docs.n8n.io/.",
        "[20] Anna University Chennai, \"Regulations 2021: Choice Based Credit System (CBCS) for Affiliated Autonomous Institutions,\" Anna University Official Gazette, Chennai, India, 2021."
    ]

    for ref in references:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(ref)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10.5)

    doc.add_page_break()

    # =========================================================================
    # APPENDIX
    # =========================================================================
    p_app_h = doc.add_paragraph()
    p_app_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_app_h.paragraph_format.space_before = Pt(24)
    p_app_h.paragraph_format.space_after = Pt(18)
    r = p_app_h.add_run("APPENDIX")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    add_section_heading(doc, "Appendix A:", "Complete Project Folder Structure")
    folder_tree = """FSD/
|-- backend/
|   |-- config/ (db.js)
|   |-- controllers/ (adminController.js, authController.js, meetingRequestController.js,
|   |                 mentorNoteController.js, notificationController.js, studentController.js)
|   |-- middleware/ (authMiddleware.js, rateLimiter.js, serviceKeyAuth.js)
|   |-- models/ (Curriculum.js, Faculty.js, Marks.js, MeetingRequest.js, MentorNote.js,
|   |            NotificationLog.js, OtpChallenge.js, Student.js, User.js)
|   |-- routes/ (api.js)
|   |-- services/ (aiServiceClient.js, mailer.js, notificationDispatcher.js)
|   |-- tests/ (otpAuth.test.js, notificationDispatcher.test.js, meetingRequestLifecycle.test.js, ...)
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- components/ (ChatbotWidget.jsx, Navbar.jsx, ParentAlertModal.jsx, Sidebar.jsx)
|   |   |-- context/ (AuthContext.jsx, SidebarContext.jsx)
|   |   |-- pages/ (admin/AdminDashboard.jsx, mentor/MentorDashboard.jsx,
|   |   |           mentor/StudentDetail.jsx, public/LoginPage.jsx, student/StudentDashboard.jsx)
|   |   |-- services/ (api.js)
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|-- n8n/
|   |-- insighterp-notify.workflow.json
|   `-- README.md
`-- scripts/ (demo_check.mjs, ui-guard.mjs)

ai-dropout-prediction/
|-- ml-service/
|   |-- app/ (chatbot.py, distress.py, helplines.py, main.py, predictor.py)
|   |-- tests/ (test_ml_endpoints.py)
|   `-- requirements.txt
`-- models/ (dropout_model.pkl, preprocessor.pkl, evaluation/metrics.json)"""
    add_code_block(doc, folder_tree, "Ecosystem Directory Hierarchy")

    add_section_heading(doc, "Appendix B:", "Installation and Setup Commands")
    install_commands = """# 1. Start Python FastAPI ML Microservice (Port 8001)
cd ai-dropout-prediction/ml-service
python -m venv venv
venv\\Scripts\\activate          # Windows (source venv/bin/activate on Linux)
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

# 2. Start AI Gateway Backend (Port 5001)
cd ai-dropout-prediction/backend
npm install
npm start

# 3. Start Baymate Standalone UI (Port 5174)
cd ai-dropout-prediction/frontend
npm install
npm run dev -- --port 5174

# 4. Start ERP Express Gateway Backend (Port 5000)
cd FSD/backend
npm install
npm run dev

# 5. Start ERP Vite React Frontend (Port 5173)
cd FSD/frontend
npm install
npm run dev -- --port 5173

# 6. Run Full Automated Test Suites & UI Guard
cd FSD/backend && npm test
cd FSD/frontend && npm run guard && npm run build"""
    add_code_block(doc, install_commands, "Terminal Execution Commands")

    add_section_heading(doc, "Appendix C:", "Environment Variable Configuration")
    env_config_sample = """# FSD/backend/.env.example
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/student_dropout_erp
JWT_SECRET=super_secret_jwt_key_for_hardening_2026
AI_SERVICE_BASE_URL=http://localhost:5001
SERVICE_KEY=internal_erp_ai_service_key_2026

# Two-Factor Authentication (OTP)
OTP_ENABLED=true
OTP_TTL_SECONDS=300
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=30
OTP_MAX_RESENDS=3

# Automated Communications & n8n
NOTIFY_TRANSPORT=n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook/insighterp-notify
N8N_WEBHOOK_SECRET=n8n_insighterp_secret_token_2026
DEMO_SHARED_EMAIL=grouppresentation785@gmail.com
EMAIL_DRY_RUN=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=insighterp.notifications@gmail.com
SMTP_PASS=app_password_placeholder"""
    add_code_block(doc, env_config_sample, "Sanitized Backend Configuration Template")

    add_section_heading(doc, "Appendix D:", "Important Source Code Snippets")
    code_timing_safe = """// Excerpt: Timing-Safe OTP Code Verification (authController.js)
const secret = process.env.JWT_SECRET;
const submittedHash = crypto.createHmac('sha256', secret).update(String(code).trim()).digest('hex');

const submittedBuf = Buffer.from(submittedHash, 'hex');
const expectedBuf = Buffer.from(challenge.code_hash, 'hex');

if (submittedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(submittedBuf, expectedBuf)) {
  await OtpChallengeStore.incrementAttempts(challenge_id);
  const remaining = maxAttempts - (challenge.attempts + 1);
  if (remaining <= 0) {
    return res.status(429).json({ error: 'Too Many Requests', message: 'Challenge locked due to excessive failed attempts' });
  }
  return res.status(401).json({ error: 'Unauthorized', message: `Invalid verification code. ${remaining} attempts remaining.` });
}"""
    add_code_block(doc, code_timing_safe, "Cryptographic Constant-Time OTP Verification")

    add_section_heading(doc, "Appendix E:", "API Request and Response Examples")
    api_example_str = """// 1. Parent Alert Request (POST /api/students/:id/parent-alert)
Headers: Authorization: Bearer <mentor_jwt_token>, Content-Type: application/json
Body:
{
  "subject": "Academic Attendance Notice: Urgent Mentor Advisory",
  "message": "Dear Parent, Bhoomika's attendance has dropped to 62.8% with 27 active arrears."
}

// 2. Parent Alert Response (200 OK)
{
  "success": true,
  "message": "Parent alert dispatched successfully",
  "data": {
    "event_id": "evt-7c9b2f1e-45a8-48b2-9d33-872f1a91e502",
    "status": "sent",
    "channel": "n8n",
    "recipient": "parent.bhoomika@gmail.com"
  }
}"""
    add_code_block(doc, api_example_str, "Parent Alert REST Request and Response")

    add_section_heading(doc, "Appendix F:", "Database Schema and Model Details")
    add_body_paragraph(
        doc,
        "Mongoose models define strict validation, defaults, and compound indexes. The OtpChallenge model includes an automatic "
        "TTL index on 'expires_at' (expireAfterSeconds: 0), ensuring automatic document purging by MongoDB's background thread."
    )

    add_section_heading(doc, "Appendix G:", "Additional Test Cases")
    add_body_paragraph(
        doc,
        "Supplementary regression suites verify that curriculum queries filter correctly by branch and semester, distinct branch lists "
        "sort alphabetically, and student mark records aggregate accurately across all 8 academic semesters."
    )

    add_section_heading(doc, "Appendix H:", "Additional Project Screenshots")
    add_body_paragraph(
        doc,
        "Supplementary screenshot slots for auxiliary modules (Curriculum browser, Branch explorer, Institution directory, "
        "and Terminal test execution logs)."
    )
