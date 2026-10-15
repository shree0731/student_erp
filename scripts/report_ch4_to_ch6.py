import docx
from docx.shared import Inches, Pt, RGBColor
from report_styles import (
    add_chapter_heading, add_section_heading, add_subsection_heading,
    add_body_paragraph, add_bullet_item, style_table, add_table_title,
    add_code_block, add_ascii_diagram
)

def build_chapters_4_to_6(doc):
    """Builds Chapters 4, 5, and 6 with architectural diagrams, schemas, and implementation details."""

    # =========================================================================
    # CHAPTER 4: SYSTEM DESIGN AND ARCHITECTURE
    # =========================================================================
    add_chapter_heading(doc, 4, "System Design and Architecture")

    add_section_heading(doc, "4.1", "System Architecture")
    add_body_paragraph(
        doc,
        "The Student Retention Ecosystem is architectured as a multi-tier, distributed microservice application designed to decouple "
        "interactive user presentation, relational business logic, high-throughput machine learning inference, and asynchronous "
        "notification workflows. The architecture adheres to principles of loose coupling, high cohesion, fault isolation, and resilient "
        "graceful degradation."
    )

    arch_diagram = """+-----------------------------------------------------------------------------------+
|                            CLIENT TIER (React 18 + Vite)                          |
|  +------------------------+  +--------------------------+  +--------------------+ |
|  | Admin Dashboard (5173) |  | Mentor Dossier UI (5173) |  | Student App (5173) | |
|  +------------------------+  +--------------------------+  +--------------------+ |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / REST (JSON + JWT Bearer)
+------------------------------------------v----------------------------------------+
|                      APPLICATION GATEWAY TIER (Express.js / Node.js - Port 5000)  |
|  +-------------------+  +--------------------+  +-------------------------------+ |
|  | Auth & 2FA Router |  | Student/Mentor API |  | AI Service Proxy & Fallback   | |
|  +-------------------+  +--------------------+  +-------------------------------+ |
+------------------+-----------------------+----------------------+-----------------+
                   |                       |                      |
                   | Mongoose / Native     | REST (API Key)       | HTTP Webhook
                   v                       v                      v
+------------------------+ +-------------------------+ +----------------------------+
|    PERSISTENCE TIER    | |    INTELLIGENCE TIER    | |     AUTOMATION TIER        |
|  MongoDB / In-Memory   | |  FastAPI Microservice   | |       n8n Engine           |
|  - Users & OTP Records | |  - Tuned XGBoost Model  | |  - Parent Email Workflow   |
|  - Students & Marks    | |  - Tree SHAP Explainer  | |  - Meeting Dispatch Loop   |
|  - Meeting Outbox / Log| |  - Crisis Safety Filter | |  - SMTP Nodemailer Fallback|
+------------------------+ +-------------------------+ +----------------------------+"""

    add_ascii_diagram(
        doc, arch_diagram, "4.1",
        "Tiered Microservice Architecture of the Student Retention Ecosystem",
        "Figure 4.1 illustrates the four interconnected architectural tiers: (1) Client Presentation Tier rendered via React 18, "
        "(2) Application Gateway Tier handling role-based routing and resilient fallback proxying, (3) Persistence Tier managing "
        "MongoDB and dual in-memory stores, and (4) Intelligence and Automation Tiers managing XGBoost inference and n8n webhook workflows."
    )

    add_section_heading(doc, "4.2", "Overall System Workflow")
    add_body_paragraph(
        doc,
        "The overall system workflow coordinates academic activity across the entire student lifecycle. Academic attendance and marks "
        "are continuously ingested from campus records. When a faculty mentor accesses a student's dossier, the Express gateway packages "
        "a 16-dimensional feature vector and dispatches a synchronous REST request to the FastAPI microservice. The predictive engine "
        "returns the calibrated risk tier, probabilities, and top SHAP drivers."
    )
    add_body_paragraph(
        doc,
        "If a high dropout risk is identified or attendance drops below 75%, the mentor can initiate an automated intervention: logging "
        "a clinical counseling note or triggering a Parent Alert. The backend constructs an authenticated payload, generates an idempotency "
        "key, enforces a rate throttle (max 10 dispatches/min), and posts the event to the n8n webhook engine, which dispatches a structured "
        "email to the student's guardian while logging delivery confirmation in the audit store."
    )

    add_section_heading(doc, "4.3", "Module Description")
    add_bullet_item(doc, "Enforces role-based credentials validation and manages 6-digit email OTP generation, HMAC hashing, and lockout timers.", "1. Authentication & Two-Factor OTP Module")
    add_bullet_item(doc, "Maintains complete academic transcripts, semester GPA progression, attendance decay, and arrears records.", "2. Student Academic Management Module")
    add_bullet_item(doc, "Provides cohort triage, risk-ranked rosters, student dossiers, and single-upsert clinical counseling notes.", "3. Faculty Mentorship Module")
    add_bullet_item(doc, "Aggregates institutional health, department-level risk metrics, and campus-wide meeting resolution analytics.", "4. Administrative Analytics Module")
    add_bullet_item(doc, "Executes real-time XGBoost inference, class probability calibration, and local Tree SHAP feature attribution.", "5. Machine Learning Prediction Engine")
    add_bullet_item(doc, "Manages bidirectional meeting creation, acknowledgment, scheduling, and resolution across student and faculty portals.", "6. Meeting Request Lifecycle Module")
    add_bullet_item(doc, "Orchestrates parent and mentor notifications via n8n webhooks and Nodemailer SMTP with idempotency tracking.", "7. Automated Notification Dispatcher")
    add_bullet_item(doc, "Provides contextual student academic advice and enforces strict bilingual crisis distress screening.", "8. AI Academic Advisor Copilot")

    add_section_heading(doc, "4.4", "Frontend Design")
    add_body_paragraph(
        doc,
        "The user interface is designed using React 18, Vite 5, and vanilla CSS variables implementing a bespoke institutional 'light-purple' "
        "aesthetic. The palette emphasizes high visual clarity, low cognitive fatigue, and accessible contrast ratios (Primary Indigo: #6366f1, "
        "Soft Background: #f8fafc, Card Canvas: #ffffff, Text Ink: #1e293b, Subdued Slate: #64748b, Danger Coral: #ef4444, Warning Amber: #f59e0b, "
        "and Success Emerald: #10b981)."
    )
    add_body_paragraph(
        doc,
        "The frontend architecture avoids heavyweight component libraries, utilizing responsive CSS Grid and Flexbox with Lucide-React vector "
        "icons. State management is organized through React Context providers: AuthContext manages active session state, JWT tokens, and 2FA "
        "challenge states; SidebarContext coordinates responsive drawer navigation. The interface is strictly guarded by an Abstract Syntax "
        "Tree (AST) logic freeze verification tool to guarantee UI layout integrity during iterative backend enhancements."
    )

    add_section_heading(doc, "4.5", "Backend Design")
    add_body_paragraph(
        doc,
        "The Express.js application gateway is structured around the Controller-Service-Model design pattern. Incoming HTTP requests pass "
        "through a sequential middleware pipeline: (1) CORS security policy enforcement, (2) Express JSON body parsing, (3) Rate limiting via "
        "express-rate-limit (10 requests/minute per IP on authentication routes), (4) JWT token verification and payload extraction, and "
        "(5) Role-Based Access Control (RBAC) via requireRole middleware."
    )
    add_body_paragraph(
        doc,
        "Business logic is partitioned into dedicated controllers (authController, studentController, facultyController, adminController, "
        "meetingRequestController, mentorNoteController, notificationController). External integrations are encapsulated in robust service layers "
        "(aiServiceClient, mailer, notificationDispatcher) equipped with circuit-breaking fallback logic."
    )

    add_section_heading(doc, "4.6", "Database Design")
    add_body_paragraph(
        doc,
        "Persistence is engineered through MongoDB using Mongoose object modeling, augmented by dual in-memory stores that mirror collection "
        "interfaces for automated testing and offline fallback execution. Table 4.1 summarizes the schema specifications."
    )

    add_table_title(doc, "4.1", "MongoDB Collection Schemas and Primary Index Keys")
    db_tbl = doc.add_table(rows=1, cols=4)
    db_tbl.rows[0].cells[0].paragraphs[0].text = "COLLECTION"
    db_tbl.rows[0].cells[1].paragraphs[0].text = "PRIMARY FIELDS & TYPES"
    db_tbl.rows[0].cells[2].paragraphs[0].text = "INDEX KEYS"
    db_tbl.rows[0].cells[3].paragraphs[0].text = "FUNCTIONAL ROLE"

    db_items = [
        ("users", "username (Str), password_hash (Str), role (Enum), email (Str), linkedId (Str)", "username (Unique), role", "Authentication, credentials, and institutional role mapping."),
        ("students", "student_id (Str), name (Str), dept (Str), gpa (Num), att_pct (Num), risk (Str)", "student_id (Unique), mentor_id, dept", "Core student academic, demographic, and risk profile."),
        ("marks", "student_id (Str), semester (Num), course_code (Str), internal (Num), grade (Str)", "student_id, semester, course_code", "Course-level continuous internal marks and exam grades."),
        ("faculties", "faculty_id (Str), name (Str), dept (Str), email (Str), designation (Str)", "faculty_id (Unique), dept", "Faculty directory, department affiliation, and contact info."),
        ("meeting_requests", "request_id (Str), student_id (Str), mentor_id (Str), status (Enum), urgency (Str)", "request_id, mentor_id, student_id", "Bidirectional student-mentor meeting scheduling lifecycle."),
        ("mentor_notes", "note_id (Str), student_id (Str), mentor_id (Str), note (Str), updatedAt (Date)", "student_id + mentor_id (Compound)", "Single-upsert private clinical mentoring notes per student."),
        ("otp_challenges", "challenge_id (Str), username (Str), code_hash (Str), expires_at (Date), resends (Num)", "challenge_id (Unique), expires_at (TTL)", "Time-limited 2FA challenge tokens with auto-expire TTL index."),
        ("notification_logs", "event_id (Str), idempotency_key (Str), channel (Str), recipient (Str), status (Str)", "event_id, idempotency_key (Unique)", "Auditable dispatch records for parent alerts and meeting emails.")
    ]
    style_table(db_tbl, [Inches(1.2), Inches(2.2), Inches(1.5), Inches(1.4)])
    for coll, flds, idx, role in db_items:
        r = db_tbl.add_row()
        r.cells[0].paragraphs[0].text = coll
        r.cells[1].paragraphs[0].text = flds
        r.cells[2].paragraphs[0].text = idx
        r.cells[3].paragraphs[0].text = role

    add_section_heading(doc, "4.7", "Class Diagram")
    add_body_paragraph(
        doc,
        "Figure 4.3 depicts the entity relationship class diagram showing attributes, methods, and cardinality relationships."
    )

    class_diagram = """+------------------------------------+          +--------------------------------------+
|               User                 |          |               Faculty                |
+------------------------------------+          +--------------------------------------+
| - username: String                 |          | - faculty_id: String                 |
| - password_hash: String            |          | - name: String                       |
| - role: RoleEnum                   |          | - department: String                 |
| - email: String                    |          | - email: String                      |
| - linkedId: String                 |          | - designation: String                |
+------------------------------------+          +--------------------------------------+
| + authenticate(password): Boolean  |          | + getAssignedMentees(): List<Student>|
| + generateJwtToken(): String       |          +------------------+-------------------+
+-----------------+------------------+                             | 1
                  | 1                                              |
                  | maps to                                        | advises
                  v 1                                              v 1..*
+------------------------------------+          +--------------------------------------+
|              Student               |          |             MeetingRequest           |
+------------------------------------+          +--------------------------------------+
| - student_id: String               |          | - request_id: String                 |
| - student_name: String             | 1      * | - student_id: String                 |
| - department: String               +--------->| - mentor_id: String                  |
| - overall_gpa: Float               | requests | - urgency: UrgencyEnum               |
| - attendance_pct: Float            |          | - status: StatusEnum                 |
| - backlogs_count: Integer          |          | - reason_short: String               |
| - dropout_risk_label: String       |          +--------------------------------------+
+------------------------------------+          | + transitionStatus(newStatus): Void  |
| + calculateAttendanceDecay(): Float|          +--------------------------------------+
| + getSemesterMarks(): List<Marks>  |
+-----------------+------------------+
                  | 1
                  | has note
                  v 0..1
+------------------------------------+
|             MentorNote             |
+------------------------------------+
| - student_id: String               |
| - mentor_id: String                |
| - note: String (max 2000 chars)    |
+------------------------------------+
| + upsert(text): Void               |
+------------------------------------+"""

    add_ascii_diagram(
        doc, class_diagram, "4.3",
        "Domain Class Diagram for Institutional ERP Entities",
        "Figure 4.3 models the core domain classes. A User entity authenticates into the system and maps to either a Student or Faculty "
        "profile. A Faculty mentor oversees multiple Student mentees, reviews MeetingRequest instances, and maintains an upsertable "
        "MentorNote clinical record."
    )

    add_section_heading(doc, "4.8", "Use Case Diagram")
    add_body_paragraph(
        doc,
        "Figure 4.4 illustrates the interactions between external actors (Student, Faculty Mentor, Institutional Administrator, "
        "Parent/Guardian, and External AI Microservice) and system use cases."
    )

    use_case_diagram = """   +-------------+                                                    +-------------+
   |   Student   |                                                    |   Mentor    |
   +------+------+                                                    +------+------+
          |                                                                  |
          +---->( UC-01: Login with 2FA Email OTP )<-------------------------+
          |                                                                  |
          +---->( UC-07: Submit Meeting Request )--------------------------->+
          |                                                                  |
          +---->( UC-08: Interact with AI Copilot )                          +---->( UC-03: View Prioritized Roster )
          |                                                                  |
          +---->( UC-09: View GPA & Backlogs )                               +---->( UC-04: View Live AI Assessment )
                                                                             |
   +-------------+                                                           +---->( UC-05: Upsert Clinical Notes )
   |    Admin    |                                                           |
   +------+------+                                                           +---->( UC-06: Send Parent Alert Email )
          |                                                                  |
          +---->( UC-01: Login with 2FA Email OTP )                          |
          |                                                                  |
          +---->( UC-02: Institutional Analytics )                           |
          |                                                                  v
          v                                                       +--------------------+
+--------------------+                                            |  Parent / Guardian |
| FastAPI ML Service |                                            +--------------------+
+--------------------+                                            ( Receives automated alerts )"""

    add_ascii_diagram(
        doc, use_case_diagram, "4.4",
        "Comprehensive System Use Case Diagram across User Roles",
        "Figure 4.4 illustrates actor-to-use-case relationships. Students submit meeting requests and query the AI Copilot; Mentors review "
        "risk-prioritized rosters, inspect live ML predictions, upsert clinical notes, and dispatch parent alerts to Guardians."
    )

    add_section_heading(doc, "4.9", "Sequence Diagram")
    add_body_paragraph(
        doc,
        "Figure 4.5 captures the sequence of messages exchanged during the Two-Factor Email OTP authentication lifecycle."
    )

    seq_diagram = """User / Browser          Express Gateway          Mailer Service          OtpChallengeStore
      |                        |                        |                        |
      | 1. POST /auth/login    |                        |                        |
      |----------------------->|                        |                        |
      |                        | 2. Validate Password   |                        |
      |                        |    Generate 6-digit OTP|                        |
      |                        | 3. sendOtpEmail(code)  |                        |
      |                        |----------------------->|                        |
      |                        |                        | 4. SMTP Dispatch / OK  |
      |                        |<-----------------------|                        |
      |                        | 5. createChallenge(hash)|                        |
      |                        |------------------------------------------------>|
      | 6. HTTP 200            |                        |                        |
      |    {otp_required:true, |                        |                        |
      |     challenge_id, hint}|                        |                        |
      |<-----------------------|                        |                        |
      |                        |                        |                        |
      | 7. POST /verify-otp    |                        |                        |
      |    (challenge_id, code)|                        |                        |
      |----------------------->|                        |                        |
      |                        | 8. findByChallengeId() |                        |
      |                        |------------------------------------------------>|
      |                        | 9. Timing-Safe Compare |                        |
      |                        |    attempts < 5, OK    |                        |
      |                        | 10. Mark verified/del  |                        |
      |                        |------------------------------------------------>|
      | 11. HTTP 200           |                        |                        |
      |     {token, user}      |                        |                        |
      |<-----------------------|                        |                        |"""

    add_ascii_diagram(
        doc, seq_diagram, "4.5",
        "Sequence Diagram for Two-Factor OTP Login Authentication",
        "Figure 4.5 documents the two-phase authentication handshake: Phase 1 validates password credentials and triggers asynchronous email OTP "
        "dispatch; Phase 2 verifies the supplied 6-digit code using HMAC-SHA256 constant-time comparison before issuing the JWT bearer token."
    )

    add_section_heading(doc, "4.10", "Data Flow Diagram (DFD)")
    add_body_paragraph(
        doc,
        "Figure 4.6 presents the Context Level (Level 0) DFD showing high-level system boundaries and external entities."
    )

    dfd0_diagram = """+-------------+               Credentials / Meeting Requests / Inquiries             +------------------+
|   Student   +--------------------------------------------------------------------->|                  |
|             |<---------------------------------------------------------------------+                  |
+-------------+                    Attendance, Grades & Copilot Responses            |                  |
                                                                                     |   INSIGHT ERP    |
+-------------+                      Mentor Notes / Status Updates / Alerts          |                  |
|   Faculty   +--------------------------------------------------------------------->|     STUDENT      |
|   Mentor    |<---------------------------------------------------------------------+    RETENTION     |
+-------------+                     Cohort Roster & Real-Time AI Predictions         |    ECOSYSTEM     |
                                                                                     |   (System 0)     |
+-------------+                         Institutional Analytical Queries             |                  |
|    Admin    +--------------------------------------------------------------------->|                  |
|             |<---------------------------------------------------------------------+                  |
+-------------+                     Campus Retention & Department Reports            |                  |
                                                                                     |                  |
+-------------+                          16-Feature Vector Payload                   |                  |
| FastAPI ML  |<---------------------------------------------------------------------+                  |
|   Service   +--------------------------------------------------------------------->|                  |
+-------------+                     Risk Tiers, Class Probs & SHAP Drivers           +------------------+"""

    add_ascii_diagram(
        doc, dfd0_diagram, "4.6",
        "Data Flow Diagram (Level 0 - Context Level Diagram)",
        "Figure 4.6 depicts the system boundary. External entities (Student, Mentor, Admin, and FastAPI ML Engine) interface with the core "
        "ecosystem, exchanging operational data, predictive vectors, and analytical summaries."
    )

    add_section_heading(doc, "4.11", "Entity Relationship Diagram (ER Diagram)")
    add_body_paragraph(
        doc,
        "Figure 4.8 delineates the entity relationship architecture across the persistence layer."
    )

    er_diagram = """+--------------------+          1:N           +---------------------+          1:N          +--------------------+
|      COLLEGES      +----------------------->|     DEPARTMENTS     +---------------------->|      STUDENTS      |
+--------------------+                        +---------------------+                       +--------------------+
| PK  college_id     |                        | PK  dept_code       |                       | PK  student_id     |
|     college_name   |                        | FK  college_id      |                       | FK  dept_code      |
|     campus_city    |                        |     dept_name       |                       | FK  mentor_id      |
+--------------------+                        +---------------------+                       |     overall_gpa    |
                                                                                            |     attendance_pct |
                                                                                            |     backlogs_count |
                                                                                            +---------+----------+
                                                                                                      |
                                                                +-------------------------------------+-------------------------------------+
                                                                | 1:N                                 | 1:N                                 | 1:1
                                                                v                                     v                                     v
                                                     +--------------------+                +--------------------+                +--------------------+
                                                     |       MARKS        |                |  MEETING_REQUESTS  |                |    MENTOR_NOTES    |
                                                     +--------------------+                +--------------------+                +--------------------+
                                                     | PK  mark_id        |                | PK  request_id     |                | PK  note_id        |
                                                     | FK  student_id     |                | FK  student_id     |                | FK  student_id     |
                                                     |     semester       |                | FK  mentor_id      |                | FK  mentor_id      |
                                                     |     course_code    |                |     urgency        |                |     clinical_note  |
                                                     |     internal_marks |                |     status         |                |     updated_at     |
                                                     |     grade          |                |     scheduled_at   |                +--------------------+
                                                     +--------------------+                +--------------------+"""

    add_ascii_diagram(
        doc, er_diagram, "4.8",
        "Entity Relationship Diagram for Database Persistence",
        "Figure 4.8 outlines the relational topology. Colleges host Departments, which enroll Students. Each Student is linked to historical "
        "Marks records, scheduled MeetingRequests, and an upserted MentorNote."
    )

    add_section_heading(doc, "4.12", "API Architecture and Communication Flow")
    add_body_paragraph(
        doc,
        "Inter-process communication between the Express application gateway and the FastAPI microservice is governed by RESTful HTTP "
        "conventions. All endpoints utilize standard HTTP verbs (GET, POST, PUT, PATCH, DELETE) and adhere to strict status code semantics. "
        "When communicating internally, requests transmit an authorized service key in the X-Service-Key header, preventing unauthorized "
        "access from outside the internal network boundary."
    )

    add_section_heading(doc, "4.13", "Security Architecture")
    add_bullet_item(doc, "All state-changing endpoints authenticate requests via JSON Web Tokens (JWT) signed with HMAC-SHA256, carrying role claims (admin, mentor, student) and 8-hour expiration.", "JWT Authentication")
    add_bullet_item(doc, "Login endpoints enforce a 10 requests/minute per IP rate limit to prevent dictionary and brute-force attacks.", "Rate Limiting")
    add_bullet_item(doc, "6-digit OTP codes are stored exclusively as HMAC-SHA256 hashes. Verification is performed using crypto.timingSafeEqual() to thwart timing side-channel attacks.", "Cryptographic OTP Security")
    add_bullet_item(doc, "Five consecutive failed OTP attempts permanently lock the challenge with an HTTP 429 response, preventing automated enumeration.", "Attempt Locking")
    add_bullet_item(doc, "Client inputs are sanitized against HTML entity injection, and email notification recipients are strictly resolved on the server to prevent open-relay abuse.", "Input Sanitization & Recipient Guard")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: COMPLETE PROJECT IMPLEMENTATION
    # =========================================================================
    add_chapter_heading(doc, 5, "Complete Project Implementation")

    add_section_heading(doc, "5.1", "Implementation Overview")
    add_body_paragraph(
        doc,
        "The implementation phase realized the architectural design into functional, production-ready software artifacts. "
        "The project is structured across two complementary repositories: FSD (hosting the React frontend, Express backend gateway, "
        "n8n notification workflows, and database seed scripts) and ai-dropout-prediction (hosting the Python FastAPI microservice, "
        "trained XGBoost model artifacts, SHAP explainability pipelines, and the Baymate evaluation dashboard)."
    )

    add_section_heading(doc, "5.2", "Project Folder Structure")
    add_body_paragraph(
        doc,
        "Table 5.1 documents the directory layout of the Student Retention Ecosystem."
    )

    add_table_title(doc, "5.1", "Annotated System Directory and Module Structure")
    dir_tbl = doc.add_table(rows=1, cols=3)
    dir_tbl.rows[0].cells[0].paragraphs[0].text = "DIRECTORY / PATH"
    dir_tbl.rows[0].cells[1].paragraphs[0].text = "PRIMARY MODULES & ARTIFACTS"
    dir_tbl.rows[0].cells[2].paragraphs[0].text = "ARCHITECTURAL PURPOSE"

    dir_items = [
        ("FSD/backend/controllers/", "authController.js, studentController.js, meetingRequestController.js, notificationController.js", "Handles HTTP requests, input validation, and business logic execution."),
        ("FSD/backend/models/", "User.js, Student.js, Faculty.js, MeetingRequest.js, MentorNote.js, OtpChallenge.js, NotificationLog.js", "Mongoose schema definitions and in-memory dual fallback stores."),
        ("FSD/backend/services/", "aiServiceClient.js, notificationDispatcher.js, mailer.js", "Microservice HTTP client, n8n webhook dispatcher, and SMTP mailer."),
        ("FSD/backend/middleware/", "authMiddleware.js, rateLimiter.js, serviceKeyAuth.js", "JWT role verification, rate limiting, and internal API key validation."),
        ("FSD/backend/routes/", "api.js", "Express router mounting all 24 authenticated and public endpoints."),
        ("FSD/backend/tests/", "otpAuth.test.js, notificationDispatcher.test.js, meetingRequestLifecycle.test.js, etc. (10 suites)", "Automated Jest and Supertest unit, integration, and security test suites."),
        ("FSD/frontend/src/pages/", "LoginPage.jsx, AdminDashboard.jsx, MentorDashboard.jsx, StudentDetail.jsx, StudentDashboard.jsx", "Top-level role-specific dashboard views and authentication flow."),
        ("FSD/frontend/src/components/", "Navbar.jsx, Sidebar.jsx, ParentAlertModal.jsx, ChatbotWidget.jsx", "Modular reusable UI components and interactive modals."),
        ("FSD/frontend/src/context/", "AuthContext.jsx, SidebarContext.jsx", "Global client-side session state and navigation coordination."),
        ("FSD/n8n/", "insighterp-notify.workflow.json, README.md", "Production n8n webhook workflow JSON and setup runbook."),
        ("ai-dropout-prediction/ml-service/app/", "main.py, predictor.py, chatbot.py, distress.py, helplines.py", "FastAPI ASGI application, XGBoost inference, and crisis safety filter."),
        ("ai-dropout-prediction/models/", "dropout_model.pkl, preprocessor.pkl, metrics.json, feature_spec.json", "Trained model binaries, transformer pipelines, and evaluation metrics.")
    ]
    style_table(dir_tbl, [Inches(2.0), Inches(2.2), Inches(2.1)])
    for path, mods, purp in dir_items:
        r = dir_tbl.add_row()
        r.cells[0].paragraphs[0].text = path
        r.cells[1].paragraphs[0].text = mods
        r.cells[2].paragraphs[0].text = purp

    add_section_heading(doc, "5.3", "Development Environment Setup")
    add_body_paragraph(
        doc,
        "System initialization requires configuring Node.js (v18+ LTS) and Python (3.10+). Dependencies are installed via npm install "
        "in FSD/backend and FSD/frontend, and via pip install -r requirements.txt in ai-dropout-prediction/ml-service. Environment variables "
        "are seeded from .env.example files, defining database URIs, JWT secrets, microservice ports, and SMTP credentials."
    )

    add_section_heading(doc, "5.4", "Frontend Implementation")
    add_body_paragraph(
        doc,
        "The frontend is implemented as a single-page application (SPA) using React 18 and Vite. Key implementation highlights include:"
    )
    add_bullet_item(doc, "Renders an institutional role selector, college directory dropdown, credential inputs, and an in-place conditional swap to a 6-digit OTP verification card with live resend timer.", "LoginPage.jsx")
    add_bullet_item(doc, "Visualizes assigned mentees sorted by risk, highlights low-attendance warnings (<75%), and provides direct access to meeting management and counseling logs.", "MentorDashboard.jsx")
    add_bullet_item(doc, "Displays comprehensive academic metrics, attendance decay trajectory, live AI assessment badge with SHAP drivers, single-upsert notes, and the parent alert trigger.", "StudentDetail.jsx")
    add_bullet_item(doc, "Presents a pre-populated academic summary (attendance %, arrears, risk level), editable textarea, and asynchronous 'Send email to parent' button with real-time status updates.", "ParentAlertModal.jsx")

    add_section_heading(doc, "5.5", "Backend Implementation")
    add_body_paragraph(
        doc,
        "The backend server (server.js) initializes the Express runtime, registers middleware, establishes MongoDB connectivity, and mounts "
        "the unified API router (/api). A central highlight is the resilient AI Service Client (aiServiceClient.js), which encapsulates HTTP "
        "calls to the FastAPI microservice with a 5-second timeout and automated fallback synthesis."
    )

    code_resilient_fallback = """// Excerpt: Resilient AI Service Client Fallback Logic (aiServiceClient.js)
async function getStudentPrediction(studentId, payload) {
  try {
    const response = await axios.post(`${AI_BASE_URL}/predict`, payload, {
      timeout: 5000,
      headers: { 'X-Service-Key': process.env.SERVICE_KEY }
    });
    return {
      prediction: response.data.prediction,
      probabilities: response.data.probabilities,
      top_drivers: response.data.top_drivers || [],
      source: 'live'
    };
  } catch (err) {
    console.warn(`[AI Client] Live inference unavailable for ${studentId}: ${err.message}. Engaging fallback.`);
    return {
      prediction: payload.dropout_risk_label || 'Medium',
      probabilities: { Low: 0.33, Medium: 0.34, High: 0.33 },
      top_drivers: [['attendance_pct', 0.45], ['backlogs_count', 0.35]],
      source: 'fallback',
      warning: 'Live AI prediction service is unreachable or timed out'
    };
  }
}"""
    add_code_block(doc, code_resilient_fallback, "aiServiceClient.js - Resilient Microservice Proxy")

    add_section_heading(doc, "5.6", "Database Implementation")
    add_body_paragraph(
        doc,
        "Database entities are formalized via Mongoose schemas. To support offline development, continuous integration, and rapid testing, "
        "models implement an in-memory dual store. When MongoDB is unavailable (getDBStatus() returns false), operations route to Map-based "
        "in-memory stores (e.g., inMemoryChallenges, inMemoryNotes, inMemoryRequests), guaranteeing identical query semantics."
    )

    add_section_heading(doc, "5.7", "Module-wise Implementation")
    add_subsection_heading(doc, "5.7.1", "Two-Factor Authentication & OTP Flow")
    add_body_paragraph(
        doc,
        "When a user submits valid primary credentials, authController.login checks process.env.OTP_ENABLED. If enabled, the server generates "
        "a cryptographically secure 6-digit random code (crypto.randomInt), hashes it with HMAC-SHA256, stores the challenge with a 300-second "
        "TTL, and dispatches the code via mailer.sendOtpEmail. The client receives { otp_required: true, challenge_id, email_hint } without "
        "issuing the JWT token. Upon submitting the code to /api/auth/verify-otp, the server verifies code equality using crypto.timingSafeEqual(). "
        "Five consecutive invalid attempts lock the challenge permanently."
    )

    add_subsection_heading(doc, "5.7.2", "Mentor Notes Single-Upsert Architecture")
    add_body_paragraph(
        doc,
        "To prevent duplicate note proliferation while preserving clean UI layouts, mentor notes use a single-upsert pattern (PUT /api/students/:id/notes). "
        "A mentor maintains exactly one active clinical note per student. If new text is submitted, it updates the existing record. If an empty "
        "string is saved, the note is deleted. Submissions exceeding 2,000 characters return HTTP 422 Unprocessable Entity."
    )

    add_section_heading(doc, "5.8", "API Implementation")
    add_body_paragraph(
        doc,
        "The system exposes 24 RESTful endpoints. Selected critical endpoints are documented below:"
    )
    add_bullet_item(doc, "POST /api/auth/login – Validates password, generates 2FA challenge, dispatches OTP email.", "Authentication")
    add_bullet_item(doc, "POST /api/auth/verify-otp – Timing-safe OTP code verification; issues JWT token.", "2FA Verification")
    add_bullet_item(doc, "GET /api/students/:id – Fetches student dossier and attaches live/fallback AI prediction.", "Student Dossier")
    add_bullet_item(doc, "PUT /api/students/:id/notes – Upserts single mentor clinical note (max 2000 chars).", "Mentor Notes")
    add_bullet_item(doc, "POST /api/students/:id/parent-alert – Triggers n8n parent notification webhook.", "Parent Alert")
    add_bullet_item(doc, "PATCH /api/meeting-requests/:id/status – Transitions meeting status (acknowledged, scheduled, resolved).", "Meeting Lifecycle")

    add_section_heading(doc, "5.9", "Authentication and Authorization")
    add_body_paragraph(
        doc,
        "Authorization is enforced through the requireAuth and requireRole Express middleware. The requireAuth middleware extracts the Bearer "
        "token from the HTTP Authorization header, verifies signature integrity against process.env.JWT_SECRET, and attaches the decoded "
        "user payload (username, role, linkedId, collegeId) to req.user. The requireRole(...roles) middleware validates that the user's role "
        "matches permitted access levels, rejecting unauthorized access with HTTP 403 Forbidden."
    )

    add_section_heading(doc, "5.10", "Data Processing and Business Logic")
    add_body_paragraph(
        doc,
        "The machine learning pipeline consumes a 16-dimensional feature vector. Table 5.2 defines the input feature specification."
    )

    add_table_title(doc, "5.2", "Input Feature Vector Specification for XGBoost Predictor")
    feat_tbl = doc.add_table(rows=1, cols=4)
    feat_tbl.rows[0].cells[0].paragraphs[0].text = "FEATURE NAME"
    feat_tbl.rows[0].cells[1].paragraphs[0].text = "DATA TYPE"
    feat_tbl.rows[0].cells[2].paragraphs[0].text = "VALID RANGE"
    feat_tbl.rows[0].cells[3].paragraphs[0].text = "ACADEMIC INTERPRETATION"

    feat_data = [
        ("attendance_pct", "Float", "0.0 – 100.0 %", "Cumulative overall attendance percentage across all enrolled subjects."),
        ("attendance_decay", "Float", "-100.0 – +100.0", "Difference between Month 1 attendance and the most recent month attendance."),
        ("overall_gpa", "Float", "0.0 – 10.0", "Cumulative Grade Point Average across completed semesters."),
        ("backlogs_count", "Integer", "0 – 100", "Total active uncleared course arrears / backlogs."),
        ("cutoff_mark_200", "Float", "0.0 – 200.0", "Engineering admission entrance cutoff score (out of 200)."),
        ("family_income_annual", "Float", ">= 0.0 INR", "Annual household income indicating socio-economic vulnerability."),
        ("mentor_meetings_attended", "Integer", "0 – 100", "Count of formal faculty counseling sessions attended by student."),
        ("first_gen_learner", "Integer", "0 or 1", "Binary indicator (1 if student is first in family to pursue degree)."),
        ("distance_from_home_km", "Float", "0.0 – 2000.0 km", "Commuting distance from residential home or hostel to campus."),
        ("failed_subjects_count", "Integer", "0 – 100", "Number of course subjects failed in recent continuous internal assessments."),
        ("core_theory_average", "Float", "0.0 – 100.0", "Mean percentage score across core departmental analytical theory courses."),
        ("internal_exam_avg", "Float", "0.0 – 100.0", "Mean score achieved in centralized Continuous Internal Assessments (CIA)."),
        ("assignment_avg", "Float", "0.0 – 100.0", "Continuous assignment and tutorial evaluation average score."),
        ("grade_trend", "Float", "-10.0 – +10.0", "Progression slope between Semester 1 GPA and current semester GPA."),
        ("year_of_study", "Integer", "1, 2, 3, or 4", "Current undergraduate instructional curriculum year."),
        ("department", "String (Categorical)", "13 Departments", "Academic branch (e.g., CSE, IT, AIDS, AIML, ECE, EEE, MECH, etc.).")
    ]
    style_table(feat_tbl, [Inches(1.8), Inches(1.1), Inches(1.3), Inches(2.1)])
    for fn, dt, vr, ai in feat_data:
        r = feat_tbl.add_row()
        r.cells[0].paragraphs[0].text = fn
        r.cells[1].paragraphs[0].text = dt
        r.cells[2].paragraphs[0].text = vr
        r.cells[3].paragraphs[0].text = ai

    add_section_heading(doc, "5.11", "Error Handling and Validation")
    add_body_paragraph(
        doc,
        "Input validation is enforced at both microservice and gateway boundaries. In FastAPI, incoming JSON payloads are validated "
        "against the ModelStudentFeatures Pydantic model; missing fields or out-of-boundary values immediately return HTTP 422 with granular "
        "field-level error diagnostics. In Express, route controllers validate types and ranges before database operations, returning "
        "structured { error: 'Bad Request', message: '...' } responses and logging server exceptions without leaking internal stack traces."
    )

    add_section_heading(doc, "5.12", "External Service and API Integration")
    add_body_paragraph(
        doc,
        "The ecosystem integrates three external service layers: (1) Python FastAPI microservice on port 8001 for XGBoost inference and SHAP "
        "attributions, (2) n8n workflow engine on port 5678 for event-driven email notifications, and (3) Nodemailer SMTP transport over TLS "
        "with automated dry-run fallback when credentials are unset."
    )

    add_section_heading(doc, "5.13", "Configuration and Environment Variables")
    add_body_paragraph(
        doc,
        "System configuration is governed through environment variables declared in .env.example files. Real credentials and private secrets "
        "are strictly excluded from source control. Table 5.3 lists the configuration parameters."
    )

    add_table_title(doc, "5.3", "Sanitized Environment Configuration Parameters")
    env_tbl = doc.add_table(rows=1, cols=3)
    env_tbl.rows[0].cells[0].paragraphs[0].text = "VARIABLE NAME"
    env_tbl.rows[0].cells[1].paragraphs[0].text = "DEFAULT / SAMPLE VALUE"
    env_tbl.rows[0].cells[2].paragraphs[0].text = "DESCRIPTION AND SCOPE"

    env_items = [
        ("PORT", "5000", "HTTP listening port for the Express ERP gateway backend."),
        ("NODE_ENV", "development / production / test", "Runtime environment mode governing logging and rate limit bypass."),
        ("MONGODB_URI", "mongodb://127.0.0.1:27017/student_dropout_erp", "MongoDB database connection string."),
        ("JWT_SECRET", "super_secret_jwt_key_2026", "Cryptographic key for signing and verifying JWT session tokens."),
        ("AI_SERVICE_BASE_URL", "http://localhost:5001", "Base URL pointing to the AI Gateway / FastAPI microservice."),
        ("SERVICE_KEY", "internal_erp_ai_service_key_2026", "Shared authentication key for inter-service REST calls."),
        ("OTP_ENABLED", "true", "Enables two-factor email One-Time Password verification on login."),
        ("OTP_TTL_SECONDS", "300", "Time-to-live validity window for generated 6-digit OTP codes (5 minutes)."),
        ("OTP_MAX_ATTEMPTS", "5", "Maximum permitted incorrect OTP attempts before locking the challenge."),
        ("OTP_RESEND_COOLDOWN_SECONDS", "30", "Minimum wait time enforced between consecutive OTP resend requests."),
        ("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/insighterp-notify", "HTTP endpoint for triggering n8n email automation workflows."),
        ("SMTP_HOST / SMTP_PORT", "smtp.gmail.com / 465", "SMTP mail server hostname and secure port configuration."),
        ("EMAIL_DRY_RUN", "false", "When true or SMTP_PASS unset, simulates email dispatch to stdout without crashing.")
    ]
    style_table(env_tbl, [Inches(2.2), Inches(2.0), Inches(2.1)])
    for vn, sv, desc in env_items:
        r = env_tbl.add_row()
        r.cells[0].paragraphs[0].text = vn
        r.cells[1].paragraphs[0].text = sv
        r.cells[2].paragraphs[0].text = desc

    add_section_heading(doc, "5.14", "Application Execution and Deployment")
    add_body_paragraph(
        doc,
        "System startup follows a strict dependency order to guarantee health availability: (1) Python FastAPI microservice (port 8001), "
        "(2) AI Gateway backend (port 5001), (3) Baymate standalone UI (port 5174), (4) ERP Express backend (port 5000), and (5) ERP Vite React "
        "frontend (port 5173). The startup sequence is automated via cross-platform scripts (start_demo.ps1 / start_demo.sh) which poll each "
        "service's /health endpoint before launching dependent tiers."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: INTEGRATION AND SYSTEM WORKFLOW
    # =========================================================================
    add_chapter_heading(doc, 6, "Integration and System Workflow")

    add_section_heading(doc, "6.1", "Introduction to Integration")
    add_body_paragraph(
        doc,
        "System integration represents the technical synthesis of autonomous subcomponents into a unified operational ecosystem. "
        "In the Student Retention Ecosystem, integration spans heterogeneous runtime environments (Node.js asynchronous event loops, "
        "Python scientific computing libraries, MongoDB BSON storage, and n8n webhook pipelines). This chapter analyzes integration "
        "protocols, data flow pipelines, and resolved engineering challenges."
    )

    add_section_heading(doc, "6.2", "Frontend and Backend Integration")
    add_body_paragraph(
        doc,
        "Frontend-backend communication is mediated through a centralized API service layer (api.js) utilizing Axios. An Axios request "
        "interceptor automatically injects the JWT bearer token into the Authorization header of every outgoing request. Response "
        "interceptors monitor HTTP status codes: if an HTTP 401 Unauthorized response is received, the interceptor purges expired local "
        "credentials and redirects the browser to the login view."
    )

    add_section_heading(doc, "6.3", "Backend and Database Integration")
    add_body_paragraph(
        doc,
        "The Express backend maintains persistent database connections using Mongoose connection pools. The db.js module monitors "
        "database connection states, handling reconnects automatically. When the database server is offline, getDBStatus() seamlessly "
        "redirects queries to CSV data providers and in-memory Map stores, ensuring that demo and evaluation environments remain fully "
        "operational without a local MongoDB service installation."
    )

    add_section_heading(doc, "6.4", "API Integration")
    add_body_paragraph(
        doc,
        "Internal API communication between the ERP gateway (port 5000) and the AI Gateway (port 5001) is secured via the X-Service-Key "
        "header. This prevents external clients from invoking internal microservice endpoints directly while allowing authorized ERP "
        "processes to query predictions, fetch institutional metrics, and relay meeting requests."
    )

    add_section_heading(doc, "6.5", "External Service Integration")
    add_body_paragraph(
        doc,
        "Notification workflows integrate the self-hosted n8n workflow engine. When a parent alert is triggered, notificationDispatcher.js "
        "sends an HTTP POST request to the n8n webhook URL with a shared secret header (X-Webhook-Secret) and a 5-second timeout. If the n8n "
        "daemon is unreachable or times out, the dispatcher automatically catches the error, engages direct Nodemailer SMTP fallback, "
        "and logs the delivery channel as 'smtp_fallback' in the audit collection."
    )

    add_section_heading(doc, "6.6", "Module Integration")
    add_body_paragraph(
        doc,
        "The modules interact through tightly coordinated event chains. For instance, when a student chats with the AI Academic Copilot "
        "and expresses academic difficulty, the copilot detects the meeting intent, generates an entry in ai_meeting_outbox, relays it via "
        "POST /api/integrations/meeting-requests, and ingests it into the mentor's inbox. The mentor's dashboard updates in real time, "
        "allowing the mentor to schedule a counseling slot, which in turn triggers an automated notification back to the student."
    )

    add_section_heading(doc, "6.7", "End-to-End Data Flow")
    add_body_paragraph(
        doc,
        "End-to-end data flow operates through four distinct phases: (1) Ingestion & Feature Normalization (assembling student attendance, "
        "GPA, and arrear trends), (2) Predictive Inference (FastAPI computes class probabilities and SHAP attributions), (3) Faculty Decision "
        "Support (rendering risk tiers and clinical note editing in the mentor UI), and (4) Automated Intervention (dispatching parent alerts "
        "via n8n and logging auditable event records)."
    )

    add_section_heading(doc, "6.8", "Complete Application Workflow")
    add_body_paragraph(
        doc,
        "The complete application workflow was verified through end-to-end demonstration scenarios. Faculty mentors log in via 2FA OTP, "
        "review their mentee cohort, select high-risk students, inspect attendance decay curves and live AI predictions, save clinical notes, "
        "and issue parent notifications with one click. Students track their attendance compliance against Anna University's 75% cutoff and "
        "engage with the Academic Copilot for 24/7 guidance."
    )

    add_section_heading(doc, "6.9", "Integration Challenges and Solutions")
    add_bullet_item(doc, "Development servers on ports 5173, 5174, 5000, and 5001 triggered browser CORS blocks. Resolved by configuring Express CORS middleware to dynamically validate origins against an authorized port list.", "1. Cross-Origin Resource Sharing (CORS)")
    add_bullet_item(doc, "If the Python microservice crashed or restarted, frontend calls to student dossiers suffered unhandled HTTP 500 crashes. Resolved by implementing a 5-second timeout circuit breaker that serves cached baseline metrics.", "2. Microservice Downtime & 500 Errors")
    add_bullet_item(doc, "Automated test suites executing 50+ rapid requests triggered the 10/min brute-force rate limiter. Resolved by introducing an automated skip: () => process.env.NODE_ENV === 'test' rule in rateLimiter.js.", "3. Test Suite Rate Throttling")
    add_bullet_item(doc, "Iterative UI edits risked breaking existing component layouts. Resolved by integrating an automated Babel AST logic freeze guard (npm run guard) verifying JSX AST trees against a pristine baseline.", "4. Frontend Layout Drift")

    doc.add_page_break()
