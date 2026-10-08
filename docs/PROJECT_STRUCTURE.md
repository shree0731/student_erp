# Project Structure: Student Academic Dropout Prediction & Intervention System

```
FSD/
├── backend/                           # Express & Node.js backend REST API
│   ├── config/
│   │   └── db.js                      # Mongoose MongoDB connection & fallback detection
│   ├── controllers/
│   │   ├── adminController.js         # MongoDB Aggregation Pipeline ($facet, $group)
│   │   ├── facultyController.js       # Mentor mentee retrieval and faculty endpoints
│   │   └── studentController.js       # Student filtering, pagination, and marks lookup
│   ├── models/
│   │   ├── Curriculum.js              # Course catalog schema across 14 engineering branches
│   │   ├── Faculty.js                 # Faculty mentor schema with experience and college ID
│   │   ├── Marks.js                   # Subject-level continuous assessment and exam marks schema
│   │   └── Student.js                 # Student schema (rollups, monthly attendance array, demographics)
│   ├── routes/
│   │   └── api.js                     # REST endpoint definitions (/api/students, /faculty, /admin)
│   ├── scripts/
│   │   └── seedDb.js                  # Fast batch seeder importing CSV/JSON files into MongoDB
│   ├── utils/
│   │   └── csvDataProvider.js         # Zero-config in-memory fallback loader when Mongo is offline
│   ├── .env                           # Server environment variables (PORT, MONGO_URI)
│   ├── package.json                   # Node.js dependencies (express, mongoose, cors, csv-parser)
│   └── server.js                      # Main Express application entry point (http://localhost:5000)
│
├── frontend/                          # React + Vite Single Page Application
│   ├── public/                        # Static web assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatbotWidget.jsx      # Expandable AI Academic Advisor widget (Phase 2 preview shell)
│   │   │   ├── Navbar.jsx             # Top sticky navbar with active role badge and persona switcher
│   │   │   └── Sidebar.jsx            # Role-aware navigation links for Student, Mentor, and Admin
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Demo persona state with instant one-click role switching
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx # Multi-campus analytics, risk charts, and branch health
│   │   │   ├── mentor/
│   │   │   │   ├── MentorDashboard.jsx# Assigned mentees table with risk badges and search/filter
│   │   │   │   └── StudentDetail.jsx  # Student diagnostic dossier, weak subjects, & notes log
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx# Attendance %, 6-month trend, GPA, backlogs, mentor card
│   │   │   │   └── StudentMarks.jsx   # Semester tabs, CIA 1/2, assignments, external exam marks
│   │   │   └── Login.jsx              # Role selector and sample persona launcher for evaluations
│   │   ├── services/
│   │   │   └── api.js                 # REST client communicating with Express backend
│   │   ├── styles/
│   │   │   └── index.css              # ERP design system (badges, tables, cards, responsive layout)
│   │   ├── App.jsx                    # React Router configuration across all 5+ pages
│   │   └── main.jsx                   # React DOM root render
│   ├── index.html                     # HTML root template with Plus Jakarta Sans typography
│   ├── package.json                   # React dependencies (react, react-router-dom, lucide-react, vite)
│   └── vite.config.js                 # Vite build configuration with backend API proxy
│
├── data/                              # Simulated datasets and static curriculum lookups
│   ├── curriculum.json                # Complete catalog of all 14 branches across Semesters 1 to 8
│   ├── faculty.csv                    # ~222 faculty mentors across 3 colleges and 4 departments
│   ├── marks.csv                      # 271,128 row-level assessment records for completed courses
│   └── students.csv                   # ~7,200 students with demographics, attendance, rollups, & risk
│
├── scripts/                           # Data generation and pipeline scripts
│   ├── build_curriculum.py            # Generates data/curriculum.json applying credit and lab rules
│   └── generate_data.py               # Parametric rule-based simulation engine with latent traits
│
├── ml-service/                        # Phase 2 Machine Learning Microservice reservation
│   └── README.md                      # FastAPI blueprint, XGBoost/SHAP contract, and SMOTE roadmap
│
└── docs/                              # Technical documentation and viva explanation guides
    ├── architecture_note.md           # Rationale for dual Node.js/Express + Python/FastAPI services
    ├── backend_setup.md               # Step-by-step setup for Node, MongoDB (local/Atlas), and seeding
    ├── data_dictionary.md             # Complete attribute catalog across all 4 datasets
    ├── PHASE1_SUMMARY.md              # Viva defense script in plain language for project evaluators
    ├── PROJECT_STRUCTURE.md           # This annotated codebase directory tree
    ├── task1_data_generation.md       # In-depth explanation of simulation design and risk formulas
    ├── task2_frontend.md              # Architecture of React frontend and role-based UX
    └── task3_backend.md               # MongoDB schema design, normalization, & aggregation pipelines
```
