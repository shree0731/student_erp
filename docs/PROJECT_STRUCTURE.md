# Project Structure: ERP (Student Retention & Intervention System)

```
FSD/
├── backend/                           # Express & Node.js backend REST API (Port 5000)
│   ├── config/
│   │   └── db.js                      # Mongoose MongoDB connection & fallback detection
│   ├── controllers/
│   │   ├── adminController.js         # MongoDB Aggregation Pipeline ($facet, $group)
│   │   ├── facultyController.js       # Mentor mentee retrieval and faculty endpoints
│   │   ├── integrationController.js   # Ingests meeting requests from AI microservice with Zod validation
│   │   ├── meetingRequestController.js# Role-scoped meeting requests (mentor triage, student read-only)
│   │   └── studentController.js       # Student filtering, pagination, and marks lookup
│   ├── middleware/
│   │   ├── auth.js                    # JWT verification and RBAC roles (student, mentor, admin)
│   │   └── serviceKeyAuth.js          # Timing-safe ERP_SERVICE_API_KEY authentication for service calls
│   ├── models/
│   │   ├── Curriculum.js              # Course catalog schema across engineering branches
│   │   ├── Faculty.js                 # Faculty mentor schema with experience and college ID
│   │   ├── Marks.js                   # Continuous assessment (CIA) and exam marks schema
│   │   ├── MeetingRequest.js          # Ingested counseling and mentor consultation records
│   │   └── Student.js                 # Student schema (rollups, monthly attendance array, demographics)
│   ├── routes/
│   │   └── api.js                     # REST endpoint definitions (auth, students, faculty, integrations)
│   ├── scripts/
│   │   ├── check-env.js               # Startup environment integrity check (required keys, no placeholders)
│   │   └── seedDb.js                  # Batch seeder importing CSV/JSON files into MongoDB
│   ├── services/
│   │   └── aiServiceClient.js         # HTTP client proxying predictions to standalone AI service (Port 5001)
│   ├── tests/                         # Supertest & Jest test suites
│   ├── .env                           # Server environment variables (PORT, JWT_SECRET, API keys)
│   ├── .env.example                   # Sanitized configuration template with required variables
│   ├── package.json                   # Node.js dependencies (express, mongoose, zod, cors)
│   └── server.js                      # Express application entry point (http://localhost:5000)
│
├── frontend/                          # React + Vite Single Page Application (Port 5173)
│   ├── public/                        # Static web assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatbotWidget.jsx      # Expandable AI Academic Advisor widget
│   │   │   ├── Navbar.jsx             # Top sticky navbar with active role badge and persona switcher
│   │   │   ├── ParentAlertModal.jsx   # Manual communication draft template with clipboard copy
│   │   │   └── Sidebar.jsx            # Role-aware navigation links including Meeting Requests
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Demo persona state with instant one-click role switching
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx # Multi-campus analytics, risk charts, and branch health
│   │   │   ├── mentor/
│   │   │   │   ├── MentorDashboard.jsx# Assigned mentees table + Meeting Requests triage drawer
│   │   │   │   └── StudentDetail.jsx  # Student diagnostic dossier, weak subjects, & notes log
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx# Attendance %, GPA, backlogs, mentor card, & meeting request status
│   │   │   │   └── StudentMarks.jsx   # Semester tabs, CIA 1/2, assignments, external exam marks
│   │   │   └── Login.jsx              # Role selector and sample persona launcher
│   │   ├── services/
│   │   │   └── api.js                 # REST client communicating with Express backend
│   │   ├── styles/
│   │   │   └── index.css              # ERP design system (badges, tables, cards, responsive layout)
│   │   ├── App.jsx                    # React Router configuration across pages
│   │   └── main.jsx                   # React DOM root render
│   ├── index.html                     # HTML root template
│   ├── package.json                   # React dependencies (react, react-router-dom, lucide-react, vite)
│   └── vite.config.js                 # Vite build configuration with backend API proxy
│
├── data/                              # Simulated datasets and static curriculum lookups
│   ├── curriculum.json                # Complete catalog of branches across Semesters 1 to 8
│   ├── faculty.csv                    # Faculty mentors across colleges and departments
│   ├── marks.csv                      # Assessment records for completed courses
│   └── students.csv                   # Student records with demographics, attendance, rollups, & risk
│
├── scripts/                           # Data generation and pipeline scripts
│   ├── build_curriculum.py            # Generates data/curriculum.json applying credit and lab rules
│   └── generate_data.py               # Parametric simulation engine with latent traits
│
└── docs/                              # Technical documentation and governance guides
    ├── ATTRIBUTIONS.md                # Media licensing and icon provenance
    ├── CHATBOT_CONTEXT_ARCHITECTURE.md# Context grounding and safety escalation design
    ├── ML_MODEL_TRAINING.md           # Model methodology and evaluation benchmarks
    ├── PROJECT_STRUCTURE.md           # Annotated codebase directory tree
    └── security.md                    # Threat model, fail-closed guards, and parental communication policy
```
