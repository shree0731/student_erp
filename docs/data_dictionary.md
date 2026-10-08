# Data Dictionary: Student Academic Dropout Prediction & Intervention System

This document catalogs every attribute across the 4 generated data assets in `/data/`:
1. `curriculum.json` (Static institutional curriculum lookup table)
2. `faculty.csv` (Faculty mentor dataset)
3. `students.csv` (Student demographic, academic, and behavioral features)
4. `marks.csv` (Granular subject-wise assessment marks records)

---

## 1. `curriculum.json` (Curriculum Lookup)

A static institutional course catalog defining academic structures across all 14 engineering disciplines for Semesters 1 through 8.

| Attribute | Data Type | Value Domain / Example | Generation Logic / Academic Significance |
|---|---|---|---|
| `Subject` | String | e.g. `"Operating Systems"`, `"Data Structures Laboratory"` | Formal title of course per Anna University syllabus. |
| `Subject_Type` | String | `"Theory"`, `"Laboratory"`, `"Project"`, `"Internship"` | Classification: Theory and Projects drive academic dropout risk; Laboratories are tracked separately with experiential grading. |
| `Credits` | Integer | 2, 3, 4, 6, 10 | **Credit Assignment Rule**: 1st-year foundational Math/Physics/Chem = 4 credits; Core/Elective Theory = 3 credits; Laboratories = 2 credits; Mini Project = 2 credits; Project Work Phase I = 6 credits; Project Work Phase II / Major Project = 10 credits; Internship = 2 credits. |
| `Semester` | Integer | 1 to 8 | The academic semester in which the course is scheduled. |
| `Branch` | String | `"CSE"`, `"ECE"`, `"IT"`, `"AIDS"`, etc. | Engineering discipline code. |

**Laboratory Generation Rule**:
- CSE contains explicit industry/ABET laboratory courses (Engineering Practices, Data Structures, DBMS, OS, Java, Networks, Web Tech, ML/Cloud).
- For all other branches, laboratory entries are programmatically derived using the rule `"<core theory subject of that semester> Laboratory"` for Semesters 1–6 (2 credits each).

---

## 2. `faculty.csv` (Mentor Dataset)

Catalog of ~222 academic advisors and faculty mentors assigned to guide students across the three institutions.

| Attribute | Data Type | Value Domain / Example | Generation Logic / Meaning |
|---|---|---|---|
| `faculty_id` | String | e.g. `"FAC_EEC_CSE_001"` | Unique alphanumeric identifier composed of prefix, college code, department, and sequential index. |
| `name` | String | e.g. `"Dr. Kavitha Ramanathan"` | Faculty name sampled from authentic Tamil Nadu academic naming distributions. |
| `department` | String | `"CSE"`, `"IT"`, `"AIDS"`, `"ECE"` | Academic department to which the faculty belongs. |
| `designation` | String | `"Assistant Professor"`, `"Associate Professor"`, `"Professor"` | Sampled with ~60% Assistant Professors, 25% Associate Professors, 15% Full Professors. |
| `email` | String | e.g. `"kavitha.ram@eec.edu.in"` | Institutional email address. |
| `years_of_experience`| Integer | 2 to 30 years | Derived according to designation tier (Asst: 2–8, Assoc: 9–16, Prof: 17–30). |
| `college_id` | String | `"C101"`, `"C102"`, `"C103"` | Foreign key linking faculty to their employing institution. |
| `assigned_students_count` | Integer | 10 to 58 (mean ~32) | Count of assigned student mentees, reflecting realistic non-uniform departmental mentor distributions. |

---

## 3. `students.csv` (Student Profiles & Risk Labels)

Contains 7,200 student records across 4 academic years and 3 distinct collegiate environments.

### Institutional & Academic Identifiers
| Attribute | Data Type | Domain / Example | Generation Logic |
|---|---|---|---|
| `student_id` | String | e.g. `"STU_EEC_CSE_Y2_0142"` | Unique primary key incorporating college code, department, year of study, and serial. |
| `student_name` | String | e.g. `"Aravind Sundaram"` | Sampled from gender-aligned regional names. |
| `college_id` | String | `"C101"`, `"C102"`, `"C103"` | Identifies institution. |
| `college_name` | String | Easwari Eng. / Kongu Res. / Meenakshi Inst. | Full college name. |
| `department` | String | `"CSE"`, `"IT"`, `"AIDS"`, `"ECE"` | Branch of study: weighted ~35% CSE, 31% IT, 24% AIDS, 10% ECE. |
| `year_of_study` | Integer | 1 to 4 | Current academic year. |
| `current_semester` | Integer | 2, 4, 6, 8 | Even-semester academic cycle (`year_of_study * 2`). |
| `section` | String | `"A"`, `"B"`, `"C"` | Section cohort (~60 students per section). |
| `mentor_id` | String | Foreign key to `faculty.csv` | Exact 1:1 mentor mapping within the same college and department. |

### Demographics & Socioeconomic Profile
| Attribute | Data Type | Domain / Example | Generation Logic |
|---|---|---|---|
| `gender` | String | `"Male"`, `"Female"` | Sampled at ~52% Male, 48% Female. |
| `community` | String | `"OC"`, `"BC"`, `"MBC"`, `"SC"`, `"ST"` | Sampled reflecting Tamil Nadu reservation proportions: OC 15%, BC 46%, MBC 24%, SC 12%, ST 3%. |
| `first_gen_learner` | Integer | `0` or `1` | Differentiated by campus: Urban (EEC) 18%, Residential (KRIT) 42%, Semi-Urban (MIST) 35%. |
| `family_income_annual`| Integer | ₹80,000 to ₹3,500,000 | Log-normal distribution parameterized by college type (Urban median: ₹5.5L; Residential median: ₹2.9L; Semi-Urban median: ₹3.2L). |
| `hosteller` | Integer | `0` (Day Scholar) or `1` (Hosteller) | Campus living mode: Urban 32% hostellers; Residential 92% hostellers; Semi-Urban 50% hostellers. |
| `distance_from_home_km`| Float | 2.0 to 450.0 km | Day scholars: ~14–18 km commute; Hostellers: ~160–240 km distance from home district. |

