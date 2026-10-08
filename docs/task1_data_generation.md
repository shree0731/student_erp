# Task 1 Documentation: Rule-Based Synthetic Data Generation

## 1. Executive Summary & Problem Statement

Real institutional ERP data containing student academic transcripts, attendance logs, and socioeconomic backgrounds is strictly confidential and protected by student privacy regulations (FERPA, DPDP Act). Furthermore, in real institutions, student dropout is a **rare, minority-class event** (~5% to 18% in engineering colleges), which makes training and evaluating machine learning models difficult if datasets are either synthesized arbitrarily or generated hallucinated text via LLMs.

To build an explainable, research-grade Phase 1 prototype, we engineered a **parametric, rule-based synthetic data generator** (`scripts/generate_data.py`).

---

## 2. Why Rule-Based Simulation instead of Raw LLM Generation?

A common failure mode in academic projects is prompting an LLM to generate CSV rows. For an early-warning intervention system, LLM freeform generation has fatal limitations:

1. **Lack of Mathematical Provenance**: An LLM cannot guarantee that `overall_gpa` is mathematically the exact credit-weighted sum of `grade_point * credits / total_credits` across 30+ completed subjects.
2. **Correlation Hallucination**: LLMs often generate random combinations (e.g. a student with 98% attendance, 0 backlogs, 9.4 GPA flagged as "High Risk", or a student with 6 arrears and 45% attendance labeled "Low Risk").
3. **Distribution Uncontrollability**: LLMs tend to generate uniform or 50/50 balanced distributions, destroying the real-world minority-class imbalance (~15–20% high risk) required for valid ML training in Phase 2.
4. **Viva Explainability**: During academic review, an evaluator will ask: *"What mathematical formula defines the ground truth of your target variable?"* With rule-based generation, we have a clear, justifiable answer backed by equations and statistical distributions.

---

## 3. Modeling Architecture & Latent Traits

Rather than generating individual features independently, our simulation models each student using two fundamental **latent psychological and behavioral variables**:

$$\text{academic\_ability} \sim \mathcal{N}(0, 1)$$
$$\text{study\_engagement} \sim \mathcal{N}(0, 1)$$

These two underlying traits influence downstream behaviors consistently:
- **Attendance**: Driven primarily by `study_engagement`, with an environmental commute penalty for day scholars traveling $>25\text{ km}$.
- **Subject Marks**: Driven by a linear combination of `academic_ability` (60%), `study_engagement` (30%), subject difficulty, and stochastic exam-day variance (10%).
- **Consistency**: A struggling student demonstrates persistent subject-level difficulties across semesters, rather than erratic, uncorrelated spikes.

---

## 4. Differentiated Institutional Profiles

To simulate real-world Tamil Nadu engineering education dynamics, we modeled three distinct institutional environments:

### College 1 (`C101`): Easwari Engineering College (EEC, Ramapuram, Chennai)
- **Profile**: Urban autonomous college in a metropolitan center.
- **Demographics**: 68% Day Scholars relying on metropolitan public transit and personal vehicles; 32% Hostellers.
- **Academic Standard**: High cutoff distribution ($\mu = 182.0, \sigma = 9.5$).
- **Economic Background**: Log-normal income with median ₹5.5 Lakhs.

### College 2 (`C102`): Kongu Residential Institute of Technology (KRIT, Erode)
- **Profile**: Fully residential campus in western Tamil Nadu.
- **Demographics**: 92% Hostellers residing on campus; high proportion of first-generation learners (42%).
- **Academic Standard**: Moderate cutoff distribution ($\mu = 169.0, \sigma = 13.0$).
- **Economic Background**: Rural/semi-rural farming backgrounds (median income ₹2.9 Lakhs).

### College 3 (`C103`): Meenakshi Institute of Science & Technology (MIST, Madurai)
- **Profile**: Semi-urban engineering institution in southern Tamil Nadu.
- **Demographics**: Balanced 50% Day Scholars / 50% Hostellers.
- **Academic Standard**: Average cutoff distribution ($\mu = 166.0, \sigma = 14.5$), higher scholarship utilization.

---

## 5. Subject-Wise Assessment & Anna University Grading Formula

Each completed semester produces individual course rows in `marks.csv`.

### Continuous Internal Assessment (CIA) & External Exam
- Two internal CIA exams out of 50 each.
- Two assignments out of 10 each.
- End-semester external written examination out of 100.

### Weightage Formula:
$$\text{Internal}_{100} = ((\text{CIA}_1 + \text{CIA}_2) \times 0.8) + (\text{Ass}_1 + \text{Ass}_2)$$
$$\text{Total Marks} = (0.20 \times \text{Internal}_{100}) + (0.80 \times \text{External Marks})$$

### Passing & Grade Point Criterion:
- A student passes if $\text{Total Marks} \ge 50.0$ **AND** $\text{External Exam} \ge 45.0$.
- Passing grades earn 6 to 10 grade points. Arrears earn 0 grade points.

---

## 6. Composite Dropout Risk Metric & Calibrated Class Balance

The target variable `dropout_risk_label` is computed via a multi-factor risk index:

$$\text{Risk} = 0.38 \cdot \text{BacklogNorm} + 0.28 \cdot \text{GPADeficit} + 0.20 \cdot \text{AttendanceDeficit} + 0.07 \cdot \text{FinancialStress} + 0.07 \cdot \text{EngagementStress} + \epsilon$$

Where:
- $\text{BacklogNorm} = \min(1.0, \text{backlogs} / 4.0)$
- $\text{GPADeficit} = \max(0.0, (10.0 - \text{GPA}) / 6.0)$
- $\text{AttendanceDeficit} = \max(0.0, (100.0 - \text{attendance}) / 45.0)$
- $\epsilon \sim \mathcal{N}(0, 0.04)$ (unobserved personal factors)

### Calibrated Class Distribution:
- **Low Risk**: $4,788$ students (**66.50%**)
- **Medium Risk**: $1,148$ students (**15.94%**)
- **High Risk**: $1,264$ students (**17.56%**)

This directly achieves the **~15–20% minority class** requirement, ensuring realistic test conditions for the Phase 2 XGBoost/RandomForest models.
