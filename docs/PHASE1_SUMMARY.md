# Phase 1 Summary: Academic Dropout Prediction & Intervention System
*(Written for Project Evaluation, Viva Defense, and Academic Presentations)*

---

## 1. What Real-World Problem Does This Project Solve?

In engineering institutions across Tamil Nadu and India, student academic dropouts and prolonged degree delays are serious challenges. Often, colleges only realize a student is in trouble **after** they have failed multiple university examinations or stopped attending classes altogether—at which point intervention is difficult and expensive.

The goal of this project is to build an **Early Warning and Intervention ERP System** that detects warning signs—such as subtle attendance declines, low internal exam (CIA) performance, specific prerequisite course struggles, or commuting difficulties—**before** a student drops out. 

The system provides three synchronized perspectives:
1. **The Student**: Receives transparent visibility into their own attendance, grades, and upcoming intervention resources.
2. **The Faculty Mentor**: Gets an intelligent early-warning board that prioritizes which students in their advisory cohort need help, along with diagnostics on *which specific subjects* they are failing.
3. **The Institution Administrator**: Sees macro-level academic health trends across departments, years, and campus environments.

---

## 2. What Was Built in Phase 1?

Phase 1 focused on building a solid, working full-stack skeleton and credible baseline data:

1. **A Parametric Synthetic Data Engine (`/scripts/generate_data.py`)**:
   - Generates **~7,200 students** across 4 academic years and 4 key modern branches (**CSE, IT, AIDS, ECE**).
   - Simulates **three distinct Tamil Nadu institutional environments (2,000–3,000 students each)**:
     - **Easwari Engineering College (`C101` / EEC, Ramapuram, Chennai)**: An urban autonomous campus with ~68% day scholars commuting across Chennai.
     - **Kongu Residential Institute of Technology (`C102` / KRIT, Erode)**: A fully residential campus with ~92% hostellers and high first-generation learner representation.
     - **Meenakshi Institute of Science & Technology (`C103` / MIST, Madurai)**: A semi-urban college with balanced day scholar/hosteller demographics.
   - Generates **222 faculty mentors** and assigns each student to an advisor in their department (averaging ~32 mentees per mentor).
   - Generates **271,128 row-level subject assessment records** in `marks.csv`, tracking Assignments 1 & 2, CIA 1 & 2, external exam marks, total marks, grade points, and pass/arrear status for every completed course.
   - Includes a centralized course catalog (`data/curriculum.json`) covering all 14 engineering disciplines for future expansion.

2. **A MERN Backend Service (`/backend/`)**:
   - Built on **Node.js, Express, and MongoDB (via Mongoose)**.
   - Implements normalized schemas (`Student`, `Faculty`, `Marks`, `Curriculum`).
   - Powers REST endpoints for student search, student profile, subject-wise marks, mentor cohorts, and institutional analytics.
   - Uses a native **MongoDB `$facet` aggregation pipeline** to compute institutional KPIs in a single query.
   - Includes a high-speed batch seeder (`seedDb.js`) and an automatic fallback cache so the system runs smoothly even if MongoDB is temporarily offline.

3. **A Role-Based React Frontend (`/frontend/`)**:
   - Built using **React 18, Vite, and React Router**.
   - Features 5 comprehensive pages across the three roles:
     - `/login`: Role selector with one-click demo personas (Urban student, Residential student, Faculty mentor, Administrator).
     - `/student/dashboard`: Student view with attendance gauge, 6-month attendance trajectory chart, cumulative GPA, backlogs, and an expandable **AI Academic Advisor Chatbot Widget** (Phase 2 preview shell).
     - `/student/marks`: Interactive semester tabs showing subject-by-subject assessment scores.
     - `/mentor/dashboard`: Mentee risk board with search, filters (Risk level, Year of study, Low attendance <75%), and risk badges.
     - `/mentor/student/:id`: Diagnostic deep dive highlighting specific failed/weak subjects and an editable mentor counseling log.
     - `/admin/dashboard`: Institutional overview comparing urban vs. residential campuses and department distributions.

4. **Phase 2 Architectural Reservation (`/ml-service/`)**:
   - Reserved folder structure and documented technical contract for the upcoming Python ML microservice.

---

## 3. Why Is the Data Simulated Rather Than Real?

When evaluators ask: *"Why are you using synthetic data instead of real college ERP records?"*, the answer is twofold:

1. **Student Privacy and Compliance**: Institutional academic transcripts and personal socioeconomic records are protected confidential data (FERPA and the Digital Personal Data Protection Act). Real student records cannot be publicly hosted or redistributed in an academic repository.
2. **Why Rule-Based Simulation instead of Raw LLM Generation?**
   - Freeform generation from an LLM produces arbitrary numbers where GPA does not mathematically match subject marks, correlations are broken, and the target distribution is often an unrealistic 50/50 split.
   - Our simulation uses **mathematical latent parameters** (`academic_ability` and `study_engagement`). A student who is at-risk demonstrates consistent academic distress across related subjects.
   - Furthermore, we calibrated our risk index so that High Dropout Risk forms an authentic **~17.5% minority class** (1,264 out of 7,200 students). Real dropouts are a minority class, and this realistic imbalance is essential for training valid machine learning models in Phase 2.

---

## 4. What Is Planned for Phase 2?

Now that the complete skeleton, data foundation, and user workflows are verified, Phase 2 will implement the intelligent components:

1. **Python Machine Learning Microservice (`FastAPI`)**:
   - Train **XGBoost, Random Forest, and LightGBM** models using `scikit-learn` and `imbalanced-learn` (SMOTE).
   - Replace the baseline heuristic risk formula with live machine learning predictions.
   - Implement **SHAP (SHapley Additive exPlanations)** to provide faculty mentors with the exact top 3 reasons why a specific student is at risk (e.g. *"Attendance dropped by 18% over 3 months; 2 prerequisite math failures"*).
2. **Contextual AI Chatbot for Students**:
   - Connect the chatbot widget on the student dashboard to an LLM agent with access to the student's academic standing.
   - Provide empathetic guidance: suggesting remedial study sessions, connecting students with mentors, and explaining re-examination schedules.
3. **Automated Faculty Alerts & Actionable Interventions**:
   - Automated notification triggers when a student's attendance drops below 75% or when continuous internal assessment (CIA) scores drop before final exams.