### Admission Profile
| Attribute | Data Type | Domain / Example | Generation Logic |
|---|---|---|---|
| `admission_quota` | String | `"Government"`, `"Management"` | ~68% TNEA Government quota, 32% Management quota. |
| `cutoff_mark_200` | Float | 110.0 to 199.5 | TNEA cutoff out of 200. Urban EEC has higher cutoff (mean 182), Management quota receives ~5–15 point penalty. |

### Attendance & Engagement Behavioral Signals
| Attribute | Data Type | Domain / Example | Generation Logic |
|---|---|---|---|
| `attendance_pct` | Float | 52.0% to 99.0% | Derived from student latent engagement + day-scholar commute friction penalty + random noise. |
| `monthly_attendance_trend` | JSON Array (string) | e.g. `"[84.2, 82.0, 78.5, 74.0, 70.2, 66.5]"` | Sequence of last 6 monthly attendance values. At-risk students exhibit clear decaying trends over time. |
| `low_attendance_flag` | Integer | `0` or `1` | Regulatory Anna University alert: `1` if `attendance_pct < 75.0%`, else `0`. |
| `mentor_meetings_attended`| Integer | 0 to 6 | Frequency of voluntary or scheduled advisory sessions attended per semester. |
| `scholarship` | Integer | `0` or `1` | Indicates government or institutional tuition fee waiver. |
| `extracurricular_score` | Float | 10.0 to 95.0 | Points awarded for club participation, sports, NSS/YRC, and hackathons. |
| `library_usage_score` | Float | 5.0 to 95.0 | Derived from digital repository logins and physical library footfalls. |

### Senior Placement Signals (Years 3 & 4)
| Attribute | Data Type | Domain / Example | Generation Logic |
|---|---|---|---|
| `placement_training_score`| Float | 0.0 to 98.0 | Mock technical/aptitude assessment score. Set to 0.0 for 1st/2nd years. |
| `internship_done` | Integer | `0` or `1` | Industrial internship completion status. |

### Performance Rollups (Derived directly from `marks.csv`)
| Attribute | Data Type | Domain / Example | Generation Logic |
|---|---|---|---|
| `overall_gpa` | Float | 0.0 to 10.0 | Exact credit-weighted grade point average across all completed course credits in `marks.csv`. |
| `backlogs_count` | Integer | 0 to 12 | Active uncleared course arrears (`result == "Arrear"`). |
| `arrears_cleared` | Integer | 0 to 6 | Historic arrears successfully cleared in subsequent attempts. |

### Target Labels
| Attribute | Data Type | Domain / Example | Generation Logic |
|---|---|---|---|
| `dropout_risk_score` | Float | 0.0 to 1.0 | Weighted composite risk index based on backlogs, GPA deficit, attendance deficit, financial stress, and engagement deficit. |
| `dropout_risk_label` | String | `"High"`, `"Medium"`, `"Low"` | Calibrated risk categorization: **High (17.56%)**, **Medium (15.94%)**, **Low (66.50%)** ensuring an authentic minority-class target for Phase 2 ML training. |

---

## 4. `marks.csv` (Subject-Wise Assessment Records)

Contains 271,128 row-level assessment records for every completed course per student.

| Attribute | Data Type | Range / Example | Formula / Generation Rule |
|---|---|---|---|
| `student_id` | String | Foreign key to `students.csv` | Links record to individual student. |
| `semester` | Integer | 1 to 8 | Semester during which examination occurred. |
| `subject_name` | String | e.g. `"Operating Systems"` | Course title from `curriculum.json`. |
| `subject_type` | String | `"Theory"`, `"Laboratory"`, `"Project"`, `"Internship"` | Category of course. |
| `credits` | Integer | 2 to 10 | Course credit weighting. |
| `assignment_1_marks` | Float | 2.0 to 10.0 | Continuous internal assignment 1 (out of 10). |
| `assignment_2_marks` | Float | 2.0 to 10.0 | Continuous internal assignment 2 (out of 10). |
| `internal_exam_1_marks` | Float | 10.0 to 50.0 | Continuous Internal Assessment 1 (CIA 1, out of 50). |
| `internal_exam_2_marks` | Float | 10.0 to 50.0 | Continuous Internal Assessment 2 (CIA 2, out of 50). |
| `external_exam_marks` | Float | 20.0 to 100.0 | End-Semester University Examination mark (out of 100). |
| `total_marks` | Float | 20.0 to 100.0 | **Defined Weightage Formula**:<br>`Internal_100 = ((CIA1 + CIA2) * 0.8) + (Ass1 + Ass2)`<br>`Total_Marks = (0.20 * Internal_100) + (0.80 * External_Marks)` |
| `grade_point` | Integer | 0, 6, 7, 8, 9, 10 | **Anna University 10-Point Grading Scale**:<br>$\ge 90 \to 10$ (O)<br>$80-89 \to 9$ (A+)<br>$70-79 \to 8$ (A)<br>$60-69 \to 7$ (B+)<br>$50-59 \to 6$ (B)<br>$< 50$ or External $< 45 \to 0$ (U/Arrear) |
| `result` | String | `"Pass"`, `"Arrear"` | `"Pass"` if `total_marks >= 50.0` AND `external_exam_marks >= 45.0`, else `"Arrear"`. |
