# Task 2 Documentation: Frontend Architecture & Role-Based Navigation

## 1. Architectural Strategy

The frontend is built using **React 18 and Vite**, configured as a high-performance Single Page Application (SPA). It provides a responsive institutional ERP portal with three distinct role-based perspectives:

```
                          ┌───────────────────────────┐
                          │    /login (Role Switch)   │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           ▼                            ▼                           ▼
┌─────────────────────┐      ┌─────────────────────┐     ┌─────────────────────┐
│    Student View     │      │     Mentor View     │     │     Admin View      │
├─────────────────────┤      ├─────────────────────┤     ├─────────────────────┤
│ /student/dashboard  │      │ /mentor/dashboard   │     │ /admin/dashboard    │
│ /student/marks      │      │ /mentor/student/:id │     │                     │
└─────────────────────┘      └─────────────────────┘     └─────────────────────┘
```

---

## 2. Directory Layout & Separation of Concerns

```
/frontend/src/
├── components/
│   ├── Navbar.jsx         # Sticky navigation, role indicators, and quick persona switcher
│   ├── Sidebar.jsx        # Role-aware navigation links and Phase 1 context
│   └── ChatbotWidget.jsx  # Expandable AI Academic Advisor widget (Phase 2 UI placeholder)
├── context/
│   └── AuthContext.jsx    # Persona state management with instant switching for demonstrations
├── pages/
│   ├── Login.jsx          # Interactive role and institution persona launcher
│   ├── student/
│   │   ├── StudentDashboard.jsx # Attendance gauge, 6-mo trend, GPA, backlogs, mentor card
│   │   └── StudentMarks.jsx     # Semester-by-semester CIA, internal, external exam marks
│   ├── mentor/
│   │   ├── MentorDashboard.jsx  # Filterable mentee risk board with search and attendance flags
│   │   └── StudentDetail.jsx    # Deep-dive diagnostics, weak subjects table, mentor notes log
│   └── admin/
│       └── AdminDashboard.jsx   # Multi-campus comparative KPIs, department risk breakdowns
├── services/
│   └── api.js             # REST client communicating with Express backend with mock fallback
└── styles/
    └── index.css          # ERP design system (typography, badges, data tables, SVG charts)
```

---

## 3. Page Specifications & Pedagogical Highlights

### 1. `/login` (Role & Institution Persona Selector)
- Provides immediate one-click access to sample personas without requiring authentication hardening (per Phase 1 Non-Goals).
- Sample personas include:
  - **At-Risk Student** (`STU_EEC_CSE_Y2_0001` - Easwari Engineering College): Demonstrates high dropout risk, active backlogs, and declining attendance.
  - **Good Standing Student** (`STU_KRIT_IT_Y3_3645` - Kongu Residential Campus): Demonstrates low risk and clean academic sheet.
  - **CSE Mentor** (`FAC_EEC_CSE_001` - Dr. Kavitha Ramanathan): Mentoring 32 students in urban engineering college.
  - **Institutional Administrator**: Monitoring consolidated analytics across all colleges.

### 2. `/student/dashboard` (Student Personal Perspective)
- **Attendance Gauge**: Highlights overall attendance, displaying a statutory alert badge if below the 75% examination threshold.
- **6-Month Attendance Trajectory**: Visual chart tracking month-by-month presence, illustrating attendance decay patterns for at-risk students.
- **GPA & Backlogs**: Transparently displays cumulative Anna University credit-weighted GPA and active backlogs.
- **AI Academic Advisor Placeholder**: Expandable floating chatbot widget with prompt chips and Phase 2 status badges.

### 3. `/student/marks` (Subject-Wise Assessment Breakdown)
- Organized with interactive semester tabs (Semester 1, Semester 2, etc.).
- Displays full continuous assessment metrics:
  - Two assignments (out of 10 each)
  - Two CIA internal exams (out of 50 each)
  - University external examination (out of 100)
  - Computed total marks (20% internal + 80% external)
  - Grade points (0 to 10) and Pass/Arrear status.

### 4. `/mentor/dashboard` (Faculty Mentoring Board)
- Comprehensive table of assigned students with risk indicators (High/Medium/Low badges).
- Filterable by:
  - Risk Level (High Risk Only, Medium, Low)
  - Year of Study (1st, 2nd, 3rd, 4th year)
  - Statutory Attendance Alerts (<75% only)
- Real-time search by student name or registration number.

### 5. `/mentor/student/:id` (Mentee Diagnostic & Weak Subject Analyzer)
- Detailed student background: living mode (Hosteller vs. Day Scholar), travel distance, first-generation status, admission cutoff.
- **Weak Subject Diagnostic**: Automatically isolates subjects in the most recent semester where the student failed or scored below 55%, showing the faculty mentor exactly which courses require remediation.
- **Interactive Mentor Notes**: An editable intervention notes log allowing faculty to record counseling conversations and action plans, persisting in local browser state for viva demonstrations.

### 6. `/admin/dashboard` (Central Institutional Analytics)
- High-level KPIs: Total students (7,200), average GPA, average attendance, total backlogs.
- **Risk Stratification**: Confirms calibrated class balance (~17.5% High Risk minority class).
- **Multi-Campus Comparison**: Direct comparative analysis between Easwari Engineering (Urban), Kongu Residential (Residential), and Meenakshi Institute (Semi-Urban).
- **Departmental Matrix**: Breakdown across CSE, IT, AIDS, and ECE.
